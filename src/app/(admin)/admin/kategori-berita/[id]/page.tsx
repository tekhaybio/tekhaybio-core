import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ArrowLeft } from 'lucide-react'
import { CategoryForm } from '@/components/admin/CategoryForm'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const payload = await getPayload({ config: configPromise })
  
  let data
  try {
    data = await payload.findByID({
      collection: 'categories',
      id: resolvedParams.id,
      depth: 1
    })
  } catch (error) {
    notFound()
  }

  if (!data) notFound()

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
            Edit Kategori Berita
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Perbarui data kategori &bull; {data.title}
          </p>
        </div>
      </div>
      
      <CategoryForm initialData={data} />
    </div>
  )
}
