/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { getCollection } from './queries'
import { PageHeader } from '@/components/ui/PageHeader'
import { Container, Section } from '@/components/ui/Layout'
import { MediaImage } from '@/components/ui/MediaImage'
import type { CMSRecord } from '@/types'
import Link from 'next/link'
import { Pagination, PaginationToolbar } from '@/components/ui/Pagination'
import {
  ALBUM_CATEGORIES,
  MEDIA_CATEGORIES,
  getAlbumCategoryLabel,
  formatEventDateRange,
  countAlbumMedia,
} from '@/lib/gallery/utils'
import { AlbumMediaGallery } from '@/components/gallery/AlbumMediaGallery'
import { Calendar, Image as ImageIcon, Video, Layers, ArrowRight } from 'lucide-react'

export async function GalleryPage({
  locale,
  page = 1,
  limit = 12,
  category,
  tab,
}: {
  locale: 'id' | 'en'
  page?: number
  limit?: number
  category?: string
  tab?: string
}) {
  const baseUrl = `/${locale}/${locale === 'id' ? 'galeri' : 'gallery'}`

  // Fetch published albums
  const albumWhere: any = { status: { equals: 'published' } }
  if (category && category !== 'all' && tab === 'albums') {
    albumWhere.category = { equals: category }
  }

  const {
    docs: albums,
    totalDocs: totalAlbums,
    totalPages: totalAlbumPages,
    page: currentAlbumPage,
  } = await getCollection('albums', locale, {
    where: albumWhere,
    sort: '-eventDate',
    page: tab === 'albums' ? page : 1,
    limit: tab === 'albums' ? limit : 12,
    depth: 2,
  })

  // Fetch standalone gallery media (photos / videos)
  const mediaWhere: any = {}
  if (category && category !== 'all' && (tab === 'photos' || (!tab && totalAlbums === 0))) {
    mediaWhere.category = { equals: category }
  }

  const isPhotosActiveForQuery = tab === 'photos' || (!tab && totalAlbums === 0)
  const {
    docs: mediaDocs,
    totalDocs: totalMedia,
    totalPages: totalMediaPages,
    page: currentMediaPage,
  } = await getCollection('gallery-media', locale, {
    where: Object.keys(mediaWhere).length > 0 ? mediaWhere : undefined,
    sort: '-createdAt',
    page: isPhotosActiveForQuery ? page : 1,
    limit: isPhotosActiveForQuery ? limit : 12,
    depth: 1,
  })

  // Determine active tab:
  // If user explicitly specifies 'albums' or 'photos', use it.
  // If no tab param: default to 'albums' IF albums exist, otherwise default to 'photos'.
  const activeTab: 'photos' | 'albums' =
    tab === 'photos' || tab === 'albums'
      ? tab
      : totalAlbums > 0
        ? 'albums'
        : 'photos'

  return (
    <>
      <PageHeader
        title={locale === 'id' ? 'Galeri Dokumentasi & Album' : 'Documentation Gallery & Albums'}
        description={
          locale === 'id'
            ? 'Dokumentasi visual foto dan rekaman video upacara ritual, sembahyang leluhur, hari kebesaran dewa, dan suasana Klenteng Tek Hay Bio.'
            : 'Visual documentation of photos and video footage covering rituals, ancestral worship, deity festivals, and heritage at Tek Hay Bio Temple.'
        }
      />

      <Section className="bg-stone-50">
        <Container>
          {/* Main Mode Tabs: Galeri Foto & Media vs Album Kegiatan */}
          <div className="flex border-b border-stone-200 mb-8 gap-3 sm:gap-6">
            <Link
              href={`${baseUrl}?tab=photos`}
              className={`pb-4 px-1 text-sm sm:text-base font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'photos'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{locale === 'id' ? 'Galeri Foto & Media' : 'Photos & Media Gallery'}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  activeTab === 'photos'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                {totalMedia}
              </span>
            </Link>

            <Link
              href={`${baseUrl}?tab=albums`}
              className={`pb-4 px-1 text-sm sm:text-base font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'albums'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{locale === 'id' ? 'Album Dokumentasi Acara' : 'Event Albums'}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  activeTab === 'albums'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                {totalAlbums}
              </span>
            </Link>
          </div>

          {/* TAB 1: GALERI FOTO & MEDIA */}
          {activeTab === 'photos' && (
            <div>
              {/* Category Filter Pills for Photos */}
              <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-stone-200 pb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mr-2">
                  {locale === 'id' ? 'Kategori Foto:' : 'Photo Category:'}
                </span>
                <Link
                  href={`${baseUrl}?tab=photos`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    !category || category === 'all'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {locale === 'id' ? 'Semua Foto' : 'All Photos'}
                </Link>
                {MEDIA_CATEGORIES.map((cat) => {
                  const isActive = category === cat.value
                  const filterUrl = `${baseUrl}?tab=photos&category=${cat.value}`
                  return (
                    <Link
                      key={cat.value}
                      href={filterUrl}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                      }`}
                    >
                      {cat.label[locale]}
                    </Link>
                  )
                })}
              </div>

              {mediaDocs.length === 0 ? (
                <div className="py-16 text-center text-stone-500 bg-white rounded-xl border border-stone-200 shadow-sm max-w-xl mx-auto space-y-3 px-6">
                  <ImageIcon className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-base font-medium text-stone-700">
                    {locale === 'id'
                      ? 'Belum ada foto dokumentasi pada kategori ini.'
                      : 'No documentation photos in this category yet.'}
                  </p>
                  <p className="text-xs text-stone-400">
                    {locale === 'id'
                      ? 'Pengurus klenteng akan memperbarui arsip dokumentasi secara berkala.'
                      : 'Temple management updates documentation archive periodically.'}
                  </p>
                  {category && category !== 'all' && (
                    <div className="pt-2">
                      <Link
                        href={`${baseUrl}?tab=photos`}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        ← {locale === 'id' ? 'Kembali ke Semua Foto' : 'Back to All Photos'}
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <PaginationToolbar
                    currentPage={currentMediaPage}
                    totalDocs={totalMedia}
                    limit={limit}
                    locale={locale}
                    itemName={locale === 'id' ? 'media' : 'media items'}
                    pageSizeOptions={[12, 24, 36, 48]}
                    baseUrl={
                      category ? `${baseUrl}?tab=photos&category=${category}` : `${baseUrl}?tab=photos`
                    }
                  />

                  <AlbumMediaGallery
                    mediaItems={mediaDocs}
                    locale={locale}
                    albumTitle={
                      locale === 'id'
                        ? 'Dokumentasi Klenteng Tek Hay Bio'
                        : 'Tek Hay Bio Temple Documentation'
                    }
                  />

                  <Pagination
                    totalPages={totalMediaPages}
                    currentPage={currentMediaPage}
                    totalDocs={totalMedia}
                    baseUrl={
                      category ? `${baseUrl}?tab=photos&category=${category}` : `${baseUrl}?tab=photos`
                    }
                    limit={limit}
                    locale={locale}
                    itemName={locale === 'id' ? 'media' : 'media items'}
                    pageSizeOptions={[12, 24, 36, 48]}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALBUM DOKUMENTASI ACARA */}
          {activeTab === 'albums' && (
            <div>
              {/* Category Filter Pills for Albums */}
              <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-stone-200 pb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mr-2">
                  {locale === 'id' ? 'Kategori Album:' : 'Album Category:'}
                </span>
                <Link
                  href={`${baseUrl}?tab=albums`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    !category || category === 'all'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {locale === 'id' ? 'Semua Album' : 'All Albums'}
                </Link>
                {ALBUM_CATEGORIES.map((cat) => {
                  const isActive = category === cat.value
                  const filterUrl = `${baseUrl}?tab=albums&category=${cat.value}`
                  return (
                    <Link
                      key={cat.value}
                      href={filterUrl}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                      }`}
                    >
                      {cat.label[locale]}
                    </Link>
                  )
                })}
              </div>

              {/* Album List Grid */}
              {albums.length === 0 ? (
                <div className="py-16 text-center text-stone-500 bg-white rounded-xl border border-stone-200 shadow-sm max-w-xl mx-auto space-y-4 px-6">
                  <Layers className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-base font-medium text-stone-700">
                    {locale === 'id'
                      ? 'Belum ada album dokumentasi pada kategori ini.'
                      : 'No documentation albums in this category yet.'}
                  </p>
                  <p className="text-xs text-stone-400">
                    {locale === 'id'
                      ? 'Pengurus klenteng akan memperbarui album dokumentasi kegiatan secara berkala.'
                      : 'Temple management updates event documentation albums periodically.'}
                  </p>
                  {category && category !== 'all' ? (
                    <div className="pt-2">
                      <Link
                        href={`${baseUrl}?tab=albums`}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        ← {locale === 'id' ? 'Kembali ke Semua Album' : 'Back to All Albums'}
                      </Link>
                    </div>
                  ) : (
                    totalMedia > 0 && (
                      <div className="pt-3">
                        <Link
                          href={`${baseUrl}?tab=photos`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-xs"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>
                            {locale === 'id'
                              ? `Jelajahi ${totalMedia} Foto di Galeri Foto`
                              : `Browse ${totalMedia} Photos in Photo Gallery`}
                          </span>
                        </Link>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <>
                  <PaginationToolbar
                    currentPage={currentAlbumPage}
                    totalDocs={totalAlbums}
                    limit={limit}
                    locale={locale}
                    itemName={locale === 'id' ? 'album' : 'albums'}
                    pageSizeOptions={[6, 12, 18, 24]}
                    baseUrl={
                      category ? `${baseUrl}?tab=albums&category=${category}` : `${baseUrl}?tab=albums`
                    }
                  />
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {albums.map((album: any, idx: number) => {
                      const categoryLabel = getAlbumCategoryLabel(album.category, locale)
                      const dateFormatted = formatEventDateRange(
                        album.eventDate,
                        album.eventEndDate,
                        locale
                      )
                      const { photosCount, videosCount, total } = countAlbumMedia(album.mediaItems)
                      const detailUrl = `${baseUrl}/${album.slug}`

                      return (
                        <Link
                          href={detailUrl}
                          key={album.id as string}
                          className="bg-white rounded-md overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300 group flex flex-col border border-stone-200"
                        >
                          {/* Album Cover */}
                          <div className="aspect-[16/10] relative bg-stone-900 overflow-hidden">
                            <MediaImage
                              media={album.coverImage as CMSRecord}
                              fill
                              priority={idx === 0}
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Top-Right Media Counter Badge */}
                            <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-2 shadow-md border border-white/10">
                              {photosCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <ImageIcon className="w-3.5 h-3.5 text-stone-300" />
                                  {photosCount}
                                </span>
                              )}
                              {videosCount > 0 && (
                                <span className="flex items-center gap-1 text-amber-300">
                                  <Video className="w-3.5 h-3.5 text-amber-400" />
                                  {videosCount}
                                </span>
                              )}
                              {total === 0 && <span>0 Media</span>}
                            </div>
                          </div>

                          {/* Content Info */}
                          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-stone-100 text-stone-700 text-xs font-bold rounded uppercase tracking-wider">
                                  {categoryLabel}
                                </span>
                              </div>

                              <h2 className="text-xl font-bold font-serif text-stone-900 group-hover:text-primary transition-colors line-clamp-2">
                                {album.title as string}
                              </h2>

                              {dateFormatted && (
                                <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium">
                                  <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>{dateFormatted}</span>
                                </div>
                              )}

                              {Boolean(album.description) && (
                                <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                                  {album.description as string}
                                </p>
                              )}
                            </div>

                            <div className="pt-2 flex items-center text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                              <span>{locale === 'id' ? 'Buka Album Dokumentasi' : 'Open Album'}</span>
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  <Pagination
                    totalPages={totalAlbumPages}
                    currentPage={currentAlbumPage}
                    totalDocs={totalAlbums}
                    baseUrl={
                      category ? `${baseUrl}?tab=albums&category=${category}` : `${baseUrl}?tab=albums`
                    }
                    limit={limit}
                    locale={locale}
                    itemName={locale === 'id' ? 'album' : 'albums'}
                    pageSizeOptions={[6, 12, 18, 24]}
                  />
                </>
              )}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
