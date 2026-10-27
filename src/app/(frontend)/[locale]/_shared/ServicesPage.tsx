import React from 'react'
import { getCollection } from './queries'
import { PageHeader } from '@/components/ui/PageHeader'
import { Container, Section } from '@/components/ui/Layout'
import { MediaImage } from '@/components/ui/MediaImage'
import { RichText } from '@/components/ui/RichText'
import type { CMSRecord } from '@/types'
import { Pagination, PaginationToolbar } from '@/components/ui/Pagination'
import Link from 'next/link'

export async function ServicesPage({ locale, page = 1, limit = 10 }: { locale: 'id' | 'en', page?: number, limit?: number }) {
  const { docs: services, totalDocs, totalPages, page: currentPage } = await getCollection('services', locale, { 
    where: { status: { equals: 'published' } },
    sort: 'sortOrder',
    page,
    limit,
  })

  const baseUrl = `/${locale}/${locale === 'id' ? 'layanan' : 'services'}`

  return (
    <>
      <PageHeader 
        title={locale === 'id' ? 'Layanan & Pelayanan Ibadah' : 'Religious Services & Facilities'}
        description={locale === 'id' ? 'Pelayanan keagamaan, persembahyangan, konsultasi spiritual, dan fasilitas TITD untuk umat.' : 'Religious ceremonies, devotional prayers, spiritual consultations, and facilities for devotees.'}
      />
      <Section className="bg-white py-16 md:py-24">
        <Container>
          {services.length === 0 ? (
             <div className="py-16 text-center text-stone-500 italic bg-stone-50 rounded-lg border border-stone-200">
               {locale === 'id' ? 'Belum ada data layanan yang dipublikasikan.' : 'No published services available yet.'}
             </div>
          ) : (
            <>
              <PaginationToolbar
                currentPage={currentPage}
                totalDocs={totalDocs}
                limit={limit}
                locale={locale}
                itemName={locale === 'id' ? 'layanan' : 'services'}
                pageSizeOptions={[5, 10, 15, 20]}
                baseUrl={baseUrl}
              />
              <div className="space-y-16">
                {services.map((service, idx) => (
                  <article key={service.id as string} className={`flex flex-col md:flex-row gap-8 lg:gap-12 items-start ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''} pb-12 border-b border-stone-100 last:border-b-0`}>
                    <div className="w-full md:w-5/12 aspect-[4/3] relative rounded-md overflow-hidden border border-stone-200 bg-stone-100 shrink-0 shadow-2xs">
                      <MediaImage
                        media={service.image as CMSRecord}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="w-full md:w-7/12 space-y-4 pt-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">{service.title as string}</h2>
                        {service.availability === 'unavailable' && (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-semibold rounded">
                            {locale === 'id' ? 'Tidak Tersedia' : 'Unavailable'}
                          </span>
                        )}
                      </div>
                      <p className="text-base md:text-lg text-stone-700 leading-relaxed font-medium">
                        {service.shortDescription as string}
                      </p>
                      <div className="prose prose-stone max-w-none pt-1">
                         <RichText content={service.description} className="text-sm text-stone-600" />
                      </div>
                      <div className="pt-2">
                        <Link 
                          href={`/${locale}/${locale === 'id' ? 'kontak' : 'contact'}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                        >
                          <span>{locale === 'id' ? 'Informasi & Konsultasi Layanan' : 'Service Consultation & Inquiries'}</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <Pagination 
                totalPages={totalPages} 
                currentPage={currentPage} 
                totalDocs={totalDocs}
                baseUrl={baseUrl} 
                limit={limit} 
                locale={locale}
                itemName={locale === 'id' ? 'layanan' : 'services'}
                pageSizeOptions={[5, 10, 15, 20]}
              />
            </>
          )}
        </Container>
      </Section>
    </>
  )
}
