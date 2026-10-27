/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Ensures that the `_objectKey` generated during Cloudflare R2 / S3 (and legacy Vercel Blob)
 * client uploads is persisted onto the document before cloud storage hooks generate the URL.
 * This prevents 404 "Not found" errors on files uploaded via direct client upload (> 4MB).
 */
export const ensureClientUploadObjectKey: CollectionBeforeChangeHook = ({ data, req }: any) => {
  if (req?.file?.clientUploadContext?._objectKey && !data._objectKey) {
    data._objectKey = req.file.clientUploadContext._objectKey
  }
  return data
}
