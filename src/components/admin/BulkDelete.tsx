'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useAdminFeedback } from './AdminFeedbackContext'

interface BulkDeleteContextType {
  selectedIds: string[]
  toggleId: (id: string) => void
  toggleAll: (ids: string[]) => void
  clear: () => void
  isDeleting: boolean
  setIsDeleting: (v: boolean) => void
}

const BulkDeleteContext = createContext<BulkDeleteContextType | null>(null)

export function BulkDeleteProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleAll = (ids: string[]) => {
    if (ids.length > 0 && selectedIds.length === ids.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(ids)
    }
  }

  return (
    <BulkDeleteContext.Provider
      value={{
        selectedIds,
        toggleId,
        toggleAll,
        clear: () => setSelectedIds([]),
        isDeleting,
        setIsDeleting,
      }}
    >
      {children}
    </BulkDeleteContext.Provider>
  )
}

export function useBulkDelete() {
  const ctx = useContext(BulkDeleteContext)
  if (!ctx) throw new Error('useBulkDelete must be used within BulkDeleteProvider')
  return ctx
}

export function BulkDeleteCheckbox({ id }: { id: string | number }) {
  const { selectedIds, toggleId } = useBulkDelete()
  const stringId = String(id)
  return (
    <input
      type="checkbox"
      checked={selectedIds.includes(stringId)}
      onChange={() => toggleId(stringId)}
      className="rounded border-stone-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
    />
  )
}

export function BulkDeleteSelectAll({ allIds }: { allIds: (string | number)[] }) {
  const { selectedIds, toggleAll } = useBulkDelete()
  const ids = allIds.map(String)
  const isAllSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id))

  return (
    <input
      type="checkbox"
      checked={isAllSelected}
      onChange={() => toggleAll(ids)}
      className="rounded border-stone-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
    />
  )
}

export function BulkDeleteButton({
  action,
  itemName = 'data',
}: {
  action: (ids: string[]) => Promise<{ success: boolean; error?: string }>
  itemName?: string
}) {
  const { selectedIds, clear, isDeleting, setIsDeleting } = useBulkDelete()
  const { toast, confirm } = useAdminFeedback()

  if (selectedIds.length === 0) return null

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Hapus Massal (Bulk Delete)',
      message: `Hapus ${selectedIds.length} ${itemName} terpilih secara massal?\n\nTindakan ini tidak dapat dibatalkan.`,
      confirmText: `Hapus ${selectedIds.length} Item`,
      cancelText: 'Batal',
      isDanger: true,
    })
    if (!ok) return

    setIsDeleting(true)
    try {
      const res = await action(selectedIds)
      if (!res?.success) {
        toast.error('Gagal menghapus data massal: ' + (res?.error || 'Kesalahan sistem'))
      } else {
        toast.success(`${selectedIds.length} ${itemName} berhasil dihapus.`)
        clear()
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + (err.message || 'Kesalahan jaringan'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-2 bg-rose-600 text-white px-3.5 py-2 rounded-lg hover:bg-rose-700 text-xs font-semibold shrink-0 disabled:opacity-50 transition-colors shadow-2xs"
    >
      {isDeleting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
      <span>{isDeleting ? 'Menghapus...' : `Hapus (${selectedIds.length})`}</span>
    </button>
  )
}
