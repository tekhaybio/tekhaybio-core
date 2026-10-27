/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/roles'
import { revalidateCollection } from '../hooks/revalidate'
import { preventDeleteUsedMedia } from '../../lib/media/preventDeleteUsedMedia'

export const GalleryMedia: CollectionConfig = {
  hooks: {
    beforeChange: [
      ({ data, req }: any) => {
        // Ensure _objectKey from clientUploadContext is preserved so storage URL includes the folder segment
        if (req?.file?.clientUploadContext?._objectKey && !data._objectKey) {
          data._objectKey = req.file.clientUploadContext._objectKey
        }

        const mime = data?.mimeType || req?.file?.mimeType || req?.file?.mimetype || ''
        const filename = data?.filename || req?.file?.name || ''
        const ext = filename.split('.').pop()?.toLowerCase() || ''
        const isVideo = mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'ogg', 'mkv'].includes(ext)

        const fileSize = req?.file?.size ?? data?.filesize

        if (isVideo) {
          data.mediaType = 'video'
          if (!data.mimeType) {
            data.mimeType = mime || (ext === 'webm' ? 'video/webm' : 'video/mp4')
          }
          if (fileSize && fileSize > 10 * 1024 * 1024) {
            throw new Error('Ukuran file video melebihi batas maksimal 10 MB.')
          }
        } else {
          if (!data.mediaType) {
            data.mediaType = 'image'
          }
          if (fileSize && fileSize > 5 * 1024 * 1024) {
            throw new Error('Ukuran file foto melebihi batas maksimal 5 MB.')
          }
        }
        return data
      },
    ],
    beforeDelete: [preventDeleteUsedMedia('gallery-media')],
    afterChange: [revalidateCollection('gallery')],
    afterDelete: [revalidateCollection('gallery')],
  },
  slug: 'gallery-media',
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  admin: {
    group: 'Pusat Media',
    useAsTitle: 'title',
    defaultColumns: ['title', 'mediaType', 'category', 'createdAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Judul atau nama media dokumentasi.',
      },
    },
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Teks alternatif (alt text) untuk aksesibilitas dan SEO foto.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Keterangan atau konteks dokumentasi.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      admin: {
        description: 'Keterangan ringkas dwibahasa untuk tampilan lightbox/detail.',
      },
    },
    {
      name: 'mediaType',
      type: 'select',
      defaultValue: 'image',
      options: [
        { label: 'Foto / Gambar', value: 'image' },
        { label: 'Video', value: 'video' },
      ],
      admin: {
        description: 'Jenis media (otomatis terdeteksi berdasarkan MIME type file).',
      },
    },
    {
      name: 'duration',
      type: 'number',
      admin: {
        description: 'Durasi video dalam detik (opsional).',
      },
    },
    {
      name: 'videoThumbnail',
      type: 'upload',
      relationTo: 'gallery-media',
      admin: {
        description: 'Poster / thumbnail kustom untuk file video (opsional).',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Building', value: 'building' },
        { label: 'Interior', value: 'interior' },
        { label: 'Activities', value: 'activities' },
        { label: 'History', value: 'history' },
        { label: 'Traditions', value: 'traditions' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Kategori arsip media.',
      },
    },
  ],
  upload: {
    mimeTypes: [
      'image/*',
      'video/*',
    ],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 1024, position: 'centre' },
      { name: 'tablet', width: 1024, height: undefined, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
  },
}
