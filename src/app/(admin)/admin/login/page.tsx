/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LoginForm } from './LoginForm'
import { CreateFirstUserForm } from './CreateFirstUserForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const payload = await getPayload({ config: configPromise })

  let totalUsers = 0
  try {
    const countResult = await payload.count({ collection: 'users' })
    totalUsers = countResult.totalDocs
  } catch {
    // If DB is offline
  }

  const { user } = await payload.auth({ headers: await headers() })

  if (user) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100/70 p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Temple Brand Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-stone-900 text-amber-300 font-serif font-bold text-2xl shadow-2xs mb-3">
            德
          </div>
          <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Klenteng Tek Hay Bio
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {totalUsers === 0 ? 'Konfigurasi Akun Awal Sistem' : 'Portal Manajemen & Administrasi Konten'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xs border border-stone-200">
          <h2 className="text-sm font-semibold text-stone-800 mb-5 pb-3 border-b border-stone-100">
            {totalUsers === 0 ? 'Buat Akun Administrator' : 'Masuk ke Akun Anda'}
          </h2>
          {totalUsers === 0 ? <CreateFirstUserForm /> : <LoginForm />}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/id"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Website Utama</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
