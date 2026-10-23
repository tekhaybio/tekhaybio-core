/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ServicesForm } from '@/components/admin/ServicesForm'

export const dynamic = 'force-dynamic'

export default async function AddServicePage() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Tambah Layanan Klenteng
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Daftarkan jenis pelayanan keagamaan, doa permohonan, atau fasilitas persembahyangan.
          </p>
        </div>
        <Link
          href="/admin/layanan"
          className="text-xs font-semibold text-stone-700 hover:text-stone-900 px-3.5 py-2 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors shadow-2xs self-start sm:self-auto"
        >
          ← Kembali ke Daftar Layanan
        </Link>
      </div>

      <ServicesForm />
    </div>
  )
}
