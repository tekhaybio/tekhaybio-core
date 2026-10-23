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

  // Auto-close drawer whenever route changes (link navigation, browser back/forward)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll and handle Escape key when mobile/tablet drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = originalOverflow
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
    const currentRoute = navLinks.find((link) => link.id === pathname || link.en === pathname)

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
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-primary rounded px-1 shrink-0"
          >
            <span className="font-serif text-xl font-bold tracking-tight text-primary">
              Tek Hay Bio
            </span>
            <span className="font-serif text-xs text-stone-500 font-medium tracking-widest pl-1.5 border-l border-stone-300">
              德海廟
            </span>
          </Link>

          {/* Desktop Nav: Compact spacing on lg (1024px) to ensure no overflow, expanding to xl (1280px+) */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-6 text-xs xl:text-sm font-medium">
            {navLinks.map((link) => {
              const href = locale === 'id' ? link.id : link.en
              const label = locale === 'id' ? link.labelId : link.labelEn
              const isActive = pathname === href || pathname.startsWith(`${href}/`)

              return (
                <Link
                  key={href}
                  href={href}
                  className={`transition-colors py-1 px-1.5 rounded focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap ${
                    isActive ? 'text-primary font-bold' : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  {label}
                </Link>
              )
            })}

            <div className="h-4 w-px bg-border mx-1 shrink-0" />

            <Link
              href={getAlternatePath()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-200 text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors focus-visible:ring-2 focus-visible:ring-primary shrink-0"
              title={locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            >
              <Globe className="h-3.5 w-3.5 text-stone-500" />
              <span className="uppercase text-xs font-bold">{locale === 'id' ? 'en' : 'id'}</span>
            </Link>
          </nav>

          {/* Mobile & Tablet Nav Toggle */}
          <button
            className="lg:hidden p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg focus-visible:ring-2 focus-visible:ring-primary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile & Tablet Nav Drawer: Rendered outside header to prevent backdrop-filter containing block trapping! */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-start"
          role="dialog"
          aria-modal="true"
          aria-label={locale === 'id' ? 'Menu Navigasi' : 'Navigation Menu'}
        >
          {/* Backdrop Overlay with click-outside */}
          <div
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet: Full width on mobile (<640px), elegant right drawer on tablet (640px-1023px) */}
          <div className="relative mt-16 w-full sm:max-w-md sm:ml-auto bg-white border-l border-stone-200 h-[calc(100dvh-4rem)] flex flex-col shadow-2xl z-10 animate-in slide-in-from-top-2 sm:slide-in-from-right duration-200 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Context Header */}
              <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <p className="font-serif font-bold text-sm text-stone-900">Klenteng Tek Hay Bio</p>
                  <p className="text-[11px] text-stone-500 tracking-wider">德海廟 • Pecinan Semarang</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                  {locale === 'id' ? 'Bahasa Indonesia' : 'English Edition'}
                </span>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => {
                  const href = locale === 'id' ? link.id : link.en
                  const label = locale === 'id' ? link.labelId : link.labelEn
                  const isActive = pathname === href || pathname.startsWith(`${href}/`)

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={`text-base font-serif py-2.5 px-3 rounded-lg transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-amber-50 text-primary font-bold border-l-4 border-primary pl-2.5'
                          : 'text-stone-700 hover:bg-stone-50 hover:text-stone-950'
                      }`}
                    >
                      <span>{label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Language Switcher Footer & Temple Details */}
            <div className="p-5 border-t border-stone-200 bg-stone-50/80 shrink-0 space-y-3 pb-8">
              <Link
                href={getAlternatePath()}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-stone-200 text-stone-800 hover:bg-stone-100 transition-colors font-medium text-xs shadow-2xs"
              >
                <Globe className="h-4 w-4 text-stone-500" />
                <span>
                  {locale === 'id'
                    ? 'Beralih ke English (EN)'
                    : 'Switch to Bahasa Indonesia (ID)'}
                </span>
              </Link>
              <p className="text-center text-[10px] text-stone-400">
                Jl. Gang Pinggir No. 107, Kranggan, Semarang Tengah
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
