/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveActivityAction, deleteActivityAction } from '@/app/(admin)/admin/kegiatan/actions'
import { LexicalEditor } from '@/components/admin/LexicalEditor'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { LocaleTabs } from '@/components/admin/LocaleTabs'
import { useAdminFeedback } from '@/components/admin/AdminFeedbackContext'
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_RECURRENCE_TYPES,
  ACTIVITY_SCHEDULE_STATUSES,
  ACTIVITY_LUNAR_RULES,
  ACTIVITY_LOCATION_TYPES,
  formatLunarDate,
  formatGregorianDateRange,
  getActivityScheduleStatus,
} from '@/lib/activities/utils'
import {
  Calendar,
  Moon,
  MapPin,
  Flame,
  Info,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Save,
  Trash2,
  CheckCircle2,
  CalendarCheck,
  Eye,
} from 'lucide-react'

export function ActivitiesForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const { toast, confirm } = useAdminFeedback()
  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const getLocalized = (field: any, fallback = '') => {
    if (!field) return { id: fallback, en: fallback }
    if (typeof field === 'string') return { id: field, en: field }
    return { id: field.id || fallback, en: field.en || fallback }
  }

  const getLocalizedRichText = (field: any) => {
    if (!field) return { id: null, en: null }
    if (field.root) return { id: field, en: field }
    return { id: field.id || null, en: field.en || null }
  }

  const [localizedData, setLocalizedData] = useState({
    title: getLocalized(initialData?.title),
    slug: getLocalized(initialData?.slug),
    shortDescription: getLocalized(initialData?.shortDescription),
    description: getLocalizedRichText(initialData?.description),
    scheduleNote: getLocalized(initialData?.scheduleNote),
    rescheduledNote: getLocalized(initialData?.rescheduledNote),
    lunarPeriodDescription: getLocalized(initialData?.lunarPeriodDescription),
    relatedDeity: getLocalized(initialData?.relatedDeity),
    deityRole: getLocalized(initialData?.deityRole),
    ritualMeaning: getLocalized(initialData?.ritualMeaning),
    traditionExplanation: getLocalized(initialData?.traditionExplanation),
    eventSequence: getLocalized(initialData?.eventSequence),
    managementNotes: getLocalized(initialData?.managementNotes),
    location: getLocalized(initialData?.location, 'Klenteng Tek Hay Bio, Semarang'),
    locationAddress: getLocalized(initialData?.locationAddress),
    locationRelationship: getLocalized(initialData?.locationRelationship),
    participationDescription: getLocalized(initialData?.participationDescription),
    candleDonationInfo: getLocalized(initialData?.candleDonationInfo),
    lanternDonationInfo: getLocalized(initialData?.lanternDonationInfo),
    requiredEquipment: getLocalized(initialData?.requiredEquipment),
    participationInstructions: getLocalized(initialData?.participationInstructions),
    contactInfo: getLocalized(initialData?.contactInfo),
  })

  const [formData, setFormData] = useState({
    category: initialData?.category || 'ritual',
    recurrenceType: initialData?.recurrenceType || 'annual-lunar',
    scheduleStatus: initialData?.scheduleStatus || 'scheduled',
    status: initialData?.status || 'draft',
    featuredImage: initialData?.featuredImage || null,
    date: initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    year: initialData?.year ?? '',
    lunarRuleType: initialData?.lunarRuleType || 'exact_date',
    lunarDay: initialData?.lunarDay ?? '',
    lunarMonth: initialData?.lunarMonth ?? '',
    isLeapMonth: Boolean(initialData?.isLeapMonth),
    locationType: initialData?.locationType || 'internal',
  })

  const handleLocalizedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setLocalizedData((prev) => ({
      ...prev,
      [name]: {
        ...(prev as any)[name],
        [activeTab]: value,
      },
    }))
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    const submitData: any = {
      ...formData,
      ...localizedData,
      date: formData.date ? new Date(formData.date).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      year: formData.year ? parseInt(String(formData.year), 10) : null,
      lunarDay: formData.lunarDay ? parseInt(String(formData.lunarDay), 10) : null,
      lunarMonth: formData.lunarMonth ? parseInt(String(formData.lunarMonth), 10) : null,
      isLeapMonth: Boolean(formData.isLeapMonth),
    }

    // Pastikan title memiliki fallback dua arah agar tidak pernah null/kosong
    const titleId = submitData.title?.id?.trim?.() || ''
    const titleEn = submitData.title?.en?.trim?.() || ''
    if (!titleId && !titleEn) {
      setError('Judul kegiatan wajib diisi.')
      setIsSaving(false)
      return
    }

    submitData.title = {
      id: titleId || titleEn,
      en: titleEn || titleId,
    }

    // Pembersihan field EN yang kosong agar fallback ke ID
    Object.keys(submitData).forEach((key) => {
      if (key === 'title') return
      if (
        submitData[key] &&
        typeof submitData[key] === 'object' &&
        'id' in submitData[key] &&
        'en' in submitData[key]
      ) {
        const enVal = submitData[key].en
        if (!enVal) {
          submitData[key].en = null
        } else if (typeof enVal === 'string' && (enVal.trim() === '' || enVal === '<p><br></p>')) {
          submitData[key].en = null
        } else if (typeof enVal === 'object') {
          if (Object.keys(enVal).length === 0) submitData[key].en = null
          else if (
            enVal.root &&
            enVal.root.children &&
            enVal.root.children.length === 1 &&
            enVal.root.children[0].children &&
            enVal.root.children[0].children.length === 0
          ) {
            submitData[key].en = null
          }
        }
      }
    })

    if (submitData.featuredImage && submitData.featuredImage.id) {
      submitData.featuredImage = submitData.featuredImage.id
    }

    const res = await saveActivityAction(initialData?.id || null, submitData)

    setIsSaving(false)
    if (res.success) {
      toast.success(initialData?.id ? 'Agenda kegiatan berhasil diperbarui' : 'Agenda kegiatan baru berhasil disimpan')
      router.push('/admin/kegiatan')
      router.refresh()
    } else {
      setError(res.error || 'Terjadi kesalahan saat menyimpan.')
      toast.error(res.error || 'Gagal menyimpan agenda kegiatan.')
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id) return
    const ok = await confirm({
      title: 'Hapus Agenda Kegiatan',
      message: 'Apakah Anda yakin ingin menghapus agenda kegiatan ini? Tindakan ini akan menghapus data agenda dari sistem.',
      confirmText: 'Ya, Hapus Kegiatan',
      isDanger: true,
    })
    if (!ok) return

    setIsDeleting(true)
    const res = await deleteActivityAction(initialData.id)
    if (res.success) {
      toast.success('Agenda kegiatan telah dihapus.')
      router.push('/admin/kegiatan')
      router.refresh()
    } else {
      toast.error('Gagal menghapus kegiatan: ' + (res.error || 'Kesalahan sistem'))
      setIsDeleting(false)
    }
  }

  // Live preview helpers
  const liveLunarPreview = formatLunarDate(
    {
      ...formData,
      lunarPeriodDescription: localizedData.lunarPeriodDescription,
    },
    activeTab
  )
  const liveGregorianPreview = formatGregorianDateRange(formData.date, formData.endDate, activeTab)
  const schedStatusConfig = getActivityScheduleStatus(formData.scheduleStatus, activeTab)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="text-xs font-medium leading-relaxed">{error}</div>
        </div>
      )}

      {/* Language Switcher Toolbar */}
      <LocaleTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Main Form Content) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Informasi & Narasi Ritual */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-stone-900">
                    Informasi &amp; Narasi Ritual
                  </h2>
                  <p className="text-[11px] text-stone-500">Judul acara, ringkasan pengantar, dan penjelasan lengkap</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                {activeTab === 'id' ? 'Bahasa Indonesia' : 'English Edition'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Judul Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                name="title"
                value={localizedData.title[activeTab]}
                onChange={handleLocalizedChange}
                placeholder={activeTab === 'id' ? 'Contoh: Sembahyang King Thi Kong (Tuhan Yang Maha Esa)' : 'e.g. King Thi Kong Ceremony (Heavenly Jade Emperor)'}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-xs transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Slug URL</label>
              <div className="flex rounded-lg shadow-2xs border border-stone-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-600 transition-colors bg-white">
                <span className="inline-flex items-center px-3 bg-stone-100 text-stone-500 text-xs font-mono select-none border-r border-stone-200 shrink-0">
                  /{activeTab === 'id' ? 'kegiatan' : 'activities'}/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={localizedData.slug[activeTab]}
                  onChange={handleLocalizedChange}
                  placeholder="otomatis-dibuat-dari-judul"
                  className="w-full px-3 py-2 text-xs font-mono text-stone-900 bg-transparent focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Kosongkan untuk membuat tautan URL permanen secara otomatis dari judul.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Ringkasan Singkat
              </label>
              <textarea
                name="shortDescription"
                value={localizedData.shortDescription[activeTab]}
                onChange={handleLocalizedChange}
                rows={2}
                placeholder={activeTab === 'id' ? 'Ringkasan esensi upacara sembahyang untuk kartu agenda dan media sosial...' : 'Brief summary of the ritual for event cards and social previews...'}
                className="w-full px-3.5 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-xs transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Deskripsi &amp; Sejarah Pelaksanaan
              </label>
              <div key={`editor-activity-${activeTab}`} className="border border-stone-200 rounded-lg overflow-hidden">
                <LexicalEditor
                  mediaCollection="activity-media"
                  initialData={localizedData.description[activeTab]}
                  onChange={(json) =>
                    setLocalizedData((prev) => ({
                      ...prev,
                      description: { ...prev.description, [activeTab]: json as any },
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Section 2: Jadwal & Penanggalan Tradisi */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200">
                  <Calendar className="w-4 h-4 text-stone-700" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-stone-900">
                    Penanggalan &amp; Waktu Pelaksanaan
                  </h2>
                  <p className="text-[11px] text-stone-500">Kombinasi kalender Imlek (Lunar) dan kalender Masehi aktual</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-stone-500">
                Imlek &amp; Masehi
              </span>
            </div>

            {/* Kalender Imlek Container */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-200/60 pb-2.5">
                <div className="flex items-center gap-2 font-semibold text-xs text-amber-950">
                  <Moon className="w-4 h-4 text-amber-700" />
                  <span>Aturan Penanggalan Imlek (Lunar Calendar)</span>
                </div>
                {liveLunarPreview && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-300">
                    <CheckCircle2 className="w-3 h-3 text-amber-700" />
                    <span>Pratinjau: {liveLunarPreview}</span>
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Pola Acuan Kalender Imlek
                </label>
                <select
                  name="lunarRuleType"
                  value={formData.lunarRuleType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
                >
                  {ACTIVITY_LUNAR_RULES.map((rule) => (
                    <option key={rule.value} value={rule.value}>
                      {rule.label[activeTab]}
                    </option>
                  ))}
                </select>
              </div>

              {formData.lunarRuleType === 'none' ? (
                <div className="p-3 bg-stone-100/70 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
                  <Info className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Kegiatan ini berpatokan murni pada kalender Masehi (tanpa konversi kalender Imlek).</span>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {/* Exact Date */}
                  {formData.lunarRuleType === 'exact_date' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Tanggal Imlek (1–30)
                        </label>
                        <input
                          type="number"
                          name="lunarDay"
                          min="1"
                          max="30"
                          value={formData.lunarDay}
                          onChange={handleChange}
                          placeholder="Misal: 9 (King Thi Kong), 24, dll."
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Bulan Imlek (1–12)
                        </label>
                        <input
                          type="number"
                          name="lunarMonth"
                          min="1"
                          max="12"
                          value={formData.lunarMonth}
                          onChange={handleChange}
                          placeholder="Misal: 1 (Cia Gwe), 7 (Cit Gwe), dll."
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* First Half / Second Half */}
                  {(formData.lunarRuleType === 'first_half' || formData.lunarRuleType === 'second_half') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Bulan Imlek (1–12)
                        </label>
                        <input
                          type="number"
                          name="lunarMonth"
                          min="1"
                          max="12"
                          value={formData.lunarMonth}
                          onChange={handleChange}
                          placeholder="Contoh: 7 (Bulan Tujuh Imlek)"
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                        />
                      </div>

                      <div className="p-2.5 bg-amber-100/60 rounded-lg border border-amber-200 text-xs text-amber-900">
                        {formData.lunarRuleType === 'first_half'
                          ? 'Rentang otomatis: Tanggal 1 s/d 15 Imlek'
                          : 'Rentang otomatis: Tanggal 16 s/d 30 Imlek'}
                      </div>
                    </div>
                  )}

                  {/* Custom Period */}
                  {formData.lunarRuleType === 'custom_period' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Bulan Imlek (Opsional, 1–12)
                        </label>
                        <input
                          type="number"
                          name="lunarMonth"
                          min="1"
                          max="12"
                          value={formData.lunarMonth}
                          onChange={handleChange}
                          placeholder="Kosongkan jika rentang tidak terikat bulan tertentu"
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Keterangan Periode Adat Khusus
                        </label>
                        <input
                          type="text"
                          name="lunarPeriodDescription"
                          value={localizedData.lunarPeriodDescription[activeTab]}
                          onChange={handleLocalizedChange}
                          placeholder={activeTab === 'id' ? "Contoh: 'Sepuluh hari sebelum dan sesudah 5 April (Ceng Beng)'" : "e.g. 'Ten days before and after April 5th (Qingming)'"}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Shared Leap Month Checkbox */}
                  <div className="pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                      <input
                        type="checkbox"
                        name="isLeapMonth"
                        checked={formData.isLeapMonth}
                        onChange={handleChange}
                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500/20 h-4 w-4"
                      />
                      <span className="font-medium">Bulan Kabisat Lunar (Runyue / 闰月)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Kalender Masehi Aktual */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2 font-semibold text-xs text-stone-900">
                  <Clock className="w-4 h-4 text-stone-600" />
                  <span>Waktu Masehi Aktual (Jika Telah Dikonfirmasi Pengurus)</span>
                </div>
                {liveGregorianPreview && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                    <CalendarCheck className="w-3 h-3 text-stone-500" />
                    <span>{liveGregorianPreview}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Waktu Mulai (Masehi)
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Kosongkan bila jadwal resmi tahun berjalan masih menunggu keputusan rapat pengurus.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Waktu Selesai (Opsional)
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Diisi jika perayaan berlangsung multi-hari atau memiliki jam penutupan tertentu.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Catatan Tambahan Jadwal
                </label>
                <textarea
                  name="scheduleNote"
                  value={localizedData.scheduleNote[activeTab]}
                  onChange={handleLocalizedChange}
                  rows={2}
                  placeholder={activeTab === 'id' ? 'Catatan bila tanggal masih tentatif atau menunggu konfirmasi...' : 'Notes regarding tentative schedules or pending council decisions...'}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              {formData.scheduleStatus === 'rescheduled' && (
                <div className="p-3.5 bg-rose-50 rounded-lg border border-rose-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Kegiatan Ditandai Mengalami Perubahan Jadwal (Rescheduled)</span>
                  </div>
                  <label className="block text-xs font-medium text-rose-900">
                    Alasan &amp; Jadwal Semula
                  </label>
                  <textarea
                    name="rescheduledNote"
                    value={localizedData.rescheduledNote[activeTab]}
                    onChange={handleLocalizedChange}
                    rows={2}
                    placeholder="Jelaskan alasan pengalihan jadwal dan tanggal semula agar umat mendapat kepastian..."
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Tempat & Lokasi Pelaksanaan */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-stone-900">
                    Tempat &amp; Lokasi Pelaksanaan
                  </h2>
                  <p className="text-[11px] text-stone-500">Klenteng Tek Hay Bio atau keterlibatan lokasi eksternal</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-stone-500">
                Pecinan Semarang
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Cakupan Lokasi
                </label>
                <select
                  name="locationType"
                  value={formData.locationType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                >
                  {ACTIVITY_LOCATION_TYPES.map((lt) => (
                    <option key={lt.value} value={lt.value}>
                      {lt.label[activeTab]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Nama Tempat / Altar
                </label>
                <input
                  type="text"
                  name="location"
                  value={localizedData.location[activeTab]}
                  onChange={handleLocalizedChange}
                  placeholder="Klenteng Tek Hay Bio, Semarang"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Alamat / Keterangan Letak Altar
              </label>
              <textarea
                name="locationAddress"
                value={localizedData.locationAddress[activeTab]}
                onChange={handleLocalizedChange}
                rows={2}
                placeholder="Jl. Gang Pinggir No. 107, Kranggan, Semarang Tengah..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            {formData.locationType !== 'internal' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Keterangan Kunjungan / Lokasi Bersama
                </label>
                <input
                  type="text"
                  name="locationRelationship"
                  value={localizedData.locationRelationship[activeTab]}
                  onChange={handleLocalizedChange}
                  placeholder="Contoh: Kirab Cap Go Meh keliling Pecinan bersama klenteng sahabat..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            )}
          </div>

          {/* Section 4: Makna Filosofis, Tradisi & Liturgi Sembahyang */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
                  <Flame className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-stone-900">
                    Makna Filosofis, Tradisi &amp; Liturgi
                  </h2>
                  <p className="text-[11px] text-stone-500">Dewa pelindung, makna spiritual, dan susunan tata ibadah</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Dewa / Tokoh Terkait
                </label>
                <input
                  type="text"
                  name="relatedDeity"
                  value={localizedData.relatedDeity[activeTab]}
                  onChange={handleLocalizedChange}
                  placeholder="Misal: Tek Hay Cin Jin, Thian Gong, Kwan Im..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Peran / Keterkaitan Hari Kebesaran
                </label>
                <input
                  type="text"
                  name="deityRole"
                  value={localizedData.deityRole[activeTab]}
                  onChange={handleLocalizedChange}
                  placeholder="Misal: Tuan Rumah / Hari Kebesaran (Sejit)..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Makna &amp; Esensi Ritual
                </label>
                <textarea
                  name="ritualMeaning"
                  value={localizedData.ritualMeaning[activeTab]}
                  onChange={handleLocalizedChange}
                  rows={3}
                  placeholder="Makna rasa syukur, permohonan keselamatan bangsa dan keluarga..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Latar Belakang Tradisi Leluhur
                </label>
                <textarea
                  name="traditionExplanation"
                  value={localizedData.traditionExplanation[activeTab]}
                  onChange={handleLocalizedChange}
                  rows={3}
                  placeholder="Riwayat sejarah tradisi yang diwariskan turun-temurun di Semarang..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Susunan Rangkaian Ibadah / Urutan Sembahyang
              </label>
              <textarea
                name="eventSequence"
                value={localizedData.eventSequence[activeTab]}
                onChange={handleLocalizedChange}
                rows={3}
                placeholder="1. Pukul 09.00 WIB: Persiapan altar utama&#10;2. Pukul 10.00 WIB: Sembahyang bersama Thian Gong&#10;3. Sembahyang Kongco Tek Hay Cin Jin..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Catatan Resmi Pengurus Klenteng
              </label>
              <textarea
                name="managementNotes"
                value={localizedData.managementNotes[activeTab]}
                onChange={handleLocalizedChange}
                rows={2}
                placeholder="Pesan, imbauan, atau tata laksana khusus dari Yayasan Klenteng..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          {/* Section 5: Partisipasi & Kebajikan Umat */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center border border-purple-200">
                  <HelpCircle className="w-4 h-4 text-purple-700" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-stone-900">
                    Panduan Partisipasi &amp; Kebajikan Umat
                  </h2>
                  <p className="text-[11px] text-stone-500">Informasi pelita berkah, perlengkapan sembahyang, dan narahubung</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-stone-400">
                Opsional
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Keterangan Partisipasi Umum
              </label>
              <textarea
                name="participationDescription"
                value={localizedData.participationDescription[activeTab]}
                onChange={handleLocalizedChange}
                rows={2}
                placeholder="Keterbukaan kehadiran jemaat, persembahan buah, dupa, atau doa bersama..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Donasi Lilin / Pelita Sembahyang
                </label>
                <textarea
                  name="candleDonationInfo"
                  value={localizedData.candleDonationInfo[activeTab]}
                  onChange={handleLocalizedChange}
                  rows={2}
                  placeholder="Informasi pemasangan pelita berkah untuk keluarga..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Donasi Lampion Doa
                </label>
                <textarea
                  name="lanternDonationInfo"
                  value={localizedData.lanternDonationInfo[activeTab]}
                  onChange={handleLocalizedChange}
                  rows={2}
                  placeholder="Pemasangan lampion doa berkah di serambi klenteng..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Pakaian &amp; Perlengkapan
                </label>
                <textarea
                  name="requiredEquipment"
                  value={localizedData.requiredEquipment[activeTab]}
                  onChange={handleLocalizedChange}
                  rows={2}
                  placeholder="Pakaian sopan rapi, perlengkapan doa pribadi..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Instruksi &amp; Tata Tertib Keheningan
                </label>
                <textarea
                  name="participationInstructions"
                  value={localizedData.participationInstructions[activeTab]}
                  onChange={handleLocalizedChange}
                  rows={2}
                  placeholder="Menjaga kesakralan altar dan mematuhi arahan panitia..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Kontak Informasi / Narahubung Sekretariat
              </label>
              <input
                type="text"
                name="contactInfo"
                value={localizedData.contactInfo[activeTab]}
                onChange={handleLocalizedChange}
                placeholder="Sekretariat Klenteng Tek Hay Bio atau narahubung panitia acara"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Operational Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Card 1: Publikasi & Status Kontrol */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h3 className="font-serif font-bold text-sm text-stone-900">
                Publikasi &amp; Klasifikasi
              </h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  formData.status === 'published'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {formData.status === 'published' ? 'Tayang Publik' : 'Draf Pengurus'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Status Publikasi
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              >
                <option value="draft">Draf (Hanya dapat dilihat pengurus)</option>
                <option value="published">Tayang Publik (Tampil di website)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Status Jadwal Pelaksanaan
              </label>
              <select
                name="scheduleStatus"
                value={formData.scheduleStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              >
                {ACTIVITY_SCHEDULE_STATUSES.map((stat) => (
                  <option key={stat.value} value={stat.value}>
                    {stat.label[activeTab]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Kategori Kegiatan
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              >
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label[activeTab]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Pola Pengulangan Acara
              </label>
              <select
                name="recurrenceType"
                value={formData.recurrenceType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              >
                {ACTIVITY_RECURRENCE_TYPES.map((rec) => (
                  <option key={rec.value} value={rec.value}>
                    {rec.label[activeTab]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tahun Sasaran (Opsional)
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="2026"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2 border-t border-stone-100">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 bg-stone-900 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-stone-800 disabled:opacity-50 text-xs transition-colors shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Menyimpan...' : initialData?.id ? 'Perbarui Agenda' : 'Simpan Agenda Baru'}</span>
              </button>

              {initialData?.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-red-700 border border-red-200 font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Menghapus...' : 'Hapus Agenda'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Poster & Foto Utama */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
            <h3 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
              Poster / Foto Utama Kegiatan
            </h3>
            <p className="text-[11px] text-stone-500">
              Dokumentasi visual atau poster jadwal yang tampil di header agenda publik.
            </p>
            <MediaPicker
              mediaCollection="activity-media"
              value={formData.featuredImage}
              onChange={(val) => setFormData((prev) => ({ ...prev, featuredImage: val }))}
            />
          </div>

          {/* Card 3: Ikhtisar Kalender (Live Preview) */}
          <div className="bg-stone-100/70 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800">
              <Eye className="w-3.5 h-3.5 text-stone-600" />
              <span>Ringkasan Agenda Publik</span>
            </div>
            <ul className="space-y-1.5 text-stone-600 text-[11px]">
              <li className="flex justify-between border-b border-stone-200/60 pb-1">
                <span className="text-stone-400">Status:</span>
                <span className="font-semibold">{schedStatusConfig.label[activeTab]}</span>
              </li>
              <li className="flex justify-between border-b border-stone-200/60 pb-1">
                <span className="text-stone-400">Imlek:</span>
                <span className="font-semibold text-amber-900">{liveLunarPreview || '—'}</span>
              </li>
              <li className="flex justify-between border-b border-stone-200/60 pb-1">
                <span className="text-stone-400">Masehi:</span>
                <span className="font-semibold">{liveGregorianPreview || 'Menunggu konfirmasi'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-stone-400">Tempat:</span>
                <span className="font-semibold truncate max-w-[140px]">{localizedData.location[activeTab] || 'Klenteng Tek Hay Bio'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  )
}
