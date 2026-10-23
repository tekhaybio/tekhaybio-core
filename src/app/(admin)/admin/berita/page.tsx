/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Plus, Edit, FileText, Image as ImageIcon } from 'lucide-react'
import { DeleteActionClient } from '@/components/admin/DeleteActionClient'
import {
  BulkDeleteProvider,
  BulkDeleteCheckbox,
  BulkDeleteSelectAll,
  BulkDeleteButton,
} from '@/components/admin/BulkDelete'
import { deleteNewsAction, deleteManyNewsAction } from './actions'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminTableFilter } from '@/components/admin/AdminTableFilter'

export const dynamic = 'force-dynamic'

export default async function NewsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; q?: string; category?: string; status?: string }>
}) {
  const { page, limit, q, category, status } = await searchParams
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) redirect('/admin/login')

  const currentPage = parseInt(page || '1', 10)
  const currentLimit = parseInt(limit || '10', 10)

  // Construct filters
  const where: any = {}
  if (q && q.trim()) {
    where.title = { contains: q.trim() }
  }
  if (category && category !== 'all') {
    where.category = { equals: category }
  }
  if (status && status !== 'all') {
    where.status = { equals: status }
  }

  const [news, categoriesData] = await Promise.all([
    payload.find({
      collection: 'posts',
      where,
      sort: '-createdAt',
      limit: currentLimit,
      page: currentPage,
      depth: 1,
    }),
    payload.find({
      collection: 'categories',
      limit: 100,
      depth: 0,
    }),
  ])

  const categoryOptions = categoriesData.docs.map((cat: any) => ({
    value: cat.id,
    label: typeof cat.title === 'string' ? cat.title : cat.title?.id || cat.title?.en || cat.slug,
  }))

  // Construct base query url for pagination
  const baseParams = new URLSearchParams()
  if (q) baseParams.set('q', q)
  if (category && category !== 'all') baseParams.set('category', category)
  if (status && status !== 'all') baseParams.set('status', status)
  const baseUrl = `/admin/berita${baseParams.toString() ? `?${baseParams.toString()}` : ''}`

  return (
    <BulkDeleteProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Warta & Berita Klenteng
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Kelola artikel, pengumuman, dan kabar terkini seputar kegiatan Klenteng Tek Hay Bio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BulkDeleteButton action={deleteManyNewsAction} itemName="berita" />
            <Link
              href="/admin/berita/tambah"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Berita Baru</span>
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <AdminTableFilter
          searchPlaceholder="Cari judul berita atau artikel..."
          categories={categoryOptions}
          initialQuery={q || ''}
          initialCategory={category || 'all'}
          initialStatus={status || 'all'}
        />

        {/* News Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 text-stone-900 text-xs font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">
                    <BulkDeleteSelectAll allIds={news.docs.map((d: any) => d.id)} />
                  </th>
                  <th className="px-3 py-3.5 w-16">Foto</th>
                  <th className="px-4 py-3.5 font-semibold">Judul Artikel</th>
                  <th className="px-4 py-3.5 font-semibold">Kategori</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold">Tanggal Dibuat</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {news.docs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-stone-500 space-y-2">
                      <FileText className="w-8 h-8 text-stone-400 mx-auto" />
                      <p className="font-medium">
                        {q || category || status
                          ? 'Tidak ada berita yang cocok dengan filter pencarian saat ini.'
                          : 'Belum ada berita yang ditulis.'}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Klik tombol "Tulis Berita Baru" untuk membuat artikel pertama Anda.
                      </p>
                    </td>
                  </tr>
                ) : (
                  news.docs.map((post: any) => {
                    const thumbUrl =
                      post.featuredImage?.sizes?.thumbnail?.url ||
                      post.featuredImage?.url ||
                      null
                    const categoryTitle =
                      typeof post.category === 'string'
                        ? post.category
                        : post.category?.title?.id ||
                          post.category?.title?.en ||
                          post.category?.title ||
                          'Umum'

                    return (
                      <tr key={post.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <BulkDeleteCheckbox id={post.id} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-12 h-9 rounded-md bg-stone-100 border border-stone-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                            {thumbUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thumbUrl}
                                alt={post.title || 'Thumbnail'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-stone-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-900 max-w-sm">
                          <Link
                            href={`/admin/berita/${post.id}`}
                            className="hover:text-primary transition-colors line-clamp-1 font-semibold"
                            title={post.title}
                          >
                            {post.title || 'Tanpa Judul'}
                          </Link>
                          {post.excerpt && (
                            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                              {post.excerpt}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-stone-600">
                          <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-700 text-[11px] font-medium border border-stone-200/60">
                            {categoryTitle}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
                              post.status === 'published'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            {post.status === 'published' ? 'Publik' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-500">
                          {new Date(post.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <Link
                            href={`/admin/berita/${post.id}`}
                            className="inline-flex items-center justify-center p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit Berita"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteActionClient
                            id={post.id}
                            action={deleteNewsAction}
                            itemName={`berita "${post.title || 'ini'}"`}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={news.page as number}
            totalPages={news.totalPages}
            totalDocs={news.totalDocs}
            itemName="berita"
            hasPrevPage={news.hasPrevPage}
            hasNextPage={news.hasNextPage}
            prevPage={news.prevPage}
            nextPage={news.nextPage}
            baseUrl={baseUrl}
            limit={currentLimit}
          />
        </div>
      </div>
    </BulkDeleteProvider>
  )
}
