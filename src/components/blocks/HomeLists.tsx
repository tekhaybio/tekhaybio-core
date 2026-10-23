/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { Container, Section } from '../ui/Layout'
import { MediaImage } from '../ui/MediaImage'
import Link from 'next/link'
import type { CMSRecord } from '@/types'

export function ServicesList({ homePage, services, locale }: { homePage?: CMSRecord, services: CMSRecord[], locale: 'id' | 'en' }) {
  if (!services || services.length === 0) return null
  
  const hp = (homePage?.servicesSection as any) || {}
  const title = hp.title || (locale === 'id' ? 'Layanan & Pelayanan Ibadah' : 'Religious Services & Devotion')
  const linkUrl = `/${locale}/layanan`
  
  return (
    <Section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-serif">
              {locale === 'id' ? 'Pelayanan Umat' : 'Temple Services'}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              {title}
            </h2>
            {hp.description && <p className="text-stone-600 max-w-xl text-sm md:text-base leading-relaxed whitespace-pre-line">{hp.description}</p>}
          </div>
          <Link href={linkUrl} className="text-primary font-semibold text-sm hover:underline inline-flex items-center gap-1 group shrink-0">
            <span>{locale === 'id' ? 'Lihat Semua Layanan' : 'View All Services'}</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id as string} className="bg-white rounded-md overflow-hidden border border-stone-200/90 shadow-2xs hover:shadow-sm transition-all group flex flex-col">
              <div className="aspect-[16/10] relative bg-stone-100 overflow-hidden">
                <MediaImage media={service.image as CMSRecord} fill sizes="(max-width: 768px) 100vw, 33vw" className="transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-6 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-xl text-stone-900 group-hover:text-primary transition-colors">{service.title as string}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mt-2">{service.shortDescription as string}</p>
                </div>
                <div className="pt-3 border-t border-stone-100">
                  <Link href={linkUrl} className="text-xs font-bold uppercase tracking-wider text-primary hover:underline">
                    {locale === 'id' ? 'Pelajari Layanan' : 'Service Details'} →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

export function ActivitiesList({ homePage, activities, locale }: { homePage?: CMSRecord, activities: CMSRecord[], locale: 'id' | 'en' }) {
  if (!activities || activities.length === 0) return null
  
  const hp = (homePage?.activitiesSection as any) || {}
  const title = hp.title || (locale === 'id' ? 'Agenda Ritual & Perayaan' : 'Upcoming Rituals & Festivals')
  const linkUrl = `/${locale}/${locale === 'id' ? 'kegiatan' : 'activities'}`
  
  return (
    <Section className="bg-white border-t border-border py-16 md:py-24">
      <Container>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 font-serif">
              {locale === 'id' ? 'Jadwal Tradisi' : 'Temple Calendar'}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              {title}
            </h2>
            {hp.description && <p className="text-stone-600 max-w-xl text-sm md:text-base leading-relaxed whitespace-pre-line">{hp.description}</p>}
          </div>
          <Link href={linkUrl} className="text-primary font-semibold text-sm hover:underline inline-flex items-center gap-1 group shrink-0">
            <span>{locale === 'id' ? 'Semua Kegiatan & Ritual' : 'All Rituals & Activities'}</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {activities.map((activity) => {
            const dateStr = activity.date
              ? new Date(activity.date as string).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
              : (activity.lunarDay && activity.lunarMonth
                  ? (locale === 'id' ? `Tgl ${activity.lunarDay} Bulan ${activity.lunarMonth} Imlek` : `Day ${activity.lunarDay}, Month ${activity.lunarMonth} Lunar`)
                  : (locale === 'id' ? 'Jadwal Menunggu Konfirmasi' : 'Schedule Pending Confirmation'))

            return (
              <Link href={`/${locale}/${locale === 'id' ? 'kegiatan' : 'activities'}/${activity.slug}`} key={activity.id as string} className="group flex flex-col bg-stone-50 rounded-md overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-xs transition-all">
                <div className="w-full aspect-[16/10] relative bg-stone-100 overflow-hidden">
                  <MediaImage media={activity.featuredImage as CMSRecord} fill sizes="(max-width: 1024px) 100vw, 33vw" className="transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-stone-900/80 backdrop-blur-xs text-[11px] font-bold tracking-wider text-amber-200 uppercase">
                    {dateStr}
                  </div>
                </div>
                <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-xl text-stone-900 group-hover:text-primary transition-colors line-clamp-2">
                      {activity.title as string}
                    </h3>
                    {Boolean(activity.location) && (
                      <div className="text-xs text-stone-500 flex items-center gap-1">
                        <span>📍</span>
                        <span className="line-clamp-1">{activity.location as string}</span>
                      </div>
                    )}
                    <p className="text-stone-600 text-sm leading-relaxed line-clamp-2">{activity.shortDescription as string}</p>
                  </div>
                  <div className="pt-3 border-t border-stone-200/70 text-xs font-semibold text-primary group-hover:underline">
                    {locale === 'id' ? 'Rincian Acara & Panduan' : 'Ritual Details & Guide'} →
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}

export function NewsList({ homePage, posts, locale }: { homePage?: CMSRecord, posts: CMSRecord[], locale: 'id' | 'en' }) {
  if (!posts || posts.length === 0) return null
  
  const hp = (homePage?.newsSection as any) || {}
  const title = hp.title || (locale === 'id' ? 'Warta & Pengumuman' : 'News & Announcements')
  const linkUrl = `/${locale}/${locale === 'id' ? 'berita' : 'news'}`
  
  return (
    <Section className="bg-stone-50 border-t border-border py-16 md:py-24">
      <Container>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-500 font-serif">
              {locale === 'id' ? 'Kabar Terkini' : 'Bulletin'}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              {title}
            </h2>
            {hp.description && <p className="text-stone-600 max-w-xl text-sm md:text-base leading-relaxed whitespace-pre-line">{hp.description}</p>}
          </div>
          <Link href={linkUrl} className="text-primary font-semibold text-sm hover:underline inline-flex items-center gap-1 group shrink-0">
            <span>{locale === 'id' ? 'Semua Warta & Berita' : 'All News & Announcements'}</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link href={`${linkUrl}/${post.slug}`} key={post.id as string} className="group space-y-4 flex flex-col">
              <div className="aspect-[3/2] relative bg-stone-100 rounded-md overflow-hidden border border-stone-200">
                <MediaImage media={post.featuredImage as CMSRecord} fill sizes="(max-width: 768px) 100vw, 33vw" className="transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
                    <span>{post.publishedAt ? new Date(post.publishedAt as string).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
                    {Boolean(post.category) && (
                      <span className="px-2 py-0.5 bg-stone-200/80 rounded text-stone-700 text-[11px] font-medium">
                        {typeof post.category === 'string' ? post.category : ((post.category as any)?.title?.id || (post.category as any)?.title?.en || (post.category as any)?.title || '')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-xl text-stone-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {post.title as string}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 mt-2">{post.excerpt as string}</p>
                </div>
                <div className="pt-2 text-xs font-semibold text-primary group-hover:underline">
                  {locale === 'id' ? 'Baca Selengkapnya' : 'Read Article'} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}
