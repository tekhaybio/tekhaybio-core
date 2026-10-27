/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { Container, Section } from '../ui/Layout'
import { MediaImage } from '../ui/MediaImage'
import { Button } from '../ui/Button'
import type { CMSRecord } from '@/types'

export function ShortHistory({ homePage, history, locale }: { homePage?: CMSRecord, history: CMSRecord, locale: 'id' | 'en' }) {
  const hp = (homePage?.historySection as any) || {}
  
  const heading = hp.heading || (locale === 'id' ? 'Jejak Waktu & Sejarah' : 'Footprints of Time')
  const title = hp.title || (history?.title as string) || ''
  const description = hp.description || (history?.shortDescription as string) || 'Jelajahi garis waktu yang membentuk identitas kami.'
  const buttonText = locale === 'id' ? 'Baca Sejarah Lengkap' : 'Read Full History'
  const buttonLink = `/${locale}/sejarah`
  
  const timeline = history?.timeline as CMSRecord[] | undefined
  const displayImage = hp.image || (timeline && timeline[0]?.image) || null

  if (!title && !history?.title) return null

  return (
    <Section className="bg-white py-16 md:py-24">
      <Container>
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              {heading}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-tight tracking-tight">
              {title}
            </h2>
            <p className="text-base md:text-lg text-stone-600 leading-relaxed whitespace-pre-line">
              {description}
            </p>
            <div className="pt-2">
              <Button href={buttonLink} variant="outline">
                {buttonText}
              </Button>
            </div>
          </div>
          <div className="relative aspect-square md:aspect-[4/3] rounded-md overflow-hidden shadow-sm border border-stone-200 bg-stone-100">
            {displayImage ? (
              <MediaImage media={displayImage as CMSRecord} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-400 p-8 text-center">
                <span className="font-serif italic text-lg">Arsip Visual TITD</span>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  )
}

// Catatan: Komponen Uniqueness (Identitas & Nilai Luhur) dinonaktifkan untuk sementara waktu pada halaman beranda.
// Kode komponen tetap dipertahankan secara utuh agar dapat diaktifkan kembali sewaktu-waktu.
export function Uniqueness({ homePage, locale }: { homePage?: CMSRecord, locale: 'id' | 'en' }) {
  const hp = (homePage?.uniquenessSection as any) || {}
  
  const title = hp.title || (locale === 'id' ? 'Identitas & Nilai Luhur' : 'Identity & Cultural Values')
  const description = hp.description || (locale === 'id' 
              ? 'Mengenal lebih dekat ciri khas arsitektur, filosofi, dan tradisi yang dilestarikan.'
              : 'Discovering the unique architecture, philosophy, and preserved traditions.')
  
  const defaultFeatures = [
    { title: locale === 'id' ? 'Warisan Budaya' : 'Cultural Heritage', image: null },
    { title: locale === 'id' ? 'Filosofi Arsitektur' : 'Architectural Philosophy', image: null },
    { title: locale === 'id' ? 'Tradisi Leluhur' : 'Ancestral Traditions', image: null }
  ]
  const features = (hp.features && hp.features.length > 0) ? hp.features : defaultFeatures

  return (
    <Section className="bg-stone-900 text-stone-50 border-y border-stone-800 py-16 md:py-24">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-widest text-amber-400/90 uppercase font-serif">
            {locale === 'id' ? 'Keistimewaan TITD' : 'Temple Distinctiveness'}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            {title}
          </h2>
          <div className="flex items-center justify-center gap-3 my-2 text-stone-700">
            <span className="w-12 h-px bg-stone-700" />
            <span className="text-amber-500/80 text-xs font-serif">❖</span>
            <span className="w-12 h-px bg-stone-700" />
          </div>
          <p className="text-stone-300 text-base md:text-lg leading-relaxed whitespace-pre-line max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((item: any, i: number) => (
            <div key={i} className="space-y-4 text-center group">
              <div className="aspect-[3/4] bg-stone-800/80 rounded-md overflow-hidden relative border border-stone-800 group-hover:border-stone-700 transition-colors shadow-sm">
                 {item.image ? (
                   <MediaImage media={item.image as CMSRecord} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                 ) : (
                   <div className="absolute inset-0 flex items-center justify-center text-stone-500">
                     <span className="font-serif italic text-sm">Detail Arsitektur</span>
                   </div>
                 )}
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-200 group-hover:text-amber-300 transition-colors">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
