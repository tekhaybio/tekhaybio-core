'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useAdminFeedback } from './AdminFeedbackContext'

interface Props {
  id: string | number
  action: (id: string) => Promise<{ success: boolean; error?: string }>
  itemName?: string
}

export function DeleteActionClient({ id, action, itemName = 'data ini' }: Props) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast, confirm } = useAdminFeedback()

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Konfirmasi Penghapusan',
      message: `Apakah Anda yakin ingin menghapus ${itemName}? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.`,
      confirmText: 'Hapus Permanen',
      cancelText: 'Batal',
      isDanger: true,
    })
    if (!ok) return

    setIsDeleting(true)
    try {
      const res = await action(String(id))
      if (!res?.success) {
        toast.error('Gagal menghapus: ' + (res?.error || 'Kesalahan tidak diketahui'))
        setIsDeleting(false)
      } else {
        toast.success('Data berhasil dihapus.')
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + (err.message || 'Kesalahan jaringan'))
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
      title="Hapus"
      aria-label="Hapus data"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
