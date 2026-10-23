/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Globe } from 'lucide-react'

import { useLanguageSwitcher } from './LanguageSwitcherContext'

export function Navbar({ locale }: { locale: 'id' | 'en' }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { alternatePath } = useLanguageSwitcher()

  // Lock body scroll and handle Escape key when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen])

  // Map of routes
  const navLinks = [
    { id: '/id/tentang-kami', en: '/en/about', labelId: 'Tentang Kami', labelEn: 'About Us' },
    { id: '/id/sejarah', en: '/en/history', labelId: 'Sejarah', labelEn: 'History' },
    { id: '/id/layanan', en: '/en/services', labelId: 'Layanan', labelEn: 'Services' },
    { id: '/id/kegiatan', en: '/en/activities', labelId: 'Kegiatan', labelEn: 'Activities' },
    { id: '/id/kalender-ritual', en: '/en/ritual-calendar', labelId: 'Kalender Ritual', labelEn: 'Calendar' },
    { id: '/id/berita', en: '/en/news', labelId: 'Berita', labelEn: 'News' },
    { id: '/id/galeri', en: '/en/gallery', labelId: 'Galeri', labelEn: 'Gallery' },
    { id: '/id/kontak', en: '/en/contact', labelId: 'Kontak', labelEn: 'Contact' },
  ]

  // Language Switcher Logic
  const getAlternatePath = () => {
    const targetLocale = locale === 'id' ? 'en' : 'id'

    // 1. If dynamic page provided an explicit localized alternate path (e.g. translated slug)
    if (alternatePath) {
      return alternatePath
    }

    // 2. Find if the current path matches any known route
    const currentRoute = navLinks.find(link => link.id === pathname || link.en === pathname)

    if (currentRoute) {
      return targetLocale === 'id' ? currentRoute.id : currentRoute.en
    }

    // 3. Fallback for dynamic subpaths with correct segment translations
    if (pathname.startsWith('/id/berita/')) {
      return pathname.replace('/id/berita/', '/en/news/')
    }
    if (pathname.startsWith('/en/news/')) {
      return pathname.replace('/en/news/', '/id/berita/')
    }
    if (pathname.startsWith('/id/kegiatan/')) {
      return pathname.replace('/id/kegiatan/', '/en/activities/')
    }
    if (pathname.startsWith('/en/activities/')) {
      return pathname.replace('/en/activities/', '/id/kegiatan/')
    }
    if (pathname.startsWith('/id/galeri/')) {
      return pathname.replace('/id/galeri/', '/en/gallery/')
    }
    if (pathname.startsWith('/en/gallery/')) {
      return pathname.replace('/en/gallery/', '/id/galeri/')
    }

    // 4. Fallback: Just replace the locale prefix if it's dynamic
    if (pathname.startsWith('/id/')) return pathname.replace('/id/', '/en/')
    if (pathname.startsWith('/en/')) return pathname.replace('/en/', '/id/')

    return `/${targetLocale}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-primary rounded px-1">
          <span className="font-serif text-xl font-bold tracking-tight text-primary">
            Tek Hay Bio
          </span>
          <span className="font-serif text-xs text-stone-500 font-medium tracking-widest pl-1 border-l border-stone-300">
            德海廟
          </span>
        </Link>

        {/* Desktop Nav (Collapses cleanly to mobile drawer below lg / 1024px to prevent horizontal text wrapping) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const href = locale === 'id' ? link.id : link.en
            const label = locale === 'id' ? link.labelId : link.labelEn
            const isActive = pathname === href || pathname.startsWith(`${href}/`)
            
            return (
              <Link 
                key={href} 
                href={href}
                className={`transition-colors py-1 px-1.5 rounded focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive ? 'text-primary font-bold' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {label}
              </Link>
            )
          })}
          
          <div className="h-4 w-px bg-border mx-1" />
          
          <Link 
            href={getAlternatePath()} 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-200 text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            title={locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
          >
            <Globe className="h-3.5 w-3.5 text-stone-500" />
            <span className="uppercase text-xs font-bold">{locale === 'id' ? 'en' : 'id'}</span>
          </Link>
        </nav>

        {/* Mobile Nav Toggle */}
        <button 
          className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-md focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-background/98 backdrop-blur-md px-6 py-6 space-y-6 overflow-y-auto z-50 border-t border-border"
          role="dialog"
          aria-modal="true"
          aria-label={locale === 'id' ? 'Menu Navigasi' : 'Navigation Menu'}
        >
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => {
              const href = locale === 'id' ? link.id : link.en
              const label = locale === 'id' ? link.labelId : link.labelEn
              const isActive = pathname === href || pathname.startsWith(`${href}/`)
              
              return (
                <Link 
                  key={href} 
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-serif transition-colors py-1.5 border-b border-stone-100 ${
                    isActive ? 'text-primary font-bold' : 'text-stone-700 hover:text-stone-950'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="pt-4 border-t border-border">
            <Link 
              href={getAlternatePath()} 
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors font-medium text-sm"
            >
              <Globe className="h-4 w-4" />
              <span>{locale === 'id' ? 'Ganti ke English (EN)' : 'Switch to Bahasa Indonesia (ID)'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
