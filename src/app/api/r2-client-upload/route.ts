import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClientUploadReceipt, getSafeFileName } from 'payload/internal'
import { getSanitizedUploadFilename } from 'payload/shared'
import { randomUUID } from 'crypto'
import { getR2Client, resolveR2FileURL, isR2Configured, inferMimeTypeFromFilename } from '@/lib/storage/r2'

const ALLOWED_COLLECTIONS: Record<string, string> = {
  media: '',
  'news-media': 'news-media',
  'service-media': 'service-media',
  'activity-media': 'activity-media',
  'history-media': 'history-media',
  'gallery-media': 'gallery-media',
  'site-media': 'site-media',
}

/**
 * Server endpoint to generate a short-lived presigned PUT URL for Cloudflare R2
 * and a cryptographically signed Payload clientUploadContext receipt.
 * Ensures credentials never leak to the client/browser.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        { error: 'Cloudflare R2 belum dikonfigurasi pada environment server.' },
        { status: 503 }
      )
    }

    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: req.headers })

    if (!user || (user.role !== 'super_admin' && user.role !== 'editor')) {
      return NextResponse.json(
        { error: 'Akses ditolak: Anda harus login sebagai admin atau editor.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Request body tidak valid.' }, { status: 400 })
    }

    const { collectionSlug, filename, mimeType, size } = body

    if (
      !collectionSlug ||
      typeof collectionSlug !== 'string' ||
      !(collectionSlug in ALLOWED_COLLECTIONS)
    ) {
      return NextResponse.json(
        { error: `Koleksi tidak valid: ${collectionSlug}` },
        { status: 400 }
      )
    }

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json(
        { error: 'Nama file wajib disertakan.' },
        { status: 400 }
      )
    }

    const resolvedMimeType =
      typeof mimeType === 'string' && mimeType.trim()
        ? mimeType.trim()
        : inferMimeTypeFromFilename(filename)

    // Validasi tipe dan batas ukuran sesuai spesifikasi koleksi
    if (collectionSlug === 'gallery-media') {
      if (resolvedMimeType.startsWith('video/')) {
        if (size && size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Ukuran file video melebihi batas maksimal 10 MB.' },
            { status: 400 }
          )
        }
      } else if (resolvedMimeType.startsWith('image/')) {
        if (size && size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Ukuran file foto melebihi batas maksimal 5 MB.' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Hanya format foto atau video yang diperbolehkan untuk galeri.' },
          { status: 400 }
        )
      }
    } else {
      if (!resolvedMimeType.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Hanya format gambar yang diperbolehkan.' },
          { status: 400 }
        )
      }
      if (size && size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Ukuran file foto melebihi batas maksimal 5 MB.' },
          { status: 400 }
        )
      }
    }

    const sanitizedFilename = getSanitizedUploadFilename(filename)
    // Gunakan getSafeFileName untuk memastikan nama file deduplikasi konsisten dengan database
    // sehingga Payload tidak mengubah nama file secara sepihak saat dokumen dibuat.
    const safeFilename = await getSafeFileName({
      collectionSlug,
      desiredFilename: sanitizedFilename,
      req: { payload } as any,
    })

    const collectionPrefix = ALLOWED_COLLECTIONS[collectionSlug]
    const _objectKey = randomUUID()

    // Key format: `${collectionPrefix}/${_objectKey}/${safeFilename}`
    const storageFilePath = collectionPrefix
      ? `${collectionPrefix}/${_objectKey}/${safeFilename}`
      : `${_objectKey}/${safeFilename}`

    const context = {
      _objectKey,
      prefix: collectionPrefix || '',
    }

    const signedReceipt = createClientUploadReceipt({
      collectionSlug,
      filename: safeFilename,
      context,
      req: {
        payload,
        user: {
          collection: user.collection || 'users',
          id: user.id,
        },
      } as any,
    })

    const clientUploadContext = {
      ...context,
      signedReceipt,
    }

    // Generate presigned PUT URL for Cloudflare R2
    const s3Client = getR2Client()
    const bucket = process.env.R2_BUCKET_NAME || ''
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: storageFilePath,
      ContentType: resolvedMimeType,
    })

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 menit
    })

    const publicUrl = resolveR2FileURL({
      filename: safeFilename,
      prefix: collectionPrefix ? `${collectionPrefix}/${_objectKey}` : _objectKey,
    })

    return NextResponse.json({
      uploadUrl,
      pathname: storageFilePath,
      storageFilePath,
      filename: safeFilename,
      publicUrl,
      clientUploadContext,
    })
  } catch (error: any) {
    console.error('Error generating R2 presigned upload URL:', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal membuat presigned upload URL ke R2.' },
      { status: 500 }
    )
  }
}
