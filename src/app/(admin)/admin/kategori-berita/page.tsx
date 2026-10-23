/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Plus, Edit, Tag } from 'lucide-react'
import { AdminPagination } from '@/components/admin/AdminPagination'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  const { page, limit } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  const currentLimit = parseInt(limit || '10', 10)

  const payload = await getPayload({ config: configPromise })
  const data = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: currentLimit,
    page: currentPage,
    sort: '-createdAt',
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Kategori Berita
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Kelola klasifikasi topik dan kategori berita untuk Klenteng Tek Hay Bio.
          </p>
        </div>
        <Link
          href="/admin/kategori-berita/tambah"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-2xs border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 text-stone-900 text-xs font-semibold border-b border-stone-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Nama Kategori</th>
                <th className="px-6 py-3.5 font-semibold">Slug URL</th>
                <th className="px-6 py-3.5 font-semibold">Dibuat Pada</th>
                <th className="px-6 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {data.docs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-500 space-y-2">
                    <Tag className="w-8 h-8 text-stone-400 mx-auto" />
                    <p className="font-medium">Belum ada kategori yang dibuat.</p>
                  </td>
                </tr>
              ) : (
                data.docs.map((cat: any) => {
                  const title =
                    typeof cat.title === 'string'
                      ? cat.title
                      : cat.title?.id || cat.title?.en || '-'
                  return (
                    <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-stone-900">{title}</td>
                      <td className="px-6 py-3.5 font-mono text-[11px] text-stone-500">{cat.slug}</td>
                      <td className="px-6 py-3.5 text-stone-500">
                        {new Date(cat.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/admin/kategori-berita/${cat.id}`}
                          className="inline-flex items-center justify-center p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit Kategori"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
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
          itemName="kategori"
          hasPrevPage={data.hasPrevPage}
          hasNextPage={data.hasNextPage}
          prevPage={data.prevPage}
          nextPage={data.nextPage}
          baseUrl="/admin/kategori-berita"
          limit={currentLimit}
        />
      </div>
    </div>
  )
}
