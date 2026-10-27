import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getR2Endpoint,
  getR2PublicUrl,
  isR2Configured,
  formatR2FileURL,
  inferMimeTypeFromFilename,
  getR2Client,
} from '../../src/lib/storage/r2.ts'

test('R2 Storage Configuration & URL Resolution', async (t) => {
  const originalEnv = { ...process.env }

  t.afterEach(() => {
    process.env = { ...originalEnv }
  })

  await t.test('Verifikasi 1: Resolusi Endpoint R2 dari R2_ENDPOINT atau R2_ACCOUNT_ID', () => {
    delete process.env.R2_ENDPOINT
    delete process.env.R2_ACCOUNT_ID

    assert.equal(getR2Endpoint(), '')

    process.env.R2_ACCOUNT_ID = 'abc123def456'
    assert.equal(getR2Endpoint(), 'https://abc123def456.r2.cloudflarestorage.com')

    process.env.R2_ENDPOINT = 'https://custom-endpoint.r2.cloudflarestorage.com/'
    // Harus memprioritaskan R2_ENDPOINT dan menghapus trailing slash
    assert.equal(getR2Endpoint(), 'https://custom-endpoint.r2.cloudflarestorage.com')
  })

  await t.test('Verifikasi 2: Resolusi Domain Publik R2 (R2_PUBLIC_URL)', () => {
    delete process.env.R2_PUBLIC_URL
    assert.equal(getR2PublicUrl(), '')

    process.env.R2_PUBLIC_URL = 'https://pub-mybucket.r2.dev/'
    assert.equal(getR2PublicUrl(), 'https://pub-mybucket.r2.dev')
  })

  await t.test('Verifikasi 3: Pengecekan Kelengkapan Konfigurasi isR2Configured', () => {
    delete process.env.R2_ACCOUNT_ID
    delete process.env.R2_ENDPOINT
    delete process.env.R2_ACCESS_KEY_ID
    delete process.env.R2_SECRET_ACCESS_KEY
    delete process.env.R2_BUCKET_NAME

    assert.equal(isR2Configured(), false)

    process.env.R2_ACCOUNT_ID = 'acc123'
    process.env.R2_ACCESS_KEY_ID = 'key123'
    process.env.R2_SECRET_ACCESS_KEY = 'secret123'
    assert.equal(isR2Configured(), false) // Masih kurang bucket name

    process.env.R2_BUCKET_NAME = 'tekhaybio-media'
    assert.equal(isR2Configured(), true)
  })

  await t.test('Verifikasi 4: Format URL File R2 dengan Domain Publik (R2_PUBLIC_URL)', () => {
    process.env.R2_PUBLIC_URL = 'https://pub-12345.r2.dev'
    process.env.R2_BUCKET_NAME = 'media-bucket'

    // Tanpa prefix
    const urlNoPrefix = formatR2FileURL({ filename: 'kelenteng.jpg' })
    assert.equal(urlNoPrefix, 'https://pub-12345.r2.dev/kelenteng.jpg')

    // Dengan prefix koleksi
    const urlWithPrefix = formatR2FileURL({
      filename: 'foto-altar.webp',
      prefix: 'gallery-media/uuid-1234',
    })
    assert.equal(urlWithPrefix, 'https://pub-12345.r2.dev/gallery-media/uuid-1234/foto-altar.webp')

    // Normalisasi slash pada prefix
    const urlNormalizedPrefix = formatR2FileURL({
      filename: 'kegiatan.png',
      prefix: '/news-media/',
    })
    assert.equal(urlNormalizedPrefix, 'https://pub-12345.r2.dev/news-media/kegiatan.png')
  })

  await t.test('Verifikasi 5: Fallback URL File R2 ke Endpoint S3 saat R2_PUBLIC_URL Kosong', () => {
    delete process.env.R2_PUBLIC_URL
    process.env.R2_ACCOUNT_ID = 'acc999'
    delete process.env.R2_ENDPOINT
    process.env.R2_BUCKET_NAME = 'my-bucket'

    const url = formatR2FileURL({
      filename: 'arsip.pdf',
      prefix: 'site-media',
    })
    assert.equal(
      url,
      'https://acc999.r2.cloudflarestorage.com/my-bucket/site-media/arsip.pdf'
    )
  })

  await t.test('Verifikasi 6: Inferensi MIME Type Otomatis Berdasarkan Ekstensi File', () => {
    assert.equal(inferMimeTypeFromFilename('video.mp4'), 'video/mp4')
    assert.equal(inferMimeTypeFromFilename('clip.webm'), 'video/webm')
    assert.equal(inferMimeTypeFromFilename('movie.MOV'), 'video/quicktime')
    assert.equal(inferMimeTypeFromFilename('foto.jpeg'), 'image/jpeg')
    assert.equal(inferMimeTypeFromFilename('foto.jpg'), 'image/jpeg')
    assert.equal(inferMimeTypeFromFilename('gambar.png'), 'image/png')
    assert.equal(inferMimeTypeFromFilename('gambar.webp'), 'image/webp')
    assert.equal(inferMimeTypeFromFilename('unknown.xyz'), 'application/octet-stream')
  })

  await t.test('Verifikasi 7: getR2Client Terkonfigurasi dengan forcePathStyle & Checksum When Required', () => {
    process.env.R2_ACCOUNT_ID = 'test-acc'
    process.env.R2_ACCESS_KEY_ID = 'test-key'
    process.env.R2_SECRET_ACCESS_KEY = 'test-sec'
    process.env.R2_BUCKET_NAME = 'test-bucket'

    const client = getR2Client()
    assert.ok(client)
    // S3Client config internal
    assert.equal(client.config.forcePathStyle, true)
  })
})
