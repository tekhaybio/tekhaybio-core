'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
}

interface AdminFeedbackContextType {
  toast: {
    success: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void
    warning: (message: string) => void
  }
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const AdminFeedbackContext = createContext<AdminFeedbackContextType | null>(null)

export function useAdminFeedback() {
  const context = useContext(AdminFeedbackContext)
  if (!context) {
    throw new Error('useAdminFeedback must be used within AdminFeedbackProvider')
  }
  return context
}

export function AdminFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    options: ConfirmOptions
    resolve: (value: boolean) => void
  } | null>(null)

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastItem['type']) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }, [removeToast])

  const toast = useRef({
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
    warning: (msg: string) => addToast(msg, 'warning'),
  }).current

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        options,
        resolve: (val: boolean) => {
          setConfirmDialog(null)
          resolve(val)
        },
      })
    })
  }, [])

  return (
    <AdminFeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast Notifications Viewport (Top Right) */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg text-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : t.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : t.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-stone-900 border-stone-800 text-white'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}

            <div className="flex-1 font-medium leading-snug">{t.message}</div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-stone-400 hover:text-stone-700 p-0.5 -mr-1 rounded-md transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Styled Accessible Confirm Dialog Modal */}
      {confirmDialog?.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => confirmDialog.resolve(false)}
        >
          <div
            className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmDialog.options.isDanger
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {confirmDialog.options.isDanger ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                  {confirmDialog.options.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                  {confirmDialog.options.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => confirmDialog.resolve(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                {confirmDialog.options.cancelText || 'Batal'}
              </button>
              <button
                type="button"
                onClick={() => confirmDialog.resolve(true)}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-xs ${
                  confirmDialog.options.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-primary hover:bg-primary-hover'
                }`}
              >
                {confirmDialog.options.confirmText || 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminFeedbackContext.Provider>
  )
}
