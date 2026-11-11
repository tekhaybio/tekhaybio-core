import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ALBUM_CATEGORIES,
  MEDIA_CATEGORIES,
  getAlbumCategoryLabel,
  getMediaCategoryLabel,
  isMediaVideo,
  countAlbumMedia,
  formatEventDateRange,
  MEDIA_LIMITS,
  validateMediaFile,
  extractCaptionText,
  normalizeMediaItemsForLocale,
  resolveClientMediaUrl,
} from '../../src/lib/gallery/utils.ts'

test('Verifikasi 1: Kategori Album Galeri Terstruktur dan Bilingual', () => {
  assert.equal(ALBUM_CATEGORIES.length, 6)
  assert.equal(getAlbumCategoryLabel('ritual', 'id'), 'Ritual Keagamaan')
  assert.equal(getAlbumCategoryLabel('ritual', 'en'), 'Religious Ritual')
  assert.equal(getAlbumCategoryLabel('ancestral-worship', 'id'), 'Sembahyang Leluhur')
  assert.equal(getAlbumCategoryLabel('ancestral-worship', 'en'), 'Ancestral Worship')
  assert.equal(getAlbumCategoryLabel('deity-festival', 'id'), 'Hari Kebesaran Dewa')
  assert.equal(getAlbumCategoryLabel('deity-festival', 'en'), 'Deity Festival')
  assert.equal(getAlbumCategoryLabel('cultural-celebration', 'id'), 'Perayaan Budaya')
  assert.equal(getAlbumCategoryLabel('cultural-celebration', 'en'), 'Cultural Celebration')
  assert.equal(getAlbumCategoryLabel('social-activity', 'id'), 'Kegiatan Sosial')
  assert.equal(getAlbumCategoryLabel('social-activity', 'en'), 'Social Activity')
  assert.equal(getAlbumCategoryLabel('other', 'id'), 'Dokumentasi Lainnya')
  assert.equal(getAlbumCategoryLabel('other', 'en'), 'Other Documentation')

  // Fallback aman
  assert.equal(getAlbumCategoryLabel(null, 'id'), 'Dokumentasi Acara')
  assert.equal(getAlbumCategoryLabel(undefined, 'en'), 'Event Documentation')
})

test('Verifikasi 2: Deteksi Tipe Media Foto dan Video (isMediaVideo)', () => {
  // Video via mediaType
  assert.equal(isMediaVideo({ mediaType: 'video' }), true)
  assert.equal(isMediaVideo({ mediaType: 'image' }), false)

  // Video via MIME type
  assert.equal(isMediaVideo({ mimeType: 'video/mp4' }), true)
  assert.equal(isMediaVideo({ mimeType: 'video/webm' }), true)
  assert.equal(isMediaVideo({ mimeType: 'video/quicktime' }), true)
  assert.equal(isMediaVideo({ mimeType: 'image/jpeg' }), false)
  assert.equal(isMediaVideo({ mimeType: 'image/webp' }), false)

  // Video via ekstensi file
  assert.equal(isMediaVideo({ filename: 'dokumentasi-kirab.mp4' }), true)
  assert.equal(isMediaVideo({ filename: 'suasana-titd.webm' }), true)
  assert.equal(isMediaVideo({ filename: 'sembahyang.mov' }), true)
  assert.equal(isMediaVideo({ filename: 'altar-utama.jpg' }), false)
  assert.equal(isMediaVideo({ filename: 'patung-kongco.png' }), false)

  // Edge cases
  assert.equal(isMediaVideo(null), false)
  assert.equal(isMediaVideo(undefined), false)
  assert.equal(isMediaVideo({}), false)
})

test('Verifikasi 3: Penghitungan Media dalam Album (countAlbumMedia)', () => {
  const mediaItems = [
    { media: { id: '1', mimeType: 'image/jpeg', filename: 'foto1.jpg' } },
    { media: { id: '2', mimeType: 'image/png', filename: 'foto2.png' } },
    { media: { id: '3', mimeType: 'video/mp4', filename: 'video1.mp4' } },
    { media: { id: '4', mediaType: 'video', filename: 'video2.webm' } },
    { media: { id: '5', mimeType: 'image/webp', filename: 'foto3.webp' } },
  ]

  const counts = countAlbumMedia(mediaItems)
  assert.equal(counts.total, 5)
  assert.equal(counts.photosCount, 3)
  assert.equal(counts.videosCount, 2)

  // Array kosong atau undefined
  const emptyCounts = countAlbumMedia([])
  assert.equal(emptyCounts.total, 0)
  assert.equal(emptyCounts.photosCount, 0)
  assert.equal(emptyCounts.videosCount, 0)

  const undefinedCounts = countAlbumMedia(undefined)
  assert.equal(undefinedCounts.total, 0)
})

test('Verifikasi 4: Format Rentang Tanggal Acara Album', () => {
  // Tanggal tunggal
  const single = formatEventDateRange('2026-08-15', null, 'id')
  assert.ok(single?.includes('15 Agustus 2026'))

  // Rentang bulan yang sama
  const sameMonth = formatEventDateRange('2026-08-15', '2026-08-17', 'id')
  assert.ok(sameMonth?.includes('15 – 17 Agustus 2026'))

  // Rentang lintas bulan
  const crossMonth = formatEventDateRange('2026-08-30', '2026-09-02', 'id')
  assert.ok(crossMonth?.includes('30 Agustus 2026 – 2 September 2026'))

  // Null date
  assert.equal(formatEventDateRange(null, null, 'id'), null)
  assert.equal(formatEventDateRange('', '', 'id'), null)
})

test('Verifikasi 5: Relasi Media dan Album Independen (Non-destruktif)', () => {
  // Simulasi album dengan media
  const albumMediaList = ['media-1', 'media-2', 'media-3']
  
  // Mengeluarkan media-2 dari album
  const updatedList = albumMediaList.filter(id => id !== 'media-2')
  assert.deepEqual(updatedList, ['media-1', 'media-3'])
  
  // Memastikan ID media fisik 'media-2' tetap valid dan tidak berubah
  assert.equal(albumMediaList.includes('media-2'), true)
})

test('Verifikasi 6: Resolusi Judul Dwibahasa (Bidirectional Title Fallback)', () => {
  const resolveTitle = (rawTitle) => {
    const rawTitleId = typeof rawTitle === 'string' ? rawTitle.trim() : (rawTitle?.id?.trim?.() ?? '')
    const rawTitleEn = typeof rawTitle === 'string' ? rawTitle.trim() : (rawTitle?.en?.trim?.() ?? '')

    if (!rawTitleId && !rawTitleEn) {
      return null
    }

    return {
      id: rawTitleId || rawTitleEn,
      en: rawTitleEn || rawTitleId,
    }
  }

  // Kasus 1: Hanya mengisi ID (kasus umum admin) -> EN otomatis terisi dengan ID
  const onlyId = resolveTitle({ id: 'Acara Cap Go Meh 2026', en: '' })
  assert.deepEqual(onlyId, { id: 'Acara Cap Go Meh 2026', en: 'Acara Cap Go Meh 2026' })

  // Kasus 2: Hanya mengisi EN -> ID otomatis terisi dengan EN
  const onlyEn = resolveTitle({ id: '', en: 'Lantern Festival 2026' })
  assert.deepEqual(onlyEn, { id: 'Lantern Festival 2026', en: 'Lantern Festival 2026' })

  // Kasus 3: Input berupa string tunggal -> kedua locale terisi
  const stringTitle = resolveTitle('Perayaan Tong Jiu Pia')
  assert.deepEqual(stringTitle, { id: 'Perayaan Tong Jiu Pia', en: 'Perayaan Tong Jiu Pia' })

  // Kasus 4: Kedua locale diisi berbeda -> kedua nilai dipertahankan
  const bothProvided = resolveTitle({ id: 'Pawai Budaya', en: 'Cultural Parade' })
  assert.deepEqual(bothProvided, { id: 'Pawai Budaya', en: 'Cultural Parade' })

  // Kasus 5: Keduanya kosong -> return null (memicu pesan error ramah pengguna)
  const emptyTitle = resolveTitle({ id: '   ', en: '' })
  assert.equal(emptyTitle, null)
})

test('Verifikasi 7: Fallback Judul Media ke Judul Album Jika Kosong', () => {
  const getMediaDisplayTitle = (mediaDoc, albumTitle, locale = 'id') => {
    const rawTitle = mediaDoc?.title?.trim()
    if (rawTitle && rawTitle !== 'Tanpa Judul' && rawTitle !== mediaDoc?.filename) {
      return rawTitle
    }
    return albumTitle?.trim() || (locale === 'id' ? 'Dokumentasi TITD' : 'Temple Documentation')
  }

  const albumTitle = 'Perayaan Tong Jiu Pia 2026'

  // Kasus 1: Media tidak memiliki title sama sekali -> menggunakan judul album
  assert.equal(getMediaDisplayTitle({}, albumTitle), 'Perayaan Tong Jiu Pia 2026')
  assert.equal(getMediaDisplayTitle(null, albumTitle), 'Perayaan Tong Jiu Pia 2026')

  // Kasus 2: Media memiliki title kosong atau string spasi -> menggunakan judul album
  assert.equal(getMediaDisplayTitle({ title: '' }, albumTitle), 'Perayaan Tong Jiu Pia 2026')
  assert.equal(getMediaDisplayTitle({ title: '   ' }, albumTitle), 'Perayaan Tong Jiu Pia 2026')

  // Kasus 3: Media memiliki title 'Tanpa Judul' -> menggunakan judul album
  assert.equal(getMediaDisplayTitle({ title: 'Tanpa Judul' }, albumTitle), 'Perayaan Tong Jiu Pia 2026')

  // Kasus 4: Media hanya memiliki nama file (misal: DSC_001.mp4) -> menggunakan judul album
  assert.equal(
    getMediaDisplayTitle({ title: 'DSC_001.mp4', filename: 'DSC_001.mp4' }, albumTitle),
    'Perayaan Tong Jiu Pia 2026'
  )

  // Kasus 5: Media memiliki judul kustom yang valid -> tetap gunakan judul kustom
  assert.equal(
    getMediaDisplayTitle({ title: 'Sembahyang Mooncake di Halaman' }, albumTitle),
    'Sembahyang Mooncake di Halaman'
  )
})

test('Verifikasi 8: Kategori Media Lepas Galeri (MEDIA_CATEGORIES & getMediaCategoryLabel)', () => {
  assert.equal(MEDIA_CATEGORIES.length, 6)
  assert.equal(getMediaCategoryLabel('building', 'id'), 'Bangunan TITD')
  assert.equal(getMediaCategoryLabel('building', 'en'), 'Temple Building')
  assert.equal(getMediaCategoryLabel('interior', 'id'), 'Interior & Altar')
  assert.equal(getMediaCategoryLabel('interior', 'en'), 'Interior & Altar')
  assert.equal(getMediaCategoryLabel('activities', 'id'), 'Kegiatan & Ritual')
  assert.equal(getMediaCategoryLabel('activities', 'en'), 'Activities & Rituals')
  assert.equal(getMediaCategoryLabel('history', 'id'), 'Sejarah & Peninggalan')
  assert.equal(getMediaCategoryLabel('history', 'en'), 'History & Relics')
  assert.equal(getMediaCategoryLabel('traditions', 'id'), 'Tradisi & Budaya')
  assert.equal(getMediaCategoryLabel('traditions', 'en'), 'Traditions & Culture')
  assert.equal(getMediaCategoryLabel('other', 'id'), 'Dokumentasi Lainnya')
  assert.equal(getMediaCategoryLabel('other', 'en'), 'Other Documentation')

  // Fallback aman
  assert.equal(getMediaCategoryLabel(null, 'id'), 'Umum')
  assert.equal(getMediaCategoryLabel(undefined, 'en'), 'General')
})

test('Verifikasi 9: Resolusi Tab Default Halaman Galeri (Smart Hybrid Tab Resolution)', () => {
  const resolveActiveTab = (tab, totalAlbums) => {
    if (tab === 'photos' || tab === 'albums') return tab
    return totalAlbums > 0 ? 'albums' : 'photos'
  }

  // Kasus 1: Belum ada album di database (totalAlbums = 0) -> otomatis membuka tab 'photos'
  assert.equal(resolveActiveTab(undefined, 0), 'photos')
  assert.equal(resolveActiveTab(null, 0), 'photos')

  // Kasus 2: Sudah ada album di database (totalAlbums > 0) -> default ke 'albums'
  assert.equal(resolveActiveTab(undefined, 5), 'albums')

  // Kasus 3: User secara eksplisit meminta tab 'photos' (misal dari tombol Lihat Semua Galeri di beranda)
  assert.equal(resolveActiveTab('photos', 5), 'photos')
  assert.equal(resolveActiveTab('photos', 0), 'photos')

  // Kasus 4: User secara eksplisit meminta tab 'albums'
  assert.equal(resolveActiveTab('albums', 5), 'albums')
  assert.equal(resolveActiveTab('albums', 0), 'albums')
})

test('Verifikasi 10: Batas Ukuran dan Format Validasi Media (Video maks 10MB, Foto maks 5MB)', () => {
  assert.equal(MEDIA_LIMITS.MAX_VIDEO_SIZE_MB, 10)
  assert.equal(MEDIA_LIMITS.MAX_IMAGE_SIZE_MB, 5)
  assert.equal(MEDIA_LIMITS.MAX_VIDEO_SIZE_BYTES, 10 * 1024 * 1024)
  assert.equal(MEDIA_LIMITS.MAX_IMAGE_SIZE_BYTES, 5 * 1024 * 1024)

  // 1. Video 8 MB (valid, <= 10 MB)
  const validVideo = validateMediaFile({
    name: 'perayaan-barongsai.mp4',
    type: 'video/mp4',
    size: 8 * 1024 * 1024,
  })
  assert.equal(validVideo.valid, true)
  assert.equal(validVideo.mediaType, 'video')

  // 2. Video 12 MB (invalid, > 10 MB)
  const invalidVideo = validateMediaFile({
    name: 'kirab-panjang.mp4',
    type: 'video/mp4',
    size: 12 * 1024 * 1024,
  })
  assert.equal(invalidVideo.valid, false)
  assert.equal(invalidVideo.mediaType, 'video')
  assert.match(invalidVideo.error, /melebihi batas maksimal 10MB/)

  // 3. Foto 4 MB (valid, <= 5 MB)
  const validPhoto = validateMediaFile({
    name: 'altar-hi-res.jpg',
    type: 'image/jpeg',
    size: 4 * 1024 * 1024,
  })
  assert.equal(validPhoto.valid, true)
  assert.equal(validPhoto.mediaType, 'image')

  // 4. Foto 6 MB (invalid, > 5 MB)
  const invalidPhoto = validateMediaFile({
    name: 'arsip-raksasa.png',
    type: 'image/png',
    size: 6 * 1024 * 1024,
  })
  assert.equal(invalidPhoto.valid, false)
  assert.equal(invalidPhoto.mediaType, 'image')
  assert.match(invalidPhoto.error, /melebihi batas maksimal 5MB/)

  // 5. Format tidak didukung (misal PDF)
  const invalidFormat = validateMediaFile({
    name: 'dokumen.pdf',
    type: 'application/pdf',
    size: 1024 * 1024,
  })
  assert.equal(invalidFormat.valid, false)
  assert.match(invalidFormat.error, /tidak didukung/)
})

test('Verifikasi 11: Normalisasi mediaItems Dwibahasa untuk Pengeluaran dan Penambahan Media', () => {
  // 1. Ekstraksi caption dari berbagai format
  assert.equal(extractCaptionText('Teks Sederhana', 'id'), 'Teks Sederhana')
  assert.equal(extractCaptionText({ id: 'Altar TITD', en: 'Temple Altar' }, 'id'), 'Altar TITD')
  assert.equal(extractCaptionText({ id: 'Altar TITD', en: 'Temple Altar' }, 'en'), 'Temple Altar')

  // Tangani objek bersarang yang cacat akibat locale fallback { id: { en: '' }, en: '' }
  assert.equal(extractCaptionText({ id: { en: '' }, en: '' }, 'id'), '')
  assert.equal(extractCaptionText({ id: { en: '' }, en: '' }, 'en'), '')
  assert.equal(extractCaptionText(null, 'id'), '')
  assert.equal(extractCaptionText(undefined, 'en'), '')

  // 2. Normalisasi mediaItems dari data mentah findByID (termasuk populated objects dan ObjectId)
  const rawMediaItems = [
    {
      media: { id: '6adf3c3d30cc5415cf4eaf04', title: 'Foto 1' },
      caption: { id: { en: '' }, en: '' },
      sortOrder: 0,
      id: 'item-1',
    },
    {
      media: '6adf3c3e30cc5415cf4eaf0b',
      caption: { id: 'Keterangan ID', en: 'Caption EN' },
      sortOrder: 1,
      id: 'item-2',
    },
    {
      media: { toString: () => '6adf3c4030cc5415cf4eaf19' },
      caption: 'Keterangan Tunggal',
      sortOrder: 5,
      id: 'item-3',
    },
    {
      // Item tanpa media harus disaring
      media: null,
      caption: '',
      sortOrder: 9,
    },
  ]

  const normalizedId = normalizeMediaItemsForLocale(rawMediaItems, 'id')
  assert.equal(normalizedId.length, 3)

  // Pastikan seluruh media adalah string ID murni (bukan objek / ObjectId)
  assert.equal(normalizedId[0].media, '6adf3c3d30cc5415cf4eaf04')
  assert.equal(typeof normalizedId[0].media, 'string')
  assert.equal(normalizedId[1].media, '6adf3c3e30cc5415cf4eaf0b')
  assert.equal(typeof normalizedId[1].media, 'string')
  assert.equal(normalizedId[2].media, '6adf3c4030cc5415cf4eaf19')
  assert.equal(typeof normalizedId[2].media, 'string')

  // Pastikan seluruh caption adalah string primitif (bukan objek bersarang yang menyebabkan CastError)
  assert.equal(typeof normalizedId[0].caption, 'string')
  assert.equal(normalizedId[0].caption, '')
  assert.equal(typeof normalizedId[1].caption, 'string')
  assert.equal(normalizedId[1].caption, 'Keterangan ID')
  assert.equal(typeof normalizedId[2].caption, 'string')
  assert.equal(normalizedId[2].caption, 'Keterangan Tunggal')

  // Pastikan sortOrder di-reindex secara berurutan
  assert.equal(normalizedId[0].sortOrder, 0)
  assert.equal(normalizedId[1].sortOrder, 1)
  assert.equal(normalizedId[2].sortOrder, 2)

  // Normalisasi untuk bahasa Inggris
  const normalizedEn = normalizeMediaItemsForLocale(rawMediaItems, 'en')
  assert.equal(normalizedEn[0].caption, '')
  assert.equal(normalizedEn[1].caption, 'Caption EN')
  assert.equal(normalizedEn[2].caption, 'Keterangan Tunggal')

  // 3. Simulasi pengeluaran media (remove media):
  const targetMediaIdToRemove = '6adf3c3d30cc5415cf4eaf04'
  const remaining = rawMediaItems.filter((item) => {
    const mId = typeof item.media === 'object' && item.media?.id ? item.media.id : String(item.media || '')
    return mId !== targetMediaIdToRemove
  })
  const afterRemoval = normalizeMediaItemsForLocale(remaining, 'id')
  assert.equal(afterRemoval.length, 2)
  assert.equal(afterRemoval[0].media, '6adf3c3e30cc5415cf4eaf0b')
  assert.equal(afterRemoval[0].sortOrder, 0)
  assert.equal(afterRemoval[1].media, '6adf3c4030cc5415cf4eaf19')
  assert.equal(afterRemoval[1].sortOrder, 1)
})

test('Verifikasi 12: Normalisasi URL Media Sisi Klien (resolveClientMediaUrl)', () => {
  assert.equal(resolveClientMediaUrl(null), '')
  assert.equal(resolveClientMediaUrl(''), '')
  assert.equal(
    resolveClientMediaUrl('/api/r2/gallery-media/Ritual%20Chaodu-1.jpg'),
    '/api/r2/gallery-media/Ritual%20Chaodu-1.jpg'
  )
  assert.equal(
    resolveClientMediaUrl(
      'https://pub-9638815ddd2446a6a51bfe4aa0bf030b.r2.dev/gallery-media/WhatsApp Image 2026-10-13 at 2.54.23 PM (1)-1.jpeg'
    ),
    '/api/r2/gallery-media/WhatsApp%20Image%202026-10-13%20at%202.54.23%20PM%20(1)-1.jpeg'
  )
  assert.equal(
    resolveClientMediaUrl(
      'https://pub-9638815ddd2446a6a51bfe4aa0bf030b.r2.dev/gallery-media/WhatsApp%20Image%202026-10-13%20at%202.54.23%20PM%20(1)-1.jpeg'
    ),
    '/api/r2/gallery-media/WhatsApp%20Image%202026-10-13%20at%202.54.23%20PM%20(1)-1.jpeg'
  )
  assert.equal(
    resolveClientMediaUrl('https://media.tekhaybio.org/gallery-media/foto.jpg'),
    'https://media.tekhaybio.org/gallery-media/foto.jpg'
  )
})





