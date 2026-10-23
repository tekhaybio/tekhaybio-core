import React from 'react'
import { getGlobal } from './queries'
import { PageHeader } from '@/components/ui/PageHeader'
import { Container, Section } from '@/components/ui/Layout'
import { RichText } from '@/components/ui/RichText'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Landmark, Calendar, MapPin, Sparkles } from 'lucide-react'

export async function AboutPage({ locale }: { locale: 'id' | 'en' }) {
  const [history, siteSettings, contactInfo] = await Promise.all([
    getGlobal('history', locale),
    getGlobal('site-settings', locale).catch(() => null),
    getGlobal('contact-information', locale).catch(() => null),
  ])
  
  if (!history) {
    notFound()
  }

  const siteName = (siteSettings as any)?.siteName || 'Klenteng Tek Hay Bio'
  const tagline = (siteSettings as any)?.tagline || (locale === 'id' 
    ? 'Pusat Pelestarian Tradisi, Budaya, dan Spiritual Leluhur' 
    : 'Center for Ancestral Tradition, Culture, and Spiritual Heritage')

  const pillars = [
    {
      icon: Sparkles,
      title: locale === 'id' ? 'Penghormatan Leluhur' : 'Ancestral Reverence',
      description: locale === 'id'
        ? 'Merawat nilai-nilai bakti kepada leluhur dan penghormatan kepada dewa-dewi pelindung melalui tata cara sembahyang yang diwariskan turun-temurun.'
        : 'Preserving filial devotion to ancestors and homage to protective deities through time-honored prayer rituals passed down generations.',
    },
    {
      icon: Landmark,
      title: locale === 'id' ? 'Cagar Budaya Bersejarah' : 'Historic Cultural Heritage',
      description: locale === 'id'
        ? 'Berdiri di kawasan Pecinan Semarang, klenteng ini menjadi saksi perjalanan sejarah, arsitektur pusaka, dan akulturasi budaya Tionghoa-Indonesia.'
        : 'Standing in Semarang Chinatown, the temple is an enduring witness to historical journeys, heritage architecture, and Chinese-Indonesian cultural synthesis.',
    },
    {
      icon: Calendar,
      title: locale === 'id' ? 'Siklus Tradisi Kalender Imlek' : 'Lunar Calendar Cycle',
      description: locale === 'id'
        ? 'Menyelenggarakan upacara ritual tahunan, hari kebesaran dewa (Sejit), dan perayaan tradisi yang selaras dengan siklus penanggalan Imlek.'
        : 'Organizing annual ceremonies, deity feast days (Sejit), and traditional celebrations aligned with astronomical lunar cycles.',
    },
  ]

  return (
    <>
      <PageHeader 
        title={history.title as string || (locale === 'id' ? 'Tentang Klenteng Tek Hay Bio' : 'About Tek Hay Bio Temple')}
        description={history.shortDescription as string || tagline}
      />

      {/* Main Narrative Section */}
      <Section className="bg-white py-16 md:py-24">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Identity badge */}
            <div className="flex items-center gap-3 border-b border-stone-200 pb-6">
              <span className="font-serif text-3xl md:text-4xl font-bold text-primary">德海廟</span>
              <div className="pl-4 border-l border-stone-200">
                <h2 className="font-serif font-bold text-xl text-stone-900">{siteName}</h2>
                <p className="text-xs text-stone-500 uppercase tracking-widest">
                  {locale === 'id' ? 'Pecinan Semarang • Jawa Tengah' : 'Semarang Chinatown • Central Java'}
                </p>
              </div>
            </div>

            {/* Rich text body */}
            <div className="prose prose-stone max-w-none">
              <RichText content={history.content} />
            </div>

            {/* Core Pillars */}
            <div className="pt-8 border-t border-stone-200 space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-serif">
                  {locale === 'id' ? 'Identitas & Nilai' : 'Values & Identity'}
                </span>
                <h3 className="font-serif font-bold text-2xl text-stone-900">
                  {locale === 'id' ? 'Pilar Karakter Klenteng Tek Hay Bio' : 'Core Pillars of Tek Hay Bio Temple'}
                </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {pillars.map((pillar, i) => (
                  <div key={i} className="p-6 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
                    <div className="w-10 h-10 rounded-md bg-stone-200/80 text-primary flex items-center justify-center">
                      <pillar.icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif font-bold text-lg text-stone-900">{pillar.title}</h4>
                    <p className="text-stone-600 text-sm leading-relaxed">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-navigation links */}
            <div className="pt-8 p-6 md:p-8 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-serif font-bold text-lg text-stone-900">
                  {locale === 'id' ? 'Ingin mempelajari linimasa sejarah lengkap?' : 'Looking to explore the historical timeline?'}
                </h4>
                <p className="text-sm text-stone-600">
                  {locale === 'id'
                    ? 'Buka kronologi garis waktu berdirinya klenteng dari masa ke masa.'
                    : 'Discover the full archival chronology of the temple through the centuries.'}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button href={`/${locale}/${locale === 'id' ? 'sejarah' : 'history'}`} variant="primary">
                  {locale === 'id' ? 'Buka Garis Waktu Sejarah' : 'Open History Timeline'}
                </Button>
                <Button href={`/${locale}/${locale === 'id' ? 'kontak' : 'contact'}`} variant="outline">
                  {locale === 'id' ? 'Informasi Kunjungan' : 'Visit Guide'}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
