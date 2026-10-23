import React from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { ShieldCheck, UserCheck, ExternalLink, ShieldAlert } from 'lucide-react'
import { AdminPagination } from '@/components/admin/AdminPagination'

export const dynamic = 'force-dynamic'

export default async function PenggunaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  const { page, limit } = await searchParams
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    redirect('/admin/login')
  }

  if (user.role !== 'super_admin') {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 text-center max-w-lg mx-auto my-12 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-serif font-bold text-stone-900 mb-2">Akses Ditolak</h1>
        <p className="text-sm text-stone-600 mb-6">
          Anda tidak memiliki izin untuk mengelola pengguna. Halaman ini khusus untuk peran Super Administrator.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    )
  }

  const currentPage = parseInt(page || '1', 10)
  const currentLimit = parseInt(limit || '50', 10)

  const users = await payload.find({
    collection: 'users',
    limit: currentLimit,
    page: currentPage,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Kelola Pengguna Sistem
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Daftar akun administrator dan editor konten Klenteng Tek Hay Bio.
          </p>
        </div>
        <Link
          href="/admin-payload/collections/users/create"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-2xs transition-colors"
        >
          <span>Tambah Pengguna Baru</span>
          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50/80 text-stone-700 font-medium border-b border-stone-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Akun Email</th>
                <th className="px-6 py-3.5">Peran Akses</th>
                <th className="px-6 py-3.5">Tanggal Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.docs.map((u) => {
                const isSuper = u.role === 'super_admin'
                return (
                  <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-stone-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 font-mono text-xs">
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${
                          isSuper
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {isSuper ? (
                          <ShieldCheck className="w-3 h-3 text-amber-700" />
                        ) : (
                          <UserCheck className="w-3 h-3 text-stone-500" />
                        )}
                        <span>{isSuper ? 'Super Admin' : 'Editor Konten'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500">
                      {new Date(u.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={users.page as number}
          totalPages={users.totalPages}
          totalDocs={users.totalDocs}
          itemName="pengguna"
          hasPrevPage={users.hasPrevPage}
          hasNextPage={users.hasNextPage}
          prevPage={users.prevPage}
          nextPage={users.nextPage}
          baseUrl="/admin/pengguna"
          limit={currentLimit}
        />

        <div className="p-4 border-t border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-600">
          <p>
            Manajemen kata sandi dan hak akses akun dikelola secara aman melalui mesin Payload Auth.
          </p>
          <Link
            href="/admin-payload/collections/users"
            className="inline-flex items-center gap-1 font-semibold text-amber-900 hover:text-amber-800 hover:underline"
          >
            <span>Buka Koleksi Pengguna di Payload</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
