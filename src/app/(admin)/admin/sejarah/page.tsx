/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { HistoryForm } from '@/components/admin/HistoryForm'

export const dynamic = 'force-dynamic'

export default async function HistoryAdminPage() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  const data = await payload.findGlobal({
    slug: 'history',
    locale: 'all',
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
          Narasi Sejarah Klenteng
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Kelola informasi sejarah berdirinya Klenteng Tek Hay Bio dan riwayat masa ke masa.
        </p>
      </div>

      <HistoryForm initialData={data} />
    </div>
  )
}
