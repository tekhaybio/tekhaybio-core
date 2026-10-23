import React from 'react'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { AlbumForm } from '@/components/admin/AlbumForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AddAlbumPage() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Buat Album Dokumentasi Baru</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Isi informasi dasar album terlebih dahulu, kemudian Anda dapat menambahkan banyak foto dan video.
          </p>
        </div>
        <Link
          href="/admin/galeri"
          className="text-xs font-semibold text-stone-700 hover:text-stone-900 px-3.5 py-2 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors shadow-2xs"
        >
          ← Kembali ke Daftar Album
        </Link>
      </div>

      <AlbumForm />
    </div>
  )
}
