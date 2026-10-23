/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { Button } from '../ui/Button'
import { MediaImage } from '../ui/MediaImage'
import { Container, Section } from '../ui/Layout'
import Link from 'next/link'
import type { CMSRecord } from '@/types'

export function Hero({ homePage, siteSettings, locale }: { homePage?: CMSRecord, siteSettings: CMSRecord, locale: 'id' | 'en' }) {
  const hp = (homePage?.hero as any) || {}
  
  const title = hp.title || (siteSettings.siteName as string) || 'Klenteng Tek Hay Bio'
  const tagline = hp.tagline || (siteSettings.tagline as string) || (locale === 'id' ? 'Pusat Pelestarian Tradisi & Budaya Leluhur' : 'Center for Tradition & Cultural Heritage Preservation')
  const bgImage = hp.backgroundImage || siteSettings.defaultSocialImage || null
  
  const pBtnText = locale === 'id' ? 'Pelajari Sejarah' : 'Discover History'
  const pBtnLink = `/${locale}/sejarah`
  const sBtnText = locale === 'id' ? 'Rencanakan Kunjungan' : 'Plan a Visit'
  const sBtnLink = `/${locale}/kontak`

  return (
    <div className="relative w-full h-[72vh] min-h-[520px] flex items-center justify-center bg-stone-950 overflow-hidden">
      {/* Background Image / Authentic Atmosphere */}
      <div className="absolute inset-0 z-0 opacity-40">
        {bgImage && (
          <MediaImage 
            media={bgImage as CMSRecord} 
            alt="Tek Hay Bio Hero"
            fill
            priority
            className="object-cover"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/70" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs text-amber-200 tracking-widest font-serif">
          <span className="font-bold text-amber-300">德海廟</span>
          <span className="text-white/40">•</span>
          <span>{locale === 'id' ? 'Cagar Budaya Pecinan Semarang' : 'Semarang Heritage Sanctuary'}</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight drop-shadow-md">
          {title}
        </h1>

        <p className="text-lg md:text-2xl text-stone-200 font-medium drop-shadow max-w-2xl mx-auto leading-relaxed">
          {tagline}
        </p>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href={pBtnLink} variant="primary" className="w-full sm:w-auto">
            {pBtnText}
          </Button>
          <Button href={sBtnLink} variant="outline" className="w-full sm:w-auto border-stone-400/80 text-white hover:bg-white/10 hover:border-white">
            {sBtnText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Introduction({ homePage, siteSettings, locale }: { homePage?: CMSRecord, siteSettings: CMSRecord, locale: 'id' | 'en' }) {
  const intro = (homePage?.introduction as any) || {}
  
  const title = intro.title || `${locale === 'id' ? 'Selamat Datang di ' : 'Welcome to '} ${(siteSettings.siteName as string) || 'Tek Hay Bio'}`
  const description = intro.description || (siteSettings.tagline as string) || 'Sebuah tempat yang merawat warisan budaya dan nilai-nilai luhur dari generasi ke generasi.'
  const linkText = locale === 'id' ? 'Tentang Kami' : 'About Us'
  const linkUrl = `/${locale}/tentang-kami`

  return (
    <Section className="bg-stone-50 border-b border-border py-16 md:py-20">
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              {title}
            </h2>
            <div className="flex items-center justify-center gap-3 my-2 text-stone-300">
              <span className="w-12 h-px bg-stone-300" />
              <span className="text-primary text-xs font-serif">❖</span>
              <span className="w-12 h-px bg-stone-300" />
            </div>
          </div>
          <p className="text-lg text-stone-600 leading-relaxed whitespace-pre-line">
            {description}
          </p>
          <div className="pt-2">
            <Link href={linkUrl} className="inline-flex items-center text-primary font-semibold hover:underline group">
              <span>{linkText}</span>
              <span className="ml-1.5 transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  )
}
