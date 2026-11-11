import { NextRequest } from 'next/server'
import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import {
  getR2Client,
  inferMimeTypeFromFilename,
  isR2Configured,
  normalizeR2ObjectKey,
  parseByteRange,
} from '@/lib/storage/r2'

export const runtime = 'nodejs'

const CACHE_CONTROL_HEADER = 'public, max-age=31536000, immutable'

function resolveContentType(objectKey: string, s3ContentType?: string): string {
  const normalized = s3ContentType?.trim()
  if (normalized && normalized !== 'application/octet-stream') {
    return normalized
  }
  return inferMimeTypeFromFilename(objectKey)
}

function buildCommonHeaders({
  contentType,
  etag,
  contentLength,
}: {
  contentType: string
  etag?: string
  contentLength?: number
}): Headers {
  const headers = new Headers()
  headers.set('Content-Type', contentType)
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Cache-Control', CACHE_CONTROL_HEADER)
  headers.set('X-Content-Type-Options', 'nosniff')

  if (etag) {
    headers.set('ETag', etag)
  }
  if (typeof contentLength === 'number' && Number.isFinite(contentLength) && contentLength >= 0) {
    headers.set('Content-Length', String(contentLength))
  }
  return headers
}

function getErrorStatusCode(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined
  const record = err as { $metadata?: { httpStatusCode?: number } }
  return record.$metadata?.httpStatusCode
}

function getErrorName(err: unknown): string {
  if (!err || typeof err !== 'object') return ''
  return String((err as { name?: unknown }).name || '')
}

function handleR2Error(err: unknown, objectKey: string): Response {
  const statusCode = getErrorStatusCode(err)
  const name = getErrorName(err)

  if (statusCode === 304 || name === 'NotModified') {
    return new Response(null, { status: 304 })
  }

  if (statusCode === 404 || name === 'NoSuchKey' || name === 'NotFound') {
    return new Response('Media not found', { status: 404 })
  }

  if (name === 'AbortError') {
    return new Response(null, { status: 499 })
  }

  console.error(`Error proxying R2 media "${objectKey}":`, err)
  return new Response('Failed to retrieve media from storage', { status: 500 })
}

function toWebReadableStream(body: unknown): ReadableStream<Uint8Array> | null {
  if (!body || typeof body !== 'object') return null
  const candidate = body as { transformToWebStream?: () => ReadableStream<Uint8Array> }
  if (typeof candidate.transformToWebStream === 'function') {
    return candidate.transformToWebStream()
  }
  if (body instanceof ReadableStream) {
    return body
  }
  return null
}

export async function HEAD(
  req: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  if (!isR2Configured()) {
    return new Response('Storage is not configured', { status: 503 })
  }

  const { key } = await context.params
  const objectKey = normalizeR2ObjectKey(key)
  if (!objectKey) {
    return new Response('Invalid media path', { status: 400 })
  }

  try {
    const client = getR2Client()
    const bucket = process.env.R2_BUCKET_NAME || ''
    const head = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: objectKey }),
      { abortSignal: req.signal }
    )

    const headers = buildCommonHeaders({
      contentType: resolveContentType(objectKey, head.ContentType),
      etag: head.ETag,
      contentLength: head.ContentLength,
    })

    return new Response(null, { status: 200, headers })
  } catch (err) {
    return handleR2Error(err, objectKey)
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  if (!isR2Configured()) {
    return new Response('Storage is not configured', { status: 503 })
  }

  const { key } = await context.params
  const objectKey = normalizeR2ObjectKey(key)
  if (!objectKey) {
    return new Response('Invalid media path', { status: 400 })
  }

  const client = getR2Client()
  const bucket = process.env.R2_BUCKET_NAME || ''
  const rangeHeader = req.headers.get('range')

  try {
    if (rangeHeader && rangeHeader.trim().toLowerCase().startsWith('bytes=')) {
      const head = await client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: objectKey }),
        { abortSignal: req.signal }
      )
      const totalSize = head.ContentLength ?? 0
      const parsed = parseByteRange(rangeHeader, totalSize)

      if (parsed.type === 'invalid') {
        return new Response(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${totalSize}`,
            'Accept-Ranges': 'bytes',
          },
        })
      }

      if (parsed.type === 'partial') {
        const chunk = await client.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: objectKey,
            Range: `bytes=${parsed.start}-${parsed.end}`,
          }),
          { abortSignal: req.signal }
        )

        const stream = toWebReadableStream(chunk.Body)
        if (!stream) {
          return new Response('Empty media stream', { status: 500 })
        }

        const chunkLength = parsed.end - parsed.start + 1
        const headers = buildCommonHeaders({
          contentType: resolveContentType(objectKey, chunk.ContentType || head.ContentType),
          etag: chunk.ETag || head.ETag,
          contentLength: chunkLength,
        })
        headers.set('Content-Range', `bytes ${parsed.start}-${parsed.end}/${totalSize}`)

        return new Response(stream, { status: 206, headers })
      }
    }

    const ifNoneMatch = req.headers.get('if-none-match') || undefined
    const object = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        IfNoneMatch: ifNoneMatch,
      }),
      { abortSignal: req.signal }
    )

    const stream = toWebReadableStream(object.Body)
    if (!stream) {
      return new Response('Empty media stream', { status: 500 })
    }

    const headers = buildCommonHeaders({
      contentType: resolveContentType(objectKey, object.ContentType),
      etag: object.ETag,
      contentLength: object.ContentLength,
    })

    return new Response(stream, { status: 200, headers })
  } catch (err) {
    return handleR2Error(err, objectKey)
  }
}
