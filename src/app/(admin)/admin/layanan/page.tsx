/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Plus, Edit, Box, Image as ImageIcon } from 'lucide-react'
import { DeleteActionClient } from '@/components/admin/DeleteActionClient'
import {
  BulkDeleteProvider,
  BulkDeleteCheckbox,
  BulkDeleteSelectAll,
  BulkDeleteButton,
} from '@/components/admin/BulkDelete'
import { deleteServiceAction, deleteManyServiceAction } from './actions'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminTableFilter } from '@/components/admin/AdminTableFilter'

export const dynamic = 'force-dynamic'

export default async function ServicesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; q?: string; status?: string }>
}) {
  const { page, limit, q, status } = await searchParams
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  const currentPage = parseInt(page || '1', 10)
  const currentLimit = parseInt(limit || '20', 10)

  // Construct filters
  const where: any = {}
  if (q && q.trim()) {
    where.title = { contains: q.trim() }
  }
  if (status && status !== 'all') {
    where.status = { equals: status }
  }

  const data = await payload.find({
    collection: 'services',
    where,
    sort: 'sortOrder',
    limit: currentLimit,
    page: currentPage,
    depth: 1,
  })

  const baseParams = new URLSearchParams()
  if (q) baseParams.set('q', q)
  if (status && status !== 'all') baseParams.set('status', status)
  const baseUrl = `/admin/layanan${baseParams.toString() ? `?${baseParams.toString()}` : ''}`

  return (
    <BulkDeleteProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Layanan & Pelayanan Umat
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Kelola daftar pelayanan keagamaan, persembahyangan, konsultasi, dan fasilitas klenteng.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BulkDeleteButton action={deleteManyServiceAction} itemName="layanan" />
            <Link
              href="/admin/layanan/tambah"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Layanan Baru</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <AdminTableFilter
          searchPlaceholder="Cari nama layanan..."
          initialQuery={q || ''}
          initialStatus={status || 'all'}
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 text-stone-900 text-xs font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">
                    <BulkDeleteSelectAll allIds={data.docs.map((d: any) => d.id)} />
                  </th>
                  <th className="px-3 py-3.5 w-16">Foto</th>
                  <th className="px-4 py-3.5 font-semibold">Nama Layanan</th>
                  <th className="px-4 py-3.5 font-semibold">Ketersediaan</th>
                  <th className="px-4 py-3.5 font-semibold">Status Publikasi</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {data.docs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-stone-500 space-y-2">
                      <Box className="w-8 h-8 text-stone-400 mx-auto" />
                      <p className="font-medium">
                        {q || status
                          ? 'Tidak ada layanan yang cocok dengan filter saat ini.'
                          : 'Belum ada data layanan klenteng.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  data.docs.map((item: any) => {
                    const thumbUrl =
                      item.image?.sizes?.thumbnail?.url || item.image?.url || null
                    return (
                      <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <BulkDeleteCheckbox id={item.id} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-12 h-9 rounded-md bg-stone-100 border border-stone-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                            {thumbUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thumbUrl}
                                alt={item.title || 'Thumbnail'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-stone-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-900 max-w-sm">
                          <Link
                            href={`/admin/layanan/${item.id}`}
                            className="hover:text-primary transition-colors line-clamp-1 font-semibold"
                            title={item.title}
                          >
                            {item.title || 'Tanpa Judul'}
                          </Link>
                          {item.shortDescription && (
                            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                              {item.shortDescription}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                              item.availability === 'unavailable'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {item.availability === 'unavailable' ? 'Tidak Tersedia' : 'Tersedia'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
                              item.status === 'published'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            {item.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <Link
                            href={`/admin/layanan/${item.id}`}
                            className="inline-flex items-center justify-center p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit Layanan"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteActionClient
                            id={item.id}
                            action={deleteServiceAction}
                            itemName={`layanan "${item.title || 'ini'}"`}
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
            page={data.page as number}
            totalPages={data.totalPages}
            totalDocs={data.totalDocs}
            itemName="layanan"
            hasPrevPage={data.hasPrevPage}
            hasNextPage={data.hasNextPage}
            prevPage={data.prevPage}
            nextPage={data.nextPage}
            baseUrl={baseUrl}
            limit={currentLimit}
          />
        </div>
      </div>
    </BulkDeleteProvider>
  )
}
