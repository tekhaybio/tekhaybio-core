import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { s3Storage } from '@payloadcms/storage-s3'
import { getR2Endpoint, isR2Configured, resolveR2FileURL } from './src/lib/storage/r2'

import { Users } from './src/payload/collections/Users'
import { Media } from './src/payload/collections/Media'
import { NewsMedia } from './src/payload/collections/NewsMedia'
import { ServiceMedia } from './src/payload/collections/ServiceMedia'
import { ActivityMedia } from './src/payload/collections/ActivityMedia'
import { HistoryMedia } from './src/payload/collections/HistoryMedia'
import { GalleryMedia } from './src/payload/collections/GalleryMedia'
import { SiteMedia } from './src/payload/collections/SiteMedia'
import { Categories } from './src/payload/collections/Categories'
import { Posts } from './src/payload/collections/Posts'
import { Activities } from './src/payload/collections/Activities'
import { Services } from './src/payload/collections/Services'
import { Albums } from './src/payload/collections/Albums'

import { History } from './src/payload/globals/History'
import { SiteSettings } from './src/payload/globals/SiteSettings'
import { ContactInformation } from './src/payload/globals/ContactInformation'
import { HomePage } from './src/payload/globals/HomePage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  sharp,
  routes: {
    admin: '/admin-payload',
  },
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, NewsMedia, ServiceMedia, ActivityMedia, HistoryMedia, GalleryMedia, SiteMedia, Categories, Posts, Activities, Services, Albums],
  globals: [History, SiteSettings, ContactInformation, HomePage],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-key-for-development',
  typescript: {
    outputFile: path.resolve(dirname, 'src/types/payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || 'mongodb://127.0.0.1/tek-hay-bio',
  }),
  localization: {
    locales: [
      { label: 'Indonesia', code: 'id' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'id',
    fallback: true,
  },
  cors: [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_SERVER_URL || '',
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ].filter(Boolean),
  csrf: [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_SERVER_URL || '',
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ].filter(Boolean),
  plugins: [
    // Integrasi Vercel Blob dipertahankan di proyek tetapi dinonaktifkan (enabled: false)
    // Sesuai ketentuan: Cloudflare R2 dijadikan sebagai penyimpanan aktif.
    vercelBlobStorage({
      enabled: false,
      clientUploads: {},
      collections: {
        media: {
          disablePayloadAccessControl: true,
        },
        'news-media': {
          prefix: 'news-media/',
          disablePayloadAccessControl: true,
        },
        'service-media': {
          prefix: 'service-media/',
          disablePayloadAccessControl: true,
        },
        'activity-media': {
          prefix: 'activity-media/',
          disablePayloadAccessControl: true,
        },
        'history-media': {
          prefix: 'history-media/',
          disablePayloadAccessControl: true,
        },
        'gallery-media': {
          prefix: 'gallery-media/',
          disablePayloadAccessControl: true,
        },
        'site-media': {
          prefix: 'site-media/',
          disablePayloadAccessControl: true,
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
    // Cloudflare R2 Storage (S3-compatible API) sebagai penyimpanan aktif
    s3Storage({
      enabled: isR2Configured(),
      clientUploads: true,
      bucket: process.env.R2_BUCKET_NAME || '',
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: getR2Endpoint() || 'https://auto.r2.cloudflarestorage.com',
        forcePathStyle: true,
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
      },
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => resolveR2FileURL({ filename, prefix }),
        },
        'news-media': {
          prefix: 'news-media',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => resolveR2FileURL({ filename, prefix }),
        },
        'service-media': {
          prefix: 'service-media',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => resolveR2FileURL({ filename, prefix }),
        },
        'activity-media': {
          prefix: 'activity-media',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => resolveR2FileURL({ filename, prefix }),
        },
        'history-media': {
          prefix: 'history-media',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => resolveR2FileURL({ filename, prefix }),
        },
        'gallery-media': {
          prefix: 'gallery-media',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => resolveR2FileURL({ filename, prefix }),
        },
        'site-media': {
          prefix: 'site-media',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => resolveR2FileURL({ filename, prefix }),
        },
      },
    }),
  ],
})
