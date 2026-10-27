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
