'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  X,
  Check,
  Loader2,
  Image as ImageIcon,
  Video,
  Search,
  Plus,
  FolderPlus,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react'
import { isMediaVideo } from '@/lib/gallery/utils'

export interface AlbumMediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectMedia: (selectedDocs: any[]) => void
  existingMediaIds: string[]
}

export function AlbumMediaPickerModal({
  isOpen,
  onClose,
  onSelectMedia,
  existingMediaIds,
}: AlbumMediaPickerModalProps) {
  const [mediaList, setMediaList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all')
  const [selectedMap, setSelectedMap] = useState<Map<string, any>>(new Map())
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalDocs, setTotalDocs] = useState(0)

  const existingSet = useMemo(() => new Set(existingMediaIds || []), [existingMediaIds])

  const fetchMedia = useCallback(
    async (pageToLoad: number, append = false) => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams({
          limit: '40',
          page: String(pageToLoad),
          sort: '-createdAt',
        })

        const res = await fetch(`/api/gallery-media?${queryParams.toString()}`)
        const data = await res.json()
        const docs = data.docs || []

        setMediaList((prev) => (append ? [...prev, ...docs] : docs))
        setHasMore(data.hasNextPage || false)
        setTotalDocs(data.totalDocs || docs.length)
        setPage(pageToLoad)
      } catch (e) {
        console.error('Gagal memuat repositori media galeri:', e)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (isOpen) {
      fetchMedia(1, false)
      setSelectedMap(new Map())
      setSearchQuery('')
      setMediaTypeFilter('all')
    }
  }, [isOpen, fetchMedia])

  // Filter berdasarkan pencarian dan tipe media
  const filteredMedia = useMemo(() => {
    let result = mediaList

    if (mediaTypeFilter !== 'all') {
      result = result.filter((m) => {
        const isVid = isMediaVideo(m)
        return mediaTypeFilter === 'video' ? isVid : !isVid
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((m) => {
        const title = (m.title || '').toLowerCase()
        const alt = (m.alt || '').toLowerCase()
        const filename = (m.filename || '').toLowerCase()
        return title.includes(q) || alt.includes(q) || filename.includes(q)
      })
    }

    return result
  }, [mediaList, searchQuery, mediaTypeFilter])

  const toggleSelect = (doc: any) => {
    if (existingSet.has(doc.id)) return // Jangan izinkan jika sudah di album

    setSelectedMap((prev) => {
      const next = new Map(prev)
      if (next.has(doc.id)) {
        next.delete(doc.id)
      } else {
        next.set(doc.id, doc)
      }
      return next
    })
  }

  // Pilih Semua yang dapat dipilih dalam tampilan saat ini
  const selectAllAvailable = () => {
    const selectable = filteredMedia.filter((m) => !existingSet.has(m.id))
    setSelectedMap((prev) => {
      const next = new Map(prev)
      selectable.forEach((m) => next.set(m.id, m))
      return next
    })
  }

  const clearSelection = () => {
    setSelectedMap(new Map())
  }

  const handleConfirm = () => {
    if (selectedMap.size === 0) return
    const docs = Array.from(selectedMap.values())
    onSelectMedia(docs)
    onClose()
  }

  if (!isOpen) return null

  const selectedCount = selectedMap.size
  const availableInView = filteredMedia.filter((m) => !existingSet.has(m.id)).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Header */}
        <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 id="modal-headline" className="text-base font-serif font-bold text-slate-900">
                  Pilih Media dari Repositori Galeri
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih foto dan video yang sudah ada untuk ditambahkan ke album ini tanpa perlu mengunggah ulang.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            {/* Media Type Filter Tabs */}
            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs font-medium w-fit">
              <button
                type="button"
                onClick={() => setMediaTypeFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  mediaTypeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Media
              </button>
              <button
                type="button"
                onClick={() => setMediaTypeFilter('image')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                  mediaTypeFilter === 'image'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Foto
              </button>
              <button
                type="button"
                onClick={() => setMediaTypeFilter('video')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                  mediaTypeFilter === 'video'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                Video
              </button>
            </div>

            {/* Search Input & Select All */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul atau berkas..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {availableInView > 0 && (
                <button
                  type="button"
                  onClick={selectAllAvailable}
                  className="text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  Pilih Semua ({availableInView})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body: Media Grid */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto min-h-[300px]">
          {loading && mediaList.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              <span>Memuat repositori media...</span>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                {searchQuery
                  ? `Tidak ada media yang cocok dengan "${searchQuery}".`
                  : 'Belum ada media dalam kategori ini.'}
              </p>
              <p className="text-xs text-slate-400">
                Coba gunakan kata kunci lain atau pilih tab filter yang berbeda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredMedia.map((m) => {
                const isAlreadyInAlbum = existingSet.has(m.id)
                const isSelected = selectedMap.has(m.id)
                const isVid = isMediaVideo(m)
                const thumbUrl = m.sizes?.thumbnail?.url || m.url || '/placeholder.png'
                const displayTitle = m.title || m.filename || 'Media Dokumentasi'

                return (
                  <div
                    key={m.id}
                    onClick={() => toggleSelect(m)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all select-none group ${
                      isAlreadyInAlbum
                        ? 'opacity-40 border-slate-200 cursor-not-allowed bg-slate-100'
                        : isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-md cursor-pointer'
                          : 'border-slate-200 hover:border-amber-400 cursor-pointer hover:shadow-xs'
                    }`}
                  >
                    {/* Media Thumbnail */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbUrl}
                      alt={m.alt || displayTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Video Indicator Badge */}
                    {isVid && (
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        <Video className="w-3 h-3 text-amber-400" />
                        <span>VIDEO</span>
                      </div>
                    )}

                    {/* Status Badge: Already in album vs Selected Checkbox */}
                    <div className="absolute top-2 right-2 z-10">
                      {isAlreadyInAlbum ? (
                        <span className="text-[9px] font-semibold bg-slate-900/80 text-white px-2 py-0.5 rounded-full shadow-xs">
                          Sudah di Album
                        </span>
                      ) : isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md animate-in zoom-in-75 duration-150">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata Label */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-5">
                      <p className="text-[11px] font-semibold text-white truncate" title={displayTitle}>
                        {displayTitle}
                      </p>
                      <p className="text-[9px] text-slate-300 truncate font-mono">
                        {m.filename}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Load More Button */}
          {!loading && hasMore && !searchQuery && (
            <div className="pt-6 pb-2 text-center">
              <button
                type="button"
                onClick={() => fetchMedia(page + 1, true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors border border-slate-200"
              >
                Muat Lebih Banyak Media ({mediaList.length} dari {totalDocs})
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {selectedCount > 0 ? (
                <span className="text-amber-800">
                  {selectedCount} media dipilih untuk ditambahkan
                </span>
              ) : (
                <span className="text-slate-500">
                  Klik media di atas untuk memilih
                </span>
              )}
            </span>

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-slate-400 hover:text-rose-600 underline transition-colors ml-2"
              >
                Batal Pilih Semua
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs ${
                selectedCount > 0
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Tambahkan ke Album {selectedCount > 0 ? `(${selectedCount})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
