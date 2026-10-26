/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocaleTabs } from '@/components/admin/LocaleTabs'
import { useAdminFeedback } from '@/components/admin/AdminFeedbackContext'

export function CategoryForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const { toast, confirm } = useAdminFeedback()
  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const getLocalized = (field: any, fallback = '') => {
    if (!field) return { id: fallback, en: fallback }
    if (typeof field === 'string') return { id: field, en: field }
    return { id: field.id || fallback, en: field.en || fallback }
  }

  const [localizedData, setLocalizedData] = useState({
    title: getLocalized(initialData?.title),
    slug: getLocalized(initialData?.slug),
    description: getLocalized(initialData?.description),
  })

  const [formData, setFormData] = useState({})

  const handleLocalizedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setLocalizedData(prev => ({
      ...prev,
      [name]: {
        ...prev[name as keyof typeof prev],
        [activeTab]: value
      }
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    
    try {
      const submitData = {
        ...formData,
        title: localizedData.title,
        slug: localizedData.slug,
        description: localizedData.description,
      }
      
      const url = initialData?.id ? `/api/categories/${initialData.id}` : '/api/categories'
      const method = initialData?.id ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })
      
      if (!res.ok) throw new Error('Failed to save category')
      router.push('/admin/kategori-berita')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id) return
    const ok = await confirm({
      title: 'Hapus Kategori Berita',
      message: 'Apakah Anda yakin ingin menghapus kategori berita ini? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus',
      isDanger: true,
    })
    if (!ok) return
    
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/categories/${initialData.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.push('/admin/kategori-berita')
      router.refresh()
    } catch (err: any) {
      toast.error('Gagal menghapus kategori: ' + (err.message || 'Kesalahan sistem'))
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <LocaleTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kategori ({activeTab.toUpperCase()})</label>
          <input 
            required={activeTab === 'id'}
            type="text" 
            name="title"
            value={localizedData.title[activeTab]}
            onChange={handleLocalizedChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">Slug URL</label>
          <div className="flex rounded-lg shadow-2xs border border-stone-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-600 transition-colors bg-white">
            <span className="inline-flex items-center px-3 bg-stone-100 text-stone-500 text-xs font-mono select-none border-r border-stone-200 shrink-0">
              /{activeTab === 'id' ? 'kategori' : 'category'}/
            </span>
            <input
              type="text"
              name="slug"
              value={localizedData.slug[activeTab]}
              onChange={handleLocalizedChange}
              placeholder="otomatis-dibuat-dari-judul"
              className="w-full px-3 py-2 text-xs font-mono text-stone-900 bg-transparent focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Kosongkan untuk membuat tautan URL permanen secara otomatis dari judul.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi ({activeTab.toUpperCase()})</label>
          <textarea 
            name="description"
            value={localizedData.description[activeTab]}
            onChange={handleLocalizedChange}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" 
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          type="submit" 
          disabled={isSaving}
          className="bg-slate-900 text-white px-6 py-2 rounded-md hover:bg-slate-800 disabled:opacity-50"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </button>
        
        {initialData?.id && (
          <button 
            type="button" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 disabled:opacity-50"
          >
            {isDeleting ? 'Hapus...' : 'Hapus'}
          </button>
        )}
      </div>
    </form>
  )
}
