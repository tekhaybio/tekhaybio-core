'use client'

import React from 'react'
import { Globe, Languages, CheckCircle2, AlertCircle } from 'lucide-react'

interface LocaleTabsProps {
  activeTab: 'id' | 'en'
  onTabChange: (tab: 'id' | 'en') => void
  indicators?: {
    idComplete?: boolean
    enComplete?: boolean
    enMissingCount?: number
  }
}

export function LocaleTabs({ activeTab, onTabChange, indicators }: LocaleTabsProps) {
  return (
    <div className="bg-white p-3 rounded-xl border border-stone-200 mb-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Tab Buttons */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg">
        <button
          type="button"
          onClick={() => onTabChange('id')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-xs transition-all ${
            activeTab === 'id'
              ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          <span className="font-bold">🇮🇩 Bahasa Indonesia</span>
          <span className="px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded text-[10px]">Utama</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('en')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-xs transition-all ${
            activeTab === 'en'
              ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          <span className="font-bold">🇬🇧 English Translation</span>
          {indicators?.enComplete ? (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px]">
              <CheckCircle2 className="w-2.5 h-2.5" /> Lengkap
            </span>
          ) : indicators?.enMissingCount && indicators.enMissingCount > 0 ? (
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px]">
              {indicators.enMissingCount} Kosong
            </span>
          ) : (
            <span className="px-1.5 py-0.2 bg-stone-200 text-stone-600 rounded text-[10px]">Opsional</span>
          )}
        </button>
      </div>

      {/* Helper Context Note */}
      <div className="text-[11px] text-stone-500 flex items-center gap-1.5 px-2">
        <Languages className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span>
          {activeTab === 'id'
            ? 'Teks Bahasa Indonesia wajib diisi sebagai bahasa rujukan situs TITD.'
            : 'Teks Bahasa Inggris opsional. Jika dikosongkan, sistem otomatis menampilkan bahasa Indonesia.'}
        </span>
      </div>
    </div>
  )
}
