/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { getCollection } from './queries'
import { PageHeader } from '@/components/ui/PageHeader'
import { Container, Section } from '@/components/ui/Layout'
import { MediaImage } from '@/components/ui/MediaImage'
import type { CMSRecord } from '@/types'
import Link from 'next/link'
import { Pagination, PaginationToolbar } from '@/components/ui/Pagination'
import {
  ACTIVITY_CATEGORIES,
  getActivityCategoryLabel,
  getActivityScheduleStatus,
  formatGregorianDateRange,
  formatLunarDate,
} from '@/lib/activities/utils'
import { Calendar, Moon, MapPin, Sparkles, AlertCircle } from 'lucide-react'

export async function ActivitiesListPage({
  locale,
  page = 1,
  limit = 9,
  category,
}: {
  locale: 'id' | 'en'
  page?: number
  limit?: number
  category?: string
}) {
  const where: any = { status: { equals: 'published' } }
  if (category && category !== 'all') {
    where.category = { equals: category }
  }

  const { docs: activities, totalDocs, totalPages, page: currentPage } = await getCollection('activities', locale, {
    where,
    sort: '-date',
    page,
    limit,
  })

  const baseUrl = `/${locale}/${locale === 'id' ? 'kegiatan' : 'activities'}`

  return (
    <>
      <PageHeader
        title={locale === 'id' ? 'Jadwal Kegiatan & Perayaan' : 'Activities & Festival Schedule'}
        description={
          locale === 'id'
            ? 'Dokumentasi dan agenda ritual keagamaan, sembahyang leluhur, hari kebesaran dewa, dan perayaan budaya di TITD Tek Hay Bio.'
            : 'Documentation and schedule of religious rituals, ancestral worship, deity festivals, and cultural events at TITD Tek Hay Bio.'
        }
      />

      <Section className="bg-stone-50 py-12 md:py-16">
        <Container>
          {/* Calendar Banner Callout */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-md bg-stone-900 text-amber-300 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  {locale === 'id'
                    ? 'Kalender Ritual & Perayaan TITD'
                    : 'Temple Ritual & Celebration Calendar'}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  {locale === 'id'
                    ? 'Lihat kalender interaktif bulanan dan agenda ritual tahunan lengkap dengan konversi penanggalan Imlek.'
                    : 'View interactive monthly calendar and annual schedule with lunar date conversions.'}
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/${locale === 'id' ? 'kalender-ritual' : 'ritual-calendar'}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs shrink-0"
            >
              <span>{locale === 'id' ? 'Buka Kalender Ritual' : 'Open Ritual Calendar'}</span>
              <span>→</span>
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="mb-10 flex flex-wrap items-center gap-2 border-b border-stone-200 pb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mr-2 font-serif">
              {locale === 'id' ? 'Kategori:' : 'Category:'}
            </span>
            <Link
              href={baseUrl}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !category || category === 'all'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {locale === 'id' ? 'Semua Kegiatan' : 'All Activities'}
            </Link>
            {ACTIVITY_CATEGORIES.map((cat) => {
              const isActive = category === cat.value
              const filterUrl = `${baseUrl}?category=${cat.value}`
              return (
                <Link
                  key={cat.value}
                  href={filterUrl}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {cat.label[locale]}
                </Link>
              )
            })}
          </div>

          {activities.length === 0 ? (
            <div className="py-16 text-center text-stone-500 bg-white rounded-lg border border-stone-200 shadow-2xs max-w-xl mx-auto space-y-3 p-6">
              <Calendar className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-base font-medium text-stone-700">
                {locale === 'id' ? 'Belum ada agenda kegiatan pada kategori ini.' : 'No upcoming activities in this category.'}
              </p>
              <p className="text-xs text-stone-400">
                {locale === 'id'
                  ? 'Silakan periksa kembali di lain waktu atau pilih kategori lainnya.'
                  : 'Please check back later or select another category.'}
              </p>
              {category && category !== 'all' && (
                <div className="pt-2">
                  <Link href={baseUrl} className="text-xs text-primary font-medium hover:underline">
                    ← {locale === 'id' ? 'Kembali ke Semua Kegiatan' : 'Back to All Activities'}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <PaginationToolbar
                currentPage={currentPage}
                totalDocs={totalDocs}
                limit={limit}
                locale={locale}
                itemName={locale === 'id' ? 'kegiatan' : 'activities'}
                pageSizeOptions={[6, 9, 12, 18]}
                baseUrl={category ? `${baseUrl}?category=${category}` : baseUrl}
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activities.map((activity: any, idx: number) => {
                  const gregorianDate = formatGregorianDateRange(activity.date, activity.endDate, locale)
                  const lunarDate = formatLunarDate(activity, locale)
                  const categoryLabel = getActivityCategoryLabel(activity.category, locale)
                  const scheduleStatusObj = getActivityScheduleStatus(activity.scheduleStatus, locale)

                  // Real Gregorian date or Lunar date badge (never fabricate a date)
                  const dateObj = activity.date ? new Date(activity.date) : null
                  const hasValidGregorian = dateObj && !isNaN(dateObj.getTime())

                  return (
                    <Link
                      href={`/${locale}/${locale === 'id' ? 'kegiatan' : 'activities'}/${activity.slug}`}
                      key={activity.id as string}
                      className="bg-white rounded-md overflow-hidden shadow-2xs hover:shadow-sm transition-all group flex flex-col border border-stone-200"
                    >
                      <div className="aspect-[16/10] relative bg-stone-100 overflow-hidden">
                        <MediaImage
                          media={activity.featuredImage as CMSRecord}
                          fill
                          priority={idx === 0}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Top-Right Badge */}
                        {hasValidGregorian ? (
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded text-center shadow-xs border border-stone-200">
                            <span className="block text-xl font-bold text-primary leading-none font-serif">
                              {dateObj.getDate()}
                            </span>
                            <span className="block text-[10px] font-bold text-stone-600 uppercase mt-0.5">
                              {dateObj.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
                                month: 'short',
                              })}
                            </span>
                          </div>
                        ) : lunarDate ? (
                          <div className="absolute top-3 right-3 bg-amber-50/95 backdrop-blur-xs px-2.5 py-1.5 rounded text-center shadow-xs border border-amber-300">
                            <span className="block text-[10px] font-bold text-amber-900 leading-tight">
                              🌙 Imlek
                            </span>
                            {activity.lunarDay && activity.lunarMonth ? (
                              <span className="block text-xs font-bold text-amber-950 mt-0.5">
                                {activity.lunarDay}/{activity.lunarMonth}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <div className="absolute top-3 right-3 bg-stone-900/90 backdrop-blur-xs px-2 py-1 rounded text-center shadow-xs text-white text-[11px] font-medium">
                            {scheduleStatusObj.label[locale]}
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          {/* Category and Status */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[11px] font-semibold rounded uppercase tracking-wider border border-stone-200">
                              {categoryLabel}
                            </span>
                            {activity.scheduleStatus && activity.scheduleStatus !== 'scheduled' && (
                              <span
                                className={`px-2 py-0.5 text-[11px] font-medium rounded border ${scheduleStatusObj.badgeClass}`}
                              >
                                {scheduleStatusObj.label[locale]}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h2 className="font-serif font-bold text-xl text-stone-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {activity.title as string}
                          </h2>

                          {/* Date & Schedule */}
                          <div className="space-y-1 text-xs text-stone-600">
                            {gregorianDate && (
                              <div className="flex items-center gap-1.5 font-medium text-stone-800">
                                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{gregorianDate}</span>
                              </div>
                            )}
                            {lunarDate && (
                              <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                                <Moon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{lunarDate}</span>
                              </div>
                            )}
                          </div>

                          {/* Deity & Location */}
                          {(Boolean(activity.relatedDeity) || Boolean(activity.location)) && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 pt-0.5">
                              {Boolean(activity.relatedDeity) && (
                                <span className="inline-flex items-center gap-1 text-amber-800">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span>{activity.relatedDeity as string}</span>
                                </span>
                              )}
                              {Boolean(activity.location) && (
                                <span className="inline-flex items-center gap-1 line-clamp-1">
                                  <MapPin className="w-3 h-3 text-stone-400" />
                                  <span>{activity.location as string}</span>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Excerpt */}
                          <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 pt-1">
                            {activity.shortDescription as string}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-stone-100 text-xs font-semibold text-primary group-hover:underline">
                          {locale === 'id' ? 'Lihat Detail & Panduan Ritual' : 'View Ritual Details & Guide'} →
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                totalDocs={totalDocs}
                baseUrl={category ? `${baseUrl}?category=${category}` : baseUrl}
                limit={limit}
                locale={locale}
                itemName={locale === 'id' ? 'kegiatan' : 'activities'}
                pageSizeOptions={[6, 9, 12, 18]}
              />
            </>
          )}
        </Container>
      </Section>
    </>
  )
}
