'use client'

import { useEffect } from 'react'

export function DocumentLang({ locale }: { locale: 'id' | 'en' }) {
  useEffect(() => {
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale
    }
  }, [locale])

  return null
}
