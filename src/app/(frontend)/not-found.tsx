/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 text-stone-900 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-200/70 text-xs font-serif font-bold text-stone-700 tracking-wider">
          <span>404</span>
          <span>•</span>
          <span>德海廟</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-stone-900">
          Halaman Tidak Ditemukan
        </h1>

        <p className="text-stone-600 text-sm md:text-base leading-relaxed">
          Halaman yang Anda cari tidak tersedia, telah dipindahkan, atau alamat URL yang dituju belum terdaftar.
        </p>

        <p className="text-stone-500 text-xs italic">
          The page you are looking for is unavailable, has been moved, or does not exist.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/id"
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium shadow-xs"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/en"
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-stone-300 text-stone-700 rounded-md hover:bg-stone-100 transition-colors text-sm font-medium"
          >
            Return to English Home
          </Link>
        </div>
      </div>
    </main>
  )
}
