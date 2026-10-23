/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ActivitiesForm } from '@/components/admin/ActivitiesForm'

export const dynamic = 'force-dynamic'

export default async function AddActivityPage() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/kegiatan"
            className="p-1.5 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors shadow-2xs"
            title="Kembali ke Daftar Kegiatan"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Tambah Agenda Ritual &amp; Perayaan
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Daftarkan upacara sembahyang, perayaan keagamaan, atau hari kebesaran dewa klenteng.
            </p>
          </div>
        </div>

        <Link
          href="/admin/kegiatan"
          className="text-xs font-semibold text-stone-700 hover:text-stone-900 px-3.5 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          Kembali ke Daftar
        </Link>
      </div>

      <ActivitiesForm />
    </div>
  )
}
