'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  X,
  UploadCloud,
  Check,
  Loader2,
  Image as ImageIcon,
  Search,
  AlertCircle,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useAdminFeedback } from './AdminFeedbackContext'

export function MediaPicker({
  value,
  onChange,
  mediaCollection = 'media',
}: {
  value?: any
  onChange: (media: any) => void
  mediaCollection?: string
}) {
  const { toast, confirm } = useAdminFeedback()
  const [showModal, setShowModal] = useState(false)
  const [mediaList, setMediaList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null)
  const [usage, setUsage] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalDocs, setTotalDocs] = useState(0)

  const fetchMedia = useCallback(
    async (pageToLoad: number, append = false) => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams({
          limit: '40',
          page: String(pageToLoad),
          sort: '-createdAt',
        })

        const res = await fetch(`/api/${mediaCollection}?${queryParams.toString()}`)
        const data = await res.json()
        const docs = data.docs || []

        setMediaList((prev) => (append ? [...prev, ...docs] : docs))
        setHasMore(data.hasNextPage || false)
        setTotalDocs(data.totalDocs || docs.length)
        setPage(pageToLoad)
      } catch (e) {
        console.error(e)
        toast.error('Gagal memuat daftar media.')
      } finally {
        setLoading(false)
      }
    },
    [mediaCollection, toast]
  )

  useEffect(() => {
    if (showModal) {
      fetchMedia(1, false)
      setSelectedMedia(null)
      setUsage(null)
      setSearchQuery('')
    }
  }, [showModal, fetchMedia])

  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return mediaList
    const q = searchQuery.toLowerCase()
    return mediaList.filter(
      (m) =>
        (m.alt && m.alt.toLowerCase().includes(q)) ||
        (m.filename && m.filename.toLowerCase().includes(q)) ||
        (m.title && m.title.toLowerCase().includes(q))
    )
  }, [mediaList, searchQuery])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt', file.name)
    try {
      const res = await fetch(`/api/${mediaCollection}`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.doc) {
        setMediaList((prev) => [data.doc, ...prev])
        onChange(data.doc)
        setShowModal(false)
        toast.success(`File "${file.name}" berhasil diunggah.`)
      } else {
        toast.error(data.message || 'Gagal mengunggah file media.')
      }
    } catch (e: any) {
      console.error('Upload failed', e)
      toast.error('Gagal mengunggah file: ' + (e.message || 'Kesalahan jaringan.'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteMedia = async () => {
    if (!selectedMedia) return
    const ok = await confirm({
      title: 'Hapus Media dari Server',
      message: `Hapus file "${selectedMedia.filename || 'media'}" secara permanen dari server?\n\nGambar ini belum digunakan oleh konten klenteng mana pun. Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus File',
      isDanger: true,
    })
    if (!ok) return

    try {
      const res = await fetch(`/api/${mediaCollection}/${selectedMedia.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      setMediaList((prev) => prev.filter((m) => m.id !== selectedMedia.id))
      setSelectedMedia(null)
      toast.success('Media berhasil dihapus secara permanen.')
    } catch (e: any) {
      toast.error('Gagal menghapus media: ' + (e.message || 'Kesalahan sistem.'))
    }
  }

  const handleSelectMedia = (m: any) => {
    setSelectedMedia(m)
    setUsage(null)
    fetch(`/api/media-usage?collection=${mediaCollection}&id=${m.id}`)
      .then((r) => r.json())
      .then(setUsage)
      .catch((err) => console.error('Usage check error', err))
  }

  return (
    <div>
      {/* Current Value Preview */}
      {value ? (
        <div className="relative inline-block border border-stone-200 rounded-lg overflow-hidden group shadow-2xs bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.url || (typeof value === 'string' ? value : '')}
            className="h-32 w-auto max-w-full object-cover"
            alt="Preview"
          />
          <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="bg-white text-stone-900 text-xs px-2.5 py-1.5 rounded-md font-semibold hover:bg-stone-100 transition-colors shadow-xs"
            >
              Ganti Media
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="bg-rose-600 text-white text-xs px-2.5 py-1.5 rounded-md font-semibold hover:bg-rose-700 transition-colors shadow-xs"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-stone-300 rounded-xl p-5 flex flex-col items-center justify-center text-stone-600 hover:bg-stone-50 hover:text-stone-900 hover:border-stone-400 transition-colors w-full"
        >
          <div className="p-3 bg-stone-100 rounded-full mb-2">
            <ImageIcon className="w-5 h-5 text-stone-500" />
          </div>
          <span className="text-xs font-semibold">Pilih atau Unggah Gambar</span>
          <span className="text-[11px] text-stone-400 mt-0.5">Koleksi: {mediaCollection}</span>
        </button>
      )}

      {/* Media Picker Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-2xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-5xl h-[85vh] max-h-[800px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 border-b border-stone-200 gap-3 bg-stone-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-stone-900 text-amber-300 rounded-lg">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-stone-900">
                    Pustaka Media ({mediaCollection})
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Pilih gambar yang sudah ada atau unggah file baru dari komputer.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama file..."
                    className="pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary w-48 sm:w-64"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-500 transition-colors"
                  aria-label="Tutup modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Media Grid */}
              <div className="flex-1 p-5 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {/* Upload Card */}
                  <label className="border-2 border-dashed border-stone-300 hover:border-primary/80 hover:bg-stone-50/80 rounded-xl flex flex-col items-center justify-center cursor-pointer aspect-square bg-stone-50 transition-all group">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary mb-1" />
                    ) : (
                      <UploadCloud className="w-7 h-7 text-stone-400 group-hover:text-primary mb-1 transition-colors" />
                    )}
                    <span className="text-xs text-stone-700 font-semibold group-hover:text-primary transition-colors">
                      {isUploading ? 'Mengunggah...' : 'Unggah File'}
                    </span>
                    <span className="text-[10px] text-stone-400">JPG, PNG, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={handleUpload}
                    />
                  </label>

                  {/* Media Items */}
                  {filteredMedia.map((m: any) => {
                    const isSelected = selectedMedia?.id === m.id
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMedia(m)}
                        className={`cursor-pointer relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                            : 'border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.sizes?.thumbnail?.url || m.url}
                          alt={m.alt || m.filename || 'Media'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 to-transparent p-2 pt-4">
                          <p className="text-[10px] text-white font-medium truncate">
                            {m.filename}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Empty State */}
                {!loading && filteredMedia.length === 0 && (
                  <div className="py-16 text-center text-stone-500 space-y-2">
                    <ImageIcon className="w-8 h-8 text-stone-400 mx-auto" />
                    <p className="text-xs font-medium">
                      {searchQuery
                        ? `Tidak ada file yang cocok dengan pencarian "${searchQuery}".`
                        : 'Belum ada media dalam koleksi ini.'}
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="py-12 flex justify-center items-center text-stone-400 gap-2 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Memuat media...</span>
                  </div>
                )}

                {/* Load More Button */}
                {!loading && hasMore && !searchQuery && (
                  <div className="pt-6 pb-2 text-center">
                    <button
                      type="button"
                      onClick={() => fetchMedia(page + 1, true)}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-lg transition-colors border border-stone-200"
                    >
                      Muat Lebih Banyak Media ({mediaList.length} dari {totalDocs})
                    </button>
                  </div>
                )}
              </div>

              {/* Media Inspector Sidebar */}
              {selectedMedia && (
                <div className="w-72 sm:w-80 border-l border-stone-200 p-5 flex flex-col overflow-y-auto bg-stone-50/80 shrink-0">
                  <h3 className="font-serif font-bold text-sm text-stone-900 mb-3 border-b border-stone-200 pb-2">
                    Detail Media
                  </h3>

                  {/* Thumbnail */}
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-stone-200 bg-stone-900 mb-3 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedMedia.url}
                      className="w-full h-full object-contain"
                      alt="Preview detail"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 text-xs text-stone-600 mb-4 bg-white p-3 rounded-xl border border-stone-200">
                    <div className="font-semibold text-stone-900 truncate" title={selectedMedia.filename}>
                      {selectedMedia.filename}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {selectedMedia.width && selectedMedia.height
                        ? `${selectedMedia.width} × ${selectedMedia.height} px`
                        : ''}
                      {selectedMedia.filesize
                        ? ` • ${(selectedMedia.filesize / 1024).toFixed(0)} KB`
                        : ''}
                    </div>
                    {selectedMedia.alt && (
                      <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-100 italic">
                        Alt: "{selectedMedia.alt}"
                      </div>
                    )}
                  </div>

                  {/* Safety Usage Tracker */}
                  <div className="mb-4 p-3 bg-white rounded-xl border border-stone-200 space-y-1.5">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Status Penggunaan (Archive Safety)
                    </div>
                    {!usage ? (
                      <div className="text-xs text-stone-500 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-400" />
                        <span>Memeriksa relasi konten...</span>
                      </div>
                    ) : usage.used ? (
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-amber-700 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Digunakan ({usage.references?.length || 0} konten)</span>
                        </div>
                        <ul className="text-[11px] text-stone-600 list-disc pl-4 space-y-0.5 max-h-24 overflow-y-auto">
                          {usage.references?.map((r: any, i: number) => (
                            <li key={i} className="truncate">
                              <span className="font-medium capitalize">{r.type}</span>: {r.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Belum digunakan (Aman dihapus)</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto space-y-2 pt-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => {
                        onChange(selectedMedia)
                        setShowModal(false)
                      }}
                      className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 px-4 font-semibold text-xs transition-colors shadow-xs"
                    >
                      Pilih Media Ini
                    </button>

                    {usage && !usage.used && (
                      <button
                        type="button"
                        onClick={handleDeleteMedia}
                        className="w-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg py-2 px-3 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus dari Server</span>
                      </button>
                    )}

                    {usage && usage.used && (
                      <button
                        type="button"
                        disabled
                        onClick={() => {
                          toast.warning(
                            `Gambar ini tidak dapat dihapus karena masih digunakan oleh ${usage.references.length} konten klenteng.`
                          )
                        }}
                        className="w-full bg-stone-100 text-stone-400 rounded-lg py-2 px-3 font-medium text-xs cursor-not-allowed border border-stone-200"
                      >
                        Terkunci (Sedang Digunakan)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
