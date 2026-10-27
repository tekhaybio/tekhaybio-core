/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, ExternalLink, Image as ImageIcon, Video, Calendar, Layers } from 'lucide-react'
import { DeleteActionClient } from '@/components/admin/DeleteActionClient'
import { BulkDeleteProvider, BulkDeleteCheckbox, BulkDeleteSelectAll, BulkDeleteButton } from '@/components/admin/BulkDelete'
import { deleteAlbumAction, deleteManyAlbumAction } from './actions'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminTableFilter } from '@/components/admin/AdminTableFilter'
import { GalleryUploader } from '@/components/admin/GalleryUploader'
import { MediaThumbnail } from '@/components/ui/MediaThumbnail'
import { getAlbumCategoryLabel, formatEventDateRange, countAlbumMedia } from '@/lib/gallery/utils'

export const dynamic = 'force-dynamic'

const mediaCollections = [
  { id: 'gallery-media', label: 'Galeri Utama' },
  { id: 'news-media', label: 'Media Berita' },
  { id: 'activity-media', label: 'Media Kegiatan' },
  { id: 'service-media', label: 'Media Layanan' },
  { id: 'history-media', label: 'Media Sejarah' },
  { id: 'site-media', label: 'Media Website' },
]

export default async function GalleryAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string
    collection?: string
    page?: string
    limit?: string
    q?: string
    category?: string
    status?: string
  }>
}) {
  const params = await searchParams
  const activeTab = params.tab || 'albums'
  const activeCollection = params.collection || 'gallery-media'
  const page = parseInt(params.page || '1', 10)
  const limit = parseInt(params.limit || '10', 10)
  const q = params.q?.trim() || ''
  const category = params.category?.trim() || ''
  const status = params.status?.trim() || ''

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  if (activeTab === 'media') {
    const mediaLimit = parseInt(params.limit || '100', 10)
    const mediaData = await payload.find({
      collection: activeCollection as any,
      sort: '-createdAt',
      limit: mediaLimit,
      page: page,
    })

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Pusat Media Terpusat</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Kelola seluruh file media fisik dari berbagai kategori konten TITD.
            </p>
          </div>
          <Link
            href="/admin/galeri"
            className="inline-flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 text-xs font-semibold shrink-0 transition-colors shadow-2xs"
          >
            &larr; Kembali ke Daftar Album
          </Link>
        </div>

        {/* Tab Sub-collections */}
        <div className="flex gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
          {mediaCollections.map((c) => (
            <Link
              key={c.id}
              href={`/admin/galeri?tab=media&collection=${c.id}`}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeCollection === c.id
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <GalleryUploader initialMedia={mediaData.docs} collection={activeCollection} />

        <AdminPagination
          page={mediaData.page as number}
          totalPages={mediaData.totalPages}
          totalDocs={mediaData.totalDocs}
          itemName="media"
          pageSizeOptions={[20, 50, 100, 200]}
          hasPrevPage={mediaData.hasPrevPage}
          hasNextPage={mediaData.hasNextPage}
          prevPage={mediaData.prevPage}
          nextPage={mediaData.nextPage}
          baseUrl={`/admin/galeri?tab=media&collection=${activeCollection}`}
          limit={mediaLimit}
        />
      </div>
    )
  }

  // Active Tab: ALBUMS
  const where: any = {}
  if (q) {
    where.title = { contains: q }
  }
  if (category && category !== 'all') {
    where.category = { equals: category }
  }
  if (status && status !== 'all') {
    where.status = { equals: status }
  }

  const albumData = await payload.find({
    collection: 'albums',
    where: Object.keys(where).length > 0 ? where : undefined,
    sort: '-createdAt',
    limit: limit,
    page: page,
    depth: 1,
    locale: 'id',
  })

  // Construct base query url for pagination
  const baseParams = new URLSearchParams()
  if (q) baseParams.set('q', q)
  if (category && category !== 'all') baseParams.set('category', category)
  if (status && status !== 'all') baseParams.set('status', status)
  const baseUrl = `/admin/galeri${baseParams.toString() ? `?${baseParams.toString()}` : ''}`

  return (
    <BulkDeleteProvider>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Galeri &amp; Dokumentasi Album</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Kelola album dokumentasi acara, upacara ritual, foto, dan video TITD Tek Hay Bio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <BulkDeleteButton action={deleteManyAlbumAction} itemName="album" />
            <Link
              href="/admin/galeri/tambah"
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Album Baru</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-stone-200 pb-2">
          <Link
            href="/admin/galeri"
            className="px-4 py-2 text-xs font-semibold rounded-t-lg bg-stone-900 text-white flex items-center gap-1.5 shadow-2xs"
          >
            <Layers className="w-4 h-4" />
            <span>Album Dokumentasi</span>
          </Link>
          <Link
            href="/admin/galeri?tab=media"
            className="px-4 py-2 text-xs font-semibold rounded-t-lg bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center gap-1.5 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Pusat File Media</span>
          </Link>
        </div>

        {/* Filters */}
        <AdminTableFilter
          searchPlaceholder="Cari judul album dokumentasi..."
          initialQuery={q || ''}
          initialCategory={category || 'all'}
          initialStatus={status || 'all'}
          categories={[
            { label: 'Ritual Keagamaan', value: 'ritual' },
            { label: 'Sembahyang Leluhur', value: 'ancestral-worship' },
            { label: 'Hari Kebesaran Dewa', value: 'deity-festival' },
            { label: 'Perayaan Budaya', value: 'cultural-celebration' },
            { label: 'Kegiatan Sosial', value: 'social-activity' },
            { label: 'Dokumentasi Lainnya', value: 'other' },
          ]}
        />

        {/* Albums Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50/80 text-stone-700 font-medium border-b border-stone-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5 w-12">
                    <BulkDeleteSelectAll allIds={albumData.docs.map((d: any) => d.id)} />
                  </th>
                  <th className="px-5 py-3.5 w-20">Sampul</th>
                  <th className="px-5 py-3.5">Judul Album</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  <th className="px-5 py-3.5">Waktu Acara</th>
                  <th className="px-5 py-3.5">Isi Media</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {albumData.docs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-stone-500">
                      Tidak ada album dokumentasi yang sesuai kriteria filter.
                    </td>
                  </tr>
                ) : (
                  albumData.docs.map((album: any) => {
                    const categoryLabel = getAlbumCategoryLabel(album.category, 'id')
                    const dateFormatted = formatEventDateRange(album.eventDate, album.eventEndDate, 'id')
                    const { photosCount, videosCount, total } = countAlbumMedia(album.mediaItems)
                    const coverUrl =
                      album.coverImage?.sizes?.thumbnail?.url ||
                      album.coverImage?.url ||
                      '/placeholder.png'

                    return (
                      <tr key={album.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <BulkDeleteCheckbox id={album.id} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden relative border border-stone-200 shrink-0">
                            <MediaThumbnail
                              media={album.coverImage}
                              alt={album.title || 'Sampul Album'}
                              showVideoBadge={true}
                              imageClassName="w-full h-full object-cover"
                              videoClassName="w-full h-full object-cover pointer-events-none"
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-stone-900">{album.title || 'Tanpa Judul'}</div>
                          <div className="text-[11px] text-stone-400 font-mono mt-0.5">/{album.slug}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                            {categoryLabel}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {dateFormatted ? (
                            <div className="flex items-center gap-1.5 text-xs text-stone-700">
                              <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{dateFormatted}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400 italic">Belum ditentukan</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-0.5 text-xs text-stone-600">
                            <span className="font-semibold text-stone-900">{total} Media</span>
                            <span className="text-[11px] text-stone-400">
                              {photosCount} Foto &bull; {videosCount} Video
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${
                              album.status === 'published'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            {album.status === 'published' ? 'Publik' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                          {album.status === 'published' && album.slug && (
                            <Link
                              href={`/id/galeri/${album.slug}`}
                              target="_blank"
                              className="inline-flex items-center justify-center p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Lihat di Website Publik"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/galeri/${album.id}`}
                            className="inline-flex items-center justify-center p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                            title="Edit Album &amp; Kelola Media"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteActionClient id={album.id} action={deleteAlbumAction} />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={albumData.page as number}
            totalPages={albumData.totalPages}
            totalDocs={albumData.totalDocs}
            itemName="album"
            pageSizeOptions={[10, 20, 50, 100]}
            hasPrevPage={albumData.hasPrevPage}
            hasNextPage={albumData.hasNextPage}
            prevPage={albumData.prevPage}
            nextPage={albumData.nextPage}
            baseUrl={baseUrl}
            limit={limit}
          />
        </div>
      </div>
    </BulkDeleteProvider>
  )
}
