import React from 'react'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Moon, Sparkles } from 'lucide-react'
import { ActivitiesForm } from '@/components/admin/ActivitiesForm'
import { getActivityScheduleStatus, formatLunarDate, formatGregorianDateRange } from '@/lib/activities/utils'

export const dynamic = 'force-dynamic'

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  try {
    const data = await payload.findByID({ collection: 'activities', id, locale: 'all' })
    if (!data) notFound()

    const title = typeof data.title === 'string' ? data.title : data.title?.id || data.title?.en || 'Kegiatan Tanpa Judul'
    const slug = typeof data.slug === 'string' ? data.slug : data.slug?.id || data.slug?.en || ''
    const isPublished = data.status === 'published'
    const schedStatus = getActivityScheduleStatus(data.scheduleStatus, 'id')
    const lunarFormatted = formatLunarDate(data, 'id')
    const gregorianFormatted = formatGregorianDateRange(data.date, data.endDate, 'id')

    return (
      <div className="space-y-6">
        {/* Top Header & Breadcrumb Context */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Link
                href="/admin/kegiatan"
                className="p-1.5 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors shadow-2xs"
                title="Kembali ke Daftar Kegiatan"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                Edit Agenda Kegiatan
              </h1>
            </div>

            {/* Quick Metadata Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-semibold text-stone-700 max-w-xs sm:max-w-md truncate">
                {title}
              </span>
              <span className="text-stone-300">•</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                  isPublished
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                {isPublished ? 'Tayang Publik' : 'Draf Pengurus'}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${schedStatus.badgeClass}`}
              >
                {schedStatus.label.id}
              </span>

              {lunarFormatted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-900 border border-amber-200">
                  <Moon className="w-3 h-3 text-amber-600" />
                  <span>{lunarFormatted}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            {isPublished && slug && (
              <Link
                href={`/id/kegiatan/${slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors shadow-2xs"
              >
                <span>Lihat di Website</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </Link>
            )}

            <Link
              href="/admin/kegiatan"
              className="text-xs font-semibold text-stone-700 hover:text-stone-900 px-3.5 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors shadow-2xs"
            >
              Kembali ke Daftar
            </Link>
          </div>
        </div>

        <ActivitiesForm initialData={data} />
      </div>
    )
  } catch {
    notFound()
  }
}
