/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Plus, Edit, Calendar, Moon, Image as ImageIcon, CalendarDays } from 'lucide-react'
import { DeleteActionClient } from '@/components/admin/DeleteActionClient'
import {
  BulkDeleteProvider,
  BulkDeleteCheckbox,
  BulkDeleteSelectAll,
  BulkDeleteButton,
} from '@/components/admin/BulkDelete'
import { deleteActivityAction, deleteManyActivityAction } from './actions'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminTableFilter } from '@/components/admin/AdminTableFilter'
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_SCHEDULE_STATUSES,
  getActivityCategoryLabel,
  getActivityScheduleStatus,
  formatGregorianDateRange,
  formatLunarDate,
} from '@/lib/activities/utils'

export const dynamic = 'force-dynamic'

export default async function ActivitiesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    limit?: string
    q?: string
    category?: string
    status?: string
    scheduleStatus?: string
  }>
}) {
  const { page, limit, q, category, status, scheduleStatus } = await searchParams
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  const currentPage = parseInt(page || '1', 10)
  const currentLimit = parseInt(limit || '10', 10)

  // Construct filters
  const where: any = {}
  if (q && q.trim()) {
    where.title = { contains: q.trim() }
  }
  if (category && category !== 'all') {
    where.category = { equals: category }
  }
  if (status && status !== 'all') {
    where.status = { equals: status }
  }
  if (scheduleStatus && scheduleStatus !== 'all') {
    where.scheduleStatus = { equals: scheduleStatus }
  }

  const data = await payload.find({
    collection: 'activities',
    where,
    sort: '-createdAt',
    limit: currentLimit,
    page: currentPage,
    locale: 'id',
    depth: 1,
  })

  const categoryOptions = ACTIVITY_CATEGORIES.map((c) => ({
    value: c.value,
    label: c.label.id,
  }))

  const scheduleStatusOptions = ACTIVITY_SCHEDULE_STATUSES.map((ss) => ({
    value: ss.value,
    label: ss.label.id,
  }))

  const baseParams = new URLSearchParams()
  if (q) baseParams.set('q', q)
  if (category && category !== 'all') baseParams.set('category', category)
  if (status && status !== 'all') baseParams.set('status', status)
  if (scheduleStatus && scheduleStatus !== 'all') baseParams.set('scheduleStatus', scheduleStatus)
  const baseUrl = `/admin/kegiatan${baseParams.toString() ? `?${baseParams.toString()}` : ''}`

  return (
    <BulkDeleteProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Agenda Ritual & Perayaan Klenteng
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Kelola jadwal upacara keagamaan, sembahyang leluhur, hari kebesaran dewa, dan tradisi Imlek Klenteng Tek Hay Bio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BulkDeleteButton action={deleteManyActivityAction} itemName="kegiatan" />
            <Link
              href="/admin/kegiatan/tambah"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kegiatan Baru</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <AdminTableFilter
          searchPlaceholder="Cari nama upacara / perayaan..."
          categories={categoryOptions}
          scheduleStatusOptions={scheduleStatusOptions}
          initialQuery={q || ''}
          initialCategory={category || 'all'}
          initialStatus={status || 'all'}
          initialScheduleStatus={scheduleStatus || 'all'}
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto relative">
            <table className="w-full text-left text-sm text-stone-600 min-w-[900px]">
              <thead className="bg-stone-50 text-stone-900 text-xs font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">
                    <BulkDeleteSelectAll allIds={data.docs.map((d: any) => d.id)} />
                  </th>
                  <th className="px-3 py-3.5 w-16">Foto</th>
                  <th className="px-4 py-3.5 font-semibold">Judul Kegiatan & Dewa</th>
                  <th className="px-4 py-3.5 font-semibold">Kategori</th>
                  <th className="px-4 py-3.5 font-semibold">Jadwal Masehi & Imlek</th>
                  <th className="px-4 py-3.5 font-semibold">Status Jadwal</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Publikasi</th>
                  <th className="px-4 py-3.5 font-semibold text-right sticky right-0 bg-stone-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {data.docs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-stone-500 space-y-2">
                      <CalendarDays className="w-8 h-8 text-stone-400 mx-auto" />
                      <p className="font-medium">
                        {q || category || status || scheduleStatus
                          ? 'Tidak ada kegiatan yang cocok dengan filter saat ini.'
                          : 'Belum ada agenda kegiatan yang terdaftar.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  data.docs.map((item: any) => {
                    const gregorianDate = formatGregorianDateRange(item.date, item.endDate, 'id')
                    const lunarDate = formatLunarDate(item, 'id')
                    const scheduleStatusObj = getActivityScheduleStatus(item.scheduleStatus, 'id')
                    const categoryLabel = getActivityCategoryLabel(item.category, 'id')
                    const thumbUrl =
                      item.featuredImage?.sizes?.thumbnail?.url ||
                      item.featuredImage?.url ||
                      null

                    return (
                      <tr key={item.id} className="hover:bg-stone-50/70 transition-colors group">
                        <td className="px-4 py-3 text-center">
                          <BulkDeleteCheckbox id={item.id} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-12 h-9 rounded-md bg-stone-100 border border-stone-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                            {thumbUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thumbUrl}
                                alt={item.title || 'Thumbnail'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-stone-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-900 max-w-xs">
                          <Link
                            href={`/admin/kegiatan/${item.id}`}
                            className="hover:text-primary transition-colors line-clamp-1 font-semibold"
                            title={item.title || 'Tanpa Judul'}
                          >
                            {item.title || 'Tanpa Judul'}
                          </Link>
                          {item.relatedDeity && (
                            <p className="text-[11px] text-amber-800 font-medium truncate mt-0.5" title={`Dewa: ${item.relatedDeity}`}>
                              Dewa: {item.relatedDeity}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded bg-stone-100 text-stone-700 border border-stone-200 whitespace-nowrap">
                            {categoryLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {gregorianDate ? (
                              <div className="flex items-center gap-1.5 text-stone-700">
                                <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                <span className="truncate" title={gregorianDate}>
                                  {gregorianDate}
                                </span>
                              </div>
                            ) : null}
                            {lunarDate ? (
                              <div className="flex items-start gap-1.5 text-amber-900">
                                <Moon className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span className="line-clamp-1 leading-snug font-medium" title={lunarDate}>
                                  {lunarDate}
                                </span>
                              </div>
                            ) : null}
                            {!gregorianDate && !lunarDate ? (
                              <span className="text-stone-400 italic">Belum ditentukan</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border shadow-2xs ${scheduleStatusObj.badgeClass}`}
                          >
                            {scheduleStatusObj.label.id}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border shadow-2xs ${
                              item.status === 'published'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            {item.status === 'published' ? 'Publik' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-1 sticky right-0 bg-white group-hover:bg-stone-50 transition-colors shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                          <Link
                            href={`/admin/kegiatan/${item.id}`}
                            className="inline-flex items-center justify-center p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit Kegiatan"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteActionClient
                            id={item.id}
                            action={deleteActivityAction}
                            itemName={`kegiatan "${item.title || 'ini'}"`}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={data.page as number}
            totalPages={data.totalPages}
            totalDocs={data.totalDocs}
            itemName="kegiatan"
            hasPrevPage={data.hasPrevPage}
            hasNextPage={data.hasNextPage}
            prevPage={data.prevPage}
            nextPage={data.nextPage}
            baseUrl={baseUrl}
            limit={currentLimit}
          />
        </div>
      </div>
    </BulkDeleteProvider>
  )
}
