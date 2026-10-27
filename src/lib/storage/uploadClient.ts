/* eslint-disable @typescript-eslint/no-explicit-any */
// Import @vercel/blob client upload is retained in the codebase for reference/backward-compatibility
// but inactive in favor of Cloudflare R2 direct client upload.
import { upload as vercelBlobUpload } from '@vercel/blob/client'
import { inferMimeTypeFromFilename } from './r2'

export interface DirectUploadResult {
  clientUploadContext: any
  filename: string
  mimeType: string
  publicUrl: string
  storageFilePath: string
}

/**
 * Direct client upload to Cloudflare R2 using a short-lived presigned PUT URL.
 * All credentials remain securely on the server; the browser only receives
 * a temporary presigned URL.
 *
 * @param file The file to upload
 * @param collectionSlug The target Payload media collection slug
 */
export async function directUploadToR2({
  file,
  collectionSlug,
}: {
  file: File
  collectionSlug: string
}): Promise<DirectUploadResult> {
  const resolvedMimeType = (file.type && file.type.trim()) || inferMimeTypeFromFilename(file.name)

  const issueRes = await fetch('/api/r2-client-upload', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collectionSlug,
      filename: file.name,
      mimeType: resolvedMimeType,
      size: file.size,
    }),
  })

  if (!issueRes.ok) {
    const errorJson = await issueRes.json().catch(() => null)
    throw new Error(
      errorJson?.error ||
        errorJson?.message ||
        `Gagal meminta presigned URL upload R2 (${issueRes.status})`
    )
  }

  const { uploadUrl, clientUploadContext, filename, publicUrl, storageFilePath } =
    await issueRes.json()

  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': resolvedMimeType,
    },
    body: file,
  })

  if (!putRes.ok) {
    throw new Error(
      `Gagal mengunggah file langsung ke Cloudflare R2 (${putRes.status}: ${putRes.statusText})`
    )
  }

  return {
    clientUploadContext,
    filename,
    mimeType: resolvedMimeType,
    publicUrl,
    storageFilePath,
  }
}

/**
 * Legacy Vercel Blob upload function (retained for rollback / reference purposes; inactive).
 */
export async function _inactiveVercelBlobUpload(
  pathname: string,
  file: File,
  options: any
): Promise<any> {
  console.warn('Vercel Blob client upload is deprecated and inactive. Cloudflare R2 is now active.')
  return vercelBlobUpload(pathname, file, options)
}
