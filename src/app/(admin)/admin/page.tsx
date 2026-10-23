/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import {
  FileText,
  CalendarDays,
  Box,
  Image as ImageIcon,
  Plus,
  Moon,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import {
  getActivityCategoryLabel,
  getActivityScheduleStatus,
  formatGregorianDateRange,
  formatLunarDate,
} from '@/lib/activities/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    redirect('/admin/login')
  }

  // Fetch counts
  const [
    newsCount,
    activitiesCount,
    servicesCount,
    albumsCount,
    draftNewsCount,
    draftActivitiesCount,
    draftAlbumsCount,
  ] = await Promise.all([
    payload.count({ collection: 'posts' }),
    payload.count({ collection: 'activities' }),
    payload.count({ collection: 'services' }),
    payload.count({ collection: 'albums' }),
    payload.count({ collection: 'posts', where: { status: { equals: 'draft' } } }),
    payload.count({ collection: 'activities', where: { status: { equals: 'draft' } } }),
    payload.count({ collection: 'albums', where: { status: { equals: 'draft' } } }),
  ])

  // Fetch latest content & upcoming activities
  const [latestNews, recentActivities] = await Promise.all([
    payload.find({
      collection: 'posts',
      sort: '-createdAt',
      limit: 4,
      depth: 1,
    }),
    payload.find({
      collection: 'activities',
      sort: '-createdAt',
      limit: 4,
      depth: 1,
    }),
  ])

  const stats = [
    {
      label: 'Warta & Berita',
      count: newsCount.totalDocs,
      sublabel: `${draftNewsCount.totalDocs} draft`,
      icon: FileText,
      href: '/admin/berita',
    },
    {
      label: 'Agenda Ritual & Acara',
      count: activitiesCount.totalDocs,
      sublabel: `${draftActivitiesCount.totalDocs} draft`,
      icon: CalendarDays,
      href: '/admin/kegiatan',
    },
    {
      label: 'Layanan Klenteng',
      count: servicesCount.totalDocs,
      sublabel: 'Pelayanan umat',
      icon: Box,
      href: '/admin/layanan',
    },
    {
      label: 'Album Dokumentasi',
      count: albumsCount.totalDocs,
      sublabel: `${draftAlbumsCount.totalDocs} draft`,
      icon: Layers,
      href: '/admin/galeri',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-serif font-bold text-lg text-primary">德海廟</span>
            <span className="text-stone-300">•</span>
            <span className="text-xs uppercase tracking-widest text-stone-500 font-medium">
              Klenteng Tek Hay Bio Semarang
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Dashboard Pengurus Klenteng
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Selamat datang, <strong className="text-stone-800">{user.name || user.email}</strong>.
            Berikut ikhtisar publikasi tradisi dan dokumentasi klenteng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/berita/tambah"
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tulis Berita</span>
          </Link>
          <Link
            href="/admin/kegiatan/tambah"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kegiatan</span>
          </Link>
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:shadow-xs hover:border-stone-300 transition-all group flex items-start justify-between"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-3xl font-serif font-bold text-stone-900 group-hover:text-primary transition-colors">
                {stat.count}
              </p>
              <p className="text-[11px] text-stone-400 font-medium">{stat.sublabel}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-100 text-stone-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <stat.icon className="w-5 h-5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Main Operational Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent News and Agenda */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent News */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/60">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-serif font-bold text-stone-900">
                  Warta & Berita Terbaru
                </h2>
              </div>
              <Link
                href="/admin/berita"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Semua Berita</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {latestNews.docs.length > 0 ? (
              <ul className="divide-y divide-stone-100 text-xs">
                {latestNews.docs.map((post: any) => {
                  const thumbUrl =
                    post.featuredImage?.sizes?.thumbnail?.url ||
                    post.featuredImage?.url ||
                    null
                  return (
                    <li key={post.id} className="p-4 hover:bg-stone-50/60 transition-colors">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-10 rounded-md bg-stone-100 border border-stone-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                          {thumbUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumbUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-stone-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/admin/berita/${post.id}`}
                            className="font-semibold text-stone-900 hover:text-primary transition-colors line-clamp-1 text-sm"
                          >
                            {post.title || 'Tanpa Judul'}
                          </Link>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            {post.excerpt || 'Tidak ada kutipan ringkasan.'}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 border ${
                            post.status === 'published'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          {post.status === 'published' ? 'Publik' : 'Draft'}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="p-8 text-center text-xs text-stone-500">
                Belum ada berita yang ditulis.
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/60">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-amber-700" />
                <h2 className="text-sm font-serif font-bold text-stone-900">
                  Agenda Ritual & Perayaan Klenteng
                </h2>
              </div>
              <Link
                href="/admin/kegiatan"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Semua Kegiatan</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentActivities.docs.length > 0 ? (
              <ul className="divide-y divide-stone-100 text-xs">
                {recentActivities.docs.map((act: any) => {
                  const gregorianDate = formatGregorianDateRange(act.date, act.endDate, 'id')
                  const lunarDate = formatLunarDate(act, 'id')
                  const scheduleStatusObj = getActivityScheduleStatus(act.scheduleStatus, 'id')

                  return (
                    <li key={act.id} className="p-4 hover:bg-stone-50/60 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <Link
                            href={`/admin/kegiatan/${act.id}`}
                            className="font-semibold text-stone-900 hover:text-primary transition-colors text-sm line-clamp-1"
                          >
                            {act.title || 'Tanpa Judul'}
                          </Link>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-600">
                            {gregorianDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-stone-400" />
                                {gregorianDate}
                              </span>
                            )}
                            {lunarDate && (
                              <span className="flex items-center gap-1 text-amber-800 font-medium">
                                <Moon className="w-3 h-3 text-amber-600" />
                                {lunarDate}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border shadow-2xs ${scheduleStatusObj.badgeClass}`}
                          >
                            {scheduleStatusObj.label.id}
                          </span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="p-8 text-center text-xs text-stone-500">
                Belum ada agenda ritual terdaftar.
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Drafts Summary & Quick Actions */}
        <div className="space-y-6">
          {/* Drafts Need Review Box */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-2">
              Status Tinjauan Publikasi
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
                <span className="text-stone-700 font-medium">Draft Berita</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                    draftNewsCount.totalDocs > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {draftNewsCount.totalDocs}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
                <span className="text-stone-700 font-medium">Draft Agenda Kegiatan</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                    draftActivitiesCount.totalDocs > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {draftActivitiesCount.totalDocs}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
                <span className="text-stone-700 font-medium">Draft Album Dokumentasi</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                    draftAlbumsCount.totalDocs > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {draftAlbumsCount.totalDocs}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-2">
              Aksi Cepat Pengurus
            </h2>

            <div className="space-y-2 text-xs font-medium">
              <Link
                href="/admin/kegiatan/tambah"
                className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-colors text-stone-800"
              >
                <span>Jadwalkan Ritual Baru</span>
                <Plus className="w-3.5 h-3.5 text-stone-400" />
              </Link>
              <Link
                href="/admin/galeri/tambah"
                className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-colors text-stone-800"
              >
                <span>Buat Album Dokumentasi</span>
                <Plus className="w-3.5 h-3.5 text-stone-400" />
              </Link>
              <Link
                href="/admin/sejarah"
                className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-colors text-stone-800"
              >
                <span>Kelola Linimasa Sejarah</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>
              <Link
                href="/id"
                target="_blank"
                className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-colors text-stone-800"
              >
                <span>Pratinjau Situs Publik</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
