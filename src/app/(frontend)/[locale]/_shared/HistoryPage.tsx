import React from 'react'
import { getGlobal } from './queries'
import { PageHeader } from '@/components/ui/PageHeader'
import { Container, Section } from '@/components/ui/Layout'
import { MediaImage } from '@/components/ui/MediaImage'
import { notFound } from 'next/navigation'
import type { CMSRecord } from '@/types'
import { ShieldCheck, Search } from 'lucide-react'

export async function HistoryPage({ locale }: { locale: 'id' | 'en' }) {
  const history = await getGlobal('history', locale)
  
  if (!history) {
    notFound()
  }

  const timeline = Array.isArray(history.timeline) ? history.timeline : []

  return (
    <>
      <PageHeader 
        title={locale === 'id' ? 'Garis Waktu & Sejarah TITD' : 'Historical Timeline & Archives'}
        description={locale === 'id' ? 'Perjalanan sejarah dan pelestarian TITD Tek Hay Bio dari masa ke masa.' : 'The historical journey and cultural preservation of TITD Tek Hay Bio through the centuries.'}
      />
      <Section className="bg-stone-50 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto">
            {timeline.length === 0 ? (
              <p className="text-center text-stone-500 italic py-12">
                {locale === 'id' ? 'Belum ada data sejarah.' : 'No historical data available yet.'}
              </p>
            ) : (
              /* Linear single-rail vertical timeline */
              <div className="relative pl-6 md:pl-10 border-l-2 border-stone-300 space-y-12">
                {timeline.map((event: Record<string, unknown>, idx: number) => {
                  const isUnderResearch = event.verificationStatus === 'under_research'

                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline Node Dot */}
                      <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-stone-50 group-hover:bg-primary transition-colors duration-300 shadow-xs" />

                      {/* Event Content Card */}
                      <article className="bg-white p-6 md:p-8 rounded-lg border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow space-y-4">
                        {/* Year & Verification Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                          <span className="text-2xl md:text-3xl font-serif font-bold text-primary tracking-tight">
                            {event.year as string}
                          </span>
                          
                          {isUnderResearch ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300/80 rounded-full">
                              <Search className="w-3.5 h-3.5 text-amber-700" />
                              <span>{locale === 'id' ? 'Dalam Penelitian' : 'Under Research'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 border border-stone-200 rounded-full">
                              <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                              <span>{locale === 'id' ? 'Catatan Terverifikasi' : 'Verified Record'}</span>
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 mb-2">
                            {event.title as string}
                          </h3>
                          <p className="text-stone-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
                            {event.description as string}
                          </p>
                        </div>

                        {/* Archival Image */}
                        {Boolean(event.image) && (
                          <div className="pt-2">
                            <div className="relative aspect-video rounded-md overflow-hidden border border-stone-200 bg-stone-100">
                              <MediaImage
                                media={event.image as CMSRecord}
                                fill
                                priority={idx === 0}
                                sizes="(max-width: 768px) 100vw, 48rem"
                                className="object-cover group-hover:scale-102 transition-transform duration-700"
                              />
                            </div>
                            <p className="text-xs text-stone-500 italic mt-2 text-center font-serif">
                              {locale === 'id' ? 'Dokumentasi arsip sejarah TITD Tek Hay Bio' : 'Archival documentation, TITD Tek Hay Bio'}
                            </p>
                          </div>
                        )}
                      </article>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  )
}
