/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { Container, Section } from '../ui/Layout'
import { MediaImage } from '../ui/MediaImage'
import { Button } from '../ui/Button'
import type { CMSRecord } from '@/types'
import Link from 'next/link'
import { MapPin, Clock, ExternalLink } from 'lucide-react'

export function GalleryPreview({ homePage, mediaList, locale }: { homePage?: CMSRecord, mediaList: CMSRecord[], locale: 'id' | 'en' }) {
  const hp = (homePage?.gallerySection as any) || {}
  const title = hp.title || (locale === 'id' ? 'Galeri Visual & Dokumentasi' : 'Visual Gallery & Documentation')
  const buttonText = locale === 'id' ? 'Lihat Semua Galeri' : 'View Full Gallery'
  const buttonLink = `/${locale}/${locale === 'id' ? 'galeri' : 'gallery'}`
  
  const hasMedia = mediaList && mediaList.length > 0

  return (
    <Section className="bg-stone-900 text-stone-50 border-y border-stone-800 py-16 md:py-24">
      <Container>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-serif">
              {locale === 'id' ? 'Arsip Dokumentasi' : 'Visual Archive'}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              {title}
            </h2>
            {hp.description && <p className="text-stone-300 max-w-xl text-sm md:text-base leading-relaxed whitespace-pre-line">{hp.description}</p>}
          </div>
          <Link href={buttonLink} className="text-amber-300 font-medium hover:text-white hover:underline inline-flex items-center gap-1 group shrink-0 text-sm">
            <span>{buttonText}</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {hasMedia ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {mediaList.map((media, idx) => (
              <div 
                key={media.id as string} 
                className={`relative bg-stone-800 rounded-md overflow-hidden border border-stone-800 hover:border-stone-700 transition-colors group ${idx === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-square'}`}
              >
                <MediaImage 
                  media={media} 
                  fill 
                  sizes="(max-width: 768px) 50vw, 33vw" 
                  className="transition-transform duration-700 group-hover:scale-105 object-cover" 
                />
                {/* Mobile-accessible caption (visible permanently on mobile, hover on desktop) */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 md:p-5">
                  <span className="text-white text-xs md:text-sm font-medium drop-shadow-md line-clamp-2">
                    {(media.title as string) || (media.alt as string) || 'Klenteng Tek Hay Bio'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-stone-500 border border-stone-800 border-dashed rounded-lg bg-stone-800/50">
            <span className="font-serif italic text-base">{locale === 'id' ? 'Belum ada foto galeri' : 'No gallery photos yet'}</span>
          </div>
        )}
      </Container>
    </Section>
  )
}

export function LocationCTA({ homePage, contactInfo, locale }: { homePage?: CMSRecord, contactInfo: CMSRecord, locale: 'id' | 'en' }) {
  if (!contactInfo || !contactInfo.address) return null

  const hp = (homePage?.ctaSection as any) || {}
  const title = hp.title || (locale === 'id' ? 'Rencanakan Kunjungan Anda' : 'Plan Your Visit')
  const description = hp.description || (locale === 'id' 
                    ? 'Klenteng Tek Hay Bio terbuka bagi umat untuk sembahyang serta pengunjung dan peziarah yang ingin mengenal sejarah serta melestarikan budaya.'
                    : 'Tek Hay Bio Temple welcomes devotees for prayers as well as pilgrims and visitors wishing to learn about our history and heritage.')
  const buttonText = locale === 'id' ? 'Hubungi Pengurus' : 'Contact Temple Board'
  const buttonLink = `/${locale}/kontak`

  return (
    <Section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <div className="bg-white rounded-lg shadow-xs border border-stone-200 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 md:p-12 lg:p-16 space-y-8 flex flex-col justify-center">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-serif">
                  {locale === 'id' ? 'Informasi Kunjungan' : 'Visitor Information'}
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
                  {title}
                </h2>
                <p className="text-base text-stone-600 leading-relaxed whitespace-pre-line pt-1">
                  {description}
                </p>
              </div>

              <div className="space-y-6 pt-2 border-t border-stone-100">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs">
                      {locale === 'id' ? 'Alamat Klenteng' : 'Temple Address'}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{contactInfo.address as string}</p>
                  </div>
                </div>

                {Boolean(contactInfo.visitingHours) && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs">
                        {locale === 'id' ? 'Jam Buka Operasional' : 'Visiting Hours'}
                      </h3>
                      <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{contactInfo.visitingHours as string}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                {Boolean(contactInfo.googleMapsUrl) && (
                  <Button href={contactInfo.googleMapsUrl as string} variant="primary" className="inline-flex items-center gap-2">
                    <span>{locale === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'}</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                )}
                <Button href={buttonLink} variant="outline">
                  {buttonText}
                </Button>
              </div>
            </div>
            
            {/* Map Placeholder or Actual Embed */}
            <div className="bg-stone-100 relative min-h-[320px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-stone-200">
              {contactInfo.googleMapsEmbedCode ? (
                <div 
                  className="absolute inset-0 w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                  dangerouslySetInnerHTML={{ __html: contactInfo.googleMapsEmbedCode as string }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-stone-500 space-y-2">
                  <MapPin className="w-8 h-8 text-stone-400" />
                  <span className="font-serif font-bold text-base text-stone-700">Klenteng Tek Hay Bio (德海廟)</span>
                  <span className="text-xs text-stone-500 max-w-xs">{contactInfo.address as string}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
