/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React from 'react'
import { Container } from './Layout'
import { HelpCircle, AlertCircle } from 'lucide-react'

export function EmptyState({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div className="py-24 text-center">
      <Container>
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-200">
            <HelpCircle className="w-6 h-6 text-stone-400" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">{title}</h3>
          <p className="text-stone-600 text-sm leading-relaxed">{message}</p>
        </div>
      </Container>
    </div>
  )
}

export function LoadingState({ locale = 'id' }: { locale?: 'id' | 'en' }) {
  return (
    <div className="py-24 flex justify-center items-center min-h-[40vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-xs text-stone-500 font-medium tracking-widest uppercase">
          {locale === 'id' ? 'Memuat Data...' : 'Loading Content...'}
        </p>
      </div>
    </div>
  )
}

export function ErrorState({
  title,
  message,
  locale = 'id',
}: {
  title?: string
  message?: string
  locale?: 'id' | 'en'
}) {
  const defaultTitle = locale === 'id' ? 'Terjadi Kesalahan' : 'An Error Occurred'
  const defaultMessage =
    locale === 'id'
      ? 'Mohon maaf, halaman atau data yang Anda cari tidak dapat dimuat saat ini. Silakan coba beberapa saat lagi.'
      : 'Sorry, the requested page or data could not be loaded at this time. Please try again later.'
  const buttonText = locale === 'id' ? 'Muat Ulang Halaman' : 'Reload Page'

  return (
    <div className="py-24 text-center">
      <Container>
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <AlertCircle className="w-6 h-6 text-rose-600" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">
            {title || defaultTitle}
          </h3>
          <p className="text-stone-600 text-sm leading-relaxed">
            {message || defaultMessage}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center px-5 py-2.5 bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary"
          >
            {buttonText}
          </button>
        </div>
      </Container>
    </div>
  )
}
