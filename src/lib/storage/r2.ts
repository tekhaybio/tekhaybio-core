import { S3Client } from '@aws-sdk/client-s3'

/**
 * Returns the normalized Cloudflare R2 S3 API endpoint.
 * Prefers R2_ENDPOINT if provided; otherwise derives from R2_ACCOUNT_ID.
 */
export function getR2Endpoint(): string {
  if (process.env.R2_ENDPOINT) {
    return process.env.R2_ENDPOINT.replace(/\/$/, '')
  }
  if (process.env.R2_ACCOUNT_ID) {
    return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  }
  return ''
}

/**
 * Returns the public URL base for Cloudflare R2 files.
 * If R2_PUBLIC_URL is configured (e.g. https://pub-xxx.r2.dev or custom domain),
 * it returns that base. Otherwise falls back to empty string.
 */
export function getR2PublicUrl(): string {
  if (process.env.R2_PUBLIC_URL) {
    return process.env.R2_PUBLIC_URL.replace(/\/$/, '')
  }
  return ''
}

/**
 * Checks if Cloudflare R2 is configured via environment variables.
 */
export function isR2Configured(): boolean {
  const hasEndpoint = Boolean(process.env.R2_ENDPOINT || process.env.R2_ACCOUNT_ID)
  const hasCredentials = Boolean(
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  )
  return hasEndpoint && hasCredentials
}

/**
 * Infers common MIME type from a file name extension.
 */
export function inferMimeTypeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    ogg: 'video/ogg',
    mkv: 'video/x-matroska',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    avif: 'image/avif',
  }
  return map[ext] || 'application/octet-stream'
}

let _r2Client: S3Client | null = null

/**
 * Returns a cached singleton S3Client configured for Cloudflare R2.
 * Cloudflare R2 requires forcePathStyle: true because bucket subdomains are not configured on r2.cloudflarestorage.com.
 * Disabling default CRC32 checksum calculation is also required to avoid presigned URL checksum mismatches.
 */
export function getR2Client(): S3Client {
  if (!_r2Client) {
    _r2Client = new S3Client({
      region: 'auto',
      endpoint: getR2Endpoint(),
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    })
  }
  return _r2Client
}

/**
 * Maximum byte range size per 206 Partial Content response from the Next.js R2 proxy.
 * Keeping each chunk <= 2 MB ensures video streaming stays well under serverless response limits
 * while allowing instant HTML5 video seeking and first-frame preview.
 */
export const MAX_PROXY_RANGE_BYTES = 2 * 1024 * 1024

/**
 * Determines whether R2 media URLs should be proxied through the Next.js `/api/r2/...` route.
 * Default Cloudflare `*.r2.dev` public buckets are frequently DNS-blocked by Indonesian ISPs,
 * and `*.r2.cloudflarestorage.com` is a private S3 API endpoint. Only direct-serve when a
 * custom domain is configured in `R2_PUBLIC_URL` (unless overridden via `R2_FORCE_PROXY`).
 */
export function shouldUseR2Proxy(): boolean {
  const forceProxy = process.env.R2_FORCE_PROXY?.trim().toLowerCase()
  if (forceProxy === 'true') return true
  if (forceProxy === 'false') return false

  const publicUrl = getR2PublicUrl()
  if (!publicUrl) return true

  try {
    const hostname = new URL(publicUrl).hostname.toLowerCase()
    return hostname.endsWith('.r2.dev') || hostname.endsWith('.r2.cloudflarestorage.com')
  } catch {
    return true
  }
}

/**
 * Encodes each segment of an R2 object key so spaces and special characters are safe in URL paths.
 */
export function encodeR2ObjectKeyForPath(objectKey: string): string {
  return objectKey
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

/**
 * Formats the public or storage URL for a file stored in Cloudflare R2.
 */
export function formatR2FileURL({
  filename,
  prefix = '',
}: {
  filename: string
  prefix?: string
}): string {
  const publicBase = getR2PublicUrl()
  const endpoint = getR2Endpoint()
  const bucket = process.env.R2_BUCKET_NAME || ''

  // Priority: 1. Public URL (e.g. https://pub-xxx.r2.dev or custom domain), 2. S3 Endpoint + Bucket
  const base = publicBase || (endpoint && bucket ? `${endpoint}/${bucket}` : '')
  const cleanPrefix = prefix ? prefix.replace(/^\/+|\/+$/g, '') : ''
  const path = cleanPrefix ? `${cleanPrefix}/${filename}` : filename

  return base ? `${base}/${path}` : `/${path}`
}

/**
 * Formats a same-origin Next.js proxy URL (`/api/r2/...`) for a file stored in Cloudflare R2.
 */
export function formatR2ProxyURL({
  filename,
  prefix = '',
}: {
  filename: string
  prefix?: string
}): string {
  const cleanPrefix = prefix ? prefix.replace(/^\/+|\/+$/g, '') : ''
  const rawKey = cleanPrefix ? `${cleanPrefix}/${filename}` : filename
  return `/api/r2/${encodeR2ObjectKeyForPath(rawKey)}`
}

/**
 * Resolves the active media file URL for Payload collections and client uploads.
 * Uses the same-origin `/api/r2/...` proxy when `R2_PUBLIC_URL` is a `*.r2.dev` / S3 domain
 * or unset, and serves directly when a custom R2 domain is configured.
 */
export function resolveR2FileURL({
  filename,
  prefix = '',
}: {
  filename: string
  prefix?: string
}): string {
  if (shouldUseR2Proxy()) {
    return formatR2ProxyURL({ filename, prefix })
  }
  return formatR2FileURL({ filename, prefix })
}

/**
 * Validates and normalizes catch-all route segments into a safe R2 object key.
 * Returns null if the key is empty or contains path-traversal characters.
 */
export function normalizeR2ObjectKey(segments?: string[] | null): string | null {
  if (!Array.isArray(segments) || segments.length === 0) return null

  const cleanSegments: string[] = []
  for (const segment of segments) {
    if (
      typeof segment !== 'string' ||
      !segment ||
      segment === '.' ||
      segment === '..' ||
      segment.startsWith('.') ||
      segment.includes('/') ||
      segment.includes('\\') ||
      segment.includes('\0')
    ) {
      return null
    }
    cleanSegments.push(segment)
  }

  const key = cleanSegments.join('/')
  if (!key || key.length > 1024) return null
  return key
}

export type ParsedByteRange =
  | { type: 'none' }
  | { type: 'invalid' }
  | { type: 'partial'; start: number; end: number }

/**
 * Parses an HTTP `Range` header against a known object `totalSize` and caps single
 * partial responses to `maxChunkBytes`.
 */
export function parseByteRange(
  rangeHeader: string | null,
  totalSize: number,
  maxChunkBytes: number = MAX_PROXY_RANGE_BYTES
): ParsedByteRange {
  if (!rangeHeader) return { type: 'none' }
  const trimmed = rangeHeader.trim()
  if (!trimmed.toLowerCase().startsWith('bytes=')) {
    return { type: 'none' }
  }

  const spec = trimmed.slice(6).trim()
  // Per RFC 9110, servers may ignore multi-range requests and return the full representation
  if (!spec || spec.includes(',')) {
    return spec ? { type: 'none' } : { type: 'invalid' }
  }

  if (totalSize <= 0) {
    return { type: 'invalid' }
  }

  const dashIndex = spec.indexOf('-')
  if (dashIndex === -1) {
    return { type: 'invalid' }
  }

  const startStr = spec.slice(0, dashIndex).trim()
  const endStr = spec.slice(dashIndex + 1).trim()

  let start: number
  let rawEnd: number

  if (!startStr && endStr) {
    // Suffix byte range: bytes=-<suffixLength>
    if (!/^\d+$/.test(endStr)) return { type: 'invalid' }
    const suffixLength = Number(endStr)
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
      return { type: 'invalid' }
    }
    start = Math.max(0, totalSize - suffixLength)
    rawEnd = totalSize - 1
  } else if (startStr) {
    if (!/^\d+$/.test(startStr)) return { type: 'invalid' }
    start = Number(startStr)
    if (!Number.isSafeInteger(start) || start < 0 || start >= totalSize) {
      return { type: 'invalid' }
    }

    if (endStr) {
      if (!/^\d+$/.test(endStr)) return { type: 'invalid' }
      const parsedEnd = Number(endStr)
      if (!Number.isSafeInteger(parsedEnd) || parsedEnd < start) {
        return { type: 'invalid' }
      }
      rawEnd = Math.min(parsedEnd, totalSize - 1)
    } else {
      rawEnd = totalSize - 1
    }
  } else {
    return { type: 'invalid' }
  }

  const boundedEnd = Math.min(rawEnd, start + Math.max(1, maxChunkBytes) - 1)
  return {
    type: 'partial',
    start,
    end: boundedEnd,
  }
}
