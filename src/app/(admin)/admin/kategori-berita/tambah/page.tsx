import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CategoryForm } from '@/components/admin/CategoryForm'

export default function AddCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/kategori-berita"
          className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
          title="Kembali ke Daftar Kategori"
        >
          <ArrowLeft className="w-4 h-4 text-stone-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Tambah Kategori Berita Baru
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Buat klasifikasi topik baru untuk berita dan warta klenteng.
          </p>
        </div>
      </div>

      <CategoryForm />
    </div>
  )
}
