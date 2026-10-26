/* eslint-disable @typescript-eslint/no-explicit-any */
export type AlbumCategory =
  | 'ritual'
  | 'ancestral-worship'
  | 'deity-festival'
  | 'cultural-celebration'
  | 'social-activity'
  | 'other'

export const ALBUM_CATEGORIES: {
  value: AlbumCategory
  label: { id: string; en: string }
}[] = [
  { value: 'ritual', label: { id: 'Ritual Keagamaan', en: 'Religious Ritual' } },
  { value: 'ancestral-worship', label: { id: 'Sembahyang Leluhur', en: 'Ancestral Worship' } },
  { value: 'deity-festival', label: { id: 'Hari Kebesaran Dewa', en: 'Deity Festival' } },
  { value: 'cultural-celebration', label: { id: 'Perayaan Budaya', en: 'Cultural Celebration' } },
  { value: 'social-activity', label: { id: 'Kegiatan Sosial', en: 'Social Activity' } },
  { value: 'other', label: { id: 'Dokumentasi Lainnya', en: 'Other Documentation' } },
]

export function getAlbumCategoryLabel(category?: string | null, locale: 'id' | 'en' = 'id'): string {
  const match = ALBUM_CATEGORIES.find((c) => c.value === category)
  return match ? match.label[locale] : (locale === 'id' ? 'Dokumentasi Acara' : 'Event Documentation')
}

export const MEDIA_CATEGORIES = [
  { value: 'building', label: { id: 'Bangunan Klenteng', en: 'Temple Building' } },
  { value: 'interior', label: { id: 'Interior & Altar', en: 'Interior & Altar' } },
  { value: 'activities', label: { id: 'Kegiatan & Ritual', en: 'Activities & Rituals' } },
  { value: 'history', label: { id: 'Sejarah & Peninggalan', en: 'History & Relics' } },
  { value: 'traditions', label: { id: 'Tradisi & Budaya', en: 'Traditions & Culture' } },
  { value: 'other', label: { id: 'Dokumentasi Lainnya', en: 'Other Documentation' } },
] as const

export function getMediaCategoryLabel(category?: string | null, locale: 'id' | 'en' = 'id'): string {
  const match = MEDIA_CATEGORIES.find((c) => c.value === category)
  return match ? match.label[locale] : (locale === 'id' ? 'Umum' : 'General')
}

export const MEDIA_LIMITS = {
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB (Dibatasi 5 MB sesuai permintaan)
  MAX_VIDEO_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB (Dibatasi 10 MB sesuai permintaan)
  MAX_IMAGE_SIZE_MB: 5,
  MAX_VIDEO_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'],
} as const

export function validateMediaFile(file: { size: number; type: string; name?: string }): {
  valid: boolean
  error?: string
  mediaType: 'image' | 'video'
} {
  const isImage =
    MEDIA_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type as any) || file.type.startsWith('image/')
  const isVideo =
    MEDIA_LIMITS.ALLOWED_VIDEO_TYPES.includes(file.type as any) || file.type.startsWith('video/')

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `Format berkas "${file.name || 'file'}" tidak didukung. Gunakan format foto (JPG, PNG, WebP) atau video (MP4, WebM).`,
      mediaType: 'image',
    }
  }

  if (isImage && file.size > MEDIA_LIMITS.MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Ukuran foto "${file.name || 'file'}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) melebihi batas maksimal ${MEDIA_LIMITS.MAX_IMAGE_SIZE_MB}MB.`,
      mediaType: 'image',
    }
  }

  if (isVideo && file.size > MEDIA_LIMITS.MAX_VIDEO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Ukuran video "${file.name || 'file'}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) melebihi batas maksimal ${MEDIA_LIMITS.MAX_VIDEO_SIZE_MB}MB.`,
      mediaType: 'video',
    }
  }

  return {
    valid: true,
    mediaType: isVideo ? 'video' : 'image',
  }
}

export function isMediaVideo(media: any): boolean {
  if (!media) return false
  if (typeof media === 'string') {
    const clean = media.split('?')[0].split('#')[0]
    const ext = clean.split('.').pop()?.toLowerCase()
    if (['mp4', 'webm', 'mov', 'ogg', 'mkv'].includes(ext || '')) return true
    return false
  }
  if (media.mediaType === 'video') return true
  const mime = media.mimeType || media.mimetype || ''
  if (typeof mime === 'string' && mime.startsWith('video/')) return true
  const filename = media.filename || media.url || ''
  if (typeof filename === 'string') {
    const clean = filename.split('?')[0].split('#')[0]
    const ext = clean.split('.').pop()?.toLowerCase()
    if (['mp4', 'webm', 'mov', 'ogg', 'mkv'].includes(ext || '')) return true
  }
  return false
}

export function countAlbumMedia(mediaItems?: any[]): {
  photosCount: number
  videosCount: number
  total: number
} {
  if (!Array.isArray(mediaItems)) {
    return { photosCount: 0, videosCount: 0, total: 0 }
  }

  let photosCount = 0
  let videosCount = 0

  for (const item of mediaItems) {
    const mediaDoc = item.media || item
    if (isMediaVideo(mediaDoc)) {
      videosCount++
    } else {
      photosCount++
    }
  }

  return {
    photosCount,
    videosCount,
    total: mediaItems.length,
  }
}

export function formatEventDateRange(
  startDateStr?: string | null,
  endDateStr?: string | null,
  locale: 'id' | 'en' = 'id'
): string | null {
  if (!startDateStr) return null

  const startDate = new Date(startDateStr)
  if (isNaN(startDate.getTime())) return null

  const startFormatted = startDate.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (!endDateStr) return startFormatted

  const endDate = new Date(endDateStr)
  if (isNaN(endDate.getTime())) return startFormatted

  const isSameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate()

  if (isSameDay) return startFormatted

  const isSameMonthAndYear =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth()

  if (isSameMonthAndYear) {
    if (locale === 'id') {
      const monthYear = startDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      return `${startDate.getDate()} – ${endDate.getDate()} ${monthYear}`
    } else {
      const month = startDate.toLocaleDateString('en-US', { month: 'short' })
      return `${month} ${startDate.getDate()} – ${endDate.getDate()}, ${startDate.getFullYear()}`
    }
  }

  const endFormatted = endDate.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `${startFormatted} – ${endFormatted}`
}

export function extractCaptionText(caption: any, locale: 'id' | 'en'): string {
  if (!caption) return ''
  if (typeof caption === 'string') return caption
  if (typeof caption === 'object') {
    const val = caption[locale]
    if (typeof val === 'string') return val
    if (val && typeof val === 'object') {
      const deepVal = val[locale] ?? val.id ?? val.en
      if (typeof deepVal === 'string') return deepVal
    }
    const fallback = locale === 'id' ? caption.en : caption.id
    if (typeof fallback === 'string') return fallback
  }
  return ''
}

export function normalizeMediaItemsForLocale(
  items: any[],
  locale: 'id' | 'en'
): { media: string; caption: string; sortOrder: number }[] {
  if (!Array.isArray(items)) return []
  return items
    .map((item: any) => {
      const mediaId =
        typeof item.media === 'object' && item.media?.id
          ? item.media.id
          : typeof item.media === 'string'
            ? item.media
            : String(item.media || '')

      return {
        media: mediaId,
        caption: extractCaptionText(item.caption, locale),
      }
    })
    .filter((item) => Boolean(item.media))
    .map((item, idx) => ({
      media: item.media,
      caption: item.caption,
      sortOrder: idx,
    }))
}

