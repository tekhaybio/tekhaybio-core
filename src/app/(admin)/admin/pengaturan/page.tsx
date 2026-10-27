import React from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { ExternalLink, ShieldAlert, Sliders, Database, KeyRound, Globe2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PengaturanPage() {
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
          Anda tidak memiliki izin untuk mengakses pengaturan sistem. Halaman ini khusus untuk peran Super Administrator.
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
          Pengaturan Sistem &amp; Mesin Payload
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Konfigurasi tingkat lanjut, pengelolaan skema database, dan integrasi backend.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center border border-amber-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900">
                Payload CMS Native Console
              </h2>
              <p className="text-xs text-stone-500">Panel administrasi skema teknis Payload</p>
            </div>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Untuk keperluan audit log sistem, migrasi skema koleksi, atau debugging data mentah MongoDB, Anda dapat beralih langsung ke konsol bawaan Payload CMS.
          </p>
          <div className="pt-2">
            <Link
              href="/admin-payload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-2xs"
            >
              <span>Buka Payload CMS Admin</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900">
                Status Integrasi &amp; Database
              </h2>
              <p className="text-xs text-stone-500">Koneksi MongoDB Atlas &amp; Media Storage</p>
            </div>
          </div>
          <ul className="text-xs space-y-2.5 text-stone-600">
            <li className="flex items-center justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">Database Adapter:</span>
              <span className="font-mono font-medium text-stone-800">Mongoose / MongoDB</span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">Media Storage:</span>
              <span className="font-mono font-medium text-stone-800">Cloudflare R2 (S3 API)</span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">Mode Lokalisasi:</span>
              <span className="font-medium text-stone-800">Bilingual (id / en)</span>
            </li>
            <li className="flex items-center justify-between py-1">
              <span className="text-stone-500">Status Autentikasi:</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                JWT Auth Active
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
