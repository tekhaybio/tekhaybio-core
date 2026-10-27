/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { WebsiteInfoForm } from '@/components/admin/WebsiteInfoForm'

export const dynamic = 'force-dynamic'

export default async function WebsiteInfoAdminPage() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  // Enforce super_admin in UI as well for accessing this page
  if (user.role !== 'super_admin') {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 text-center max-w-lg mx-auto my-12 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-serif font-bold text-stone-900 mb-2">Akses Ditolak</h1>
        <p className="text-sm text-stone-600 mb-6">
          Anda tidak memiliki izin untuk mengelola informasi website. Halaman ini khusus untuk peran Super Administrator.
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

  const contactData = await payload.findGlobal({ slug: 'contact-information', locale: 'all' })
  const siteData = await payload.findGlobal({ slug: 'site-settings', locale: 'all' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
          Informasi &amp; Kontak Website
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Kelola kontak operasional, alamat sekretariat, nomor telepon, dan identitas TITD.
        </p>
      </div>

      <WebsiteInfoForm contactData={contactData} siteData={siteData} />
    </div>
  )
}
