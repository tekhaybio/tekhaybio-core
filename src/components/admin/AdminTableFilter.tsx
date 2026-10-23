'use client'

import React, { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X, Filter, RotateCcw } from 'lucide-react'

interface CategoryOption {
  value: string
  label: string
}

interface AdminTableFilterProps {
  searchPlaceholder?: string
  categories?: CategoryOption[]
  statusOptions?: { value: string; label: string }[]
  scheduleStatusOptions?: { value: string; label: string }[]
  initialQuery?: string
  initialCategory?: string
  initialStatus?: string
  initialScheduleStatus?: string
}

export function AdminTableFilter({
  searchPlaceholder = 'Cari judul...',
  categories,
  statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'published', label: 'Publik' },
    { value: 'draft', label: 'Draft' },
  ],
  scheduleStatusOptions,
  initialQuery = '',
  initialCategory = 'all',
  initialStatus = 'all',
  initialScheduleStatus = 'all',
}: AdminTableFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [status, setStatus] = useState(initialStatus)
  const [scheduleStatus, setScheduleStatus] = useState(initialScheduleStatus)

  const applyFilters = (newQ: string, newCat: string, newStat: string, newSched: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
    
    // Reset to page 1 on filter change
    params.set('page', '1')

    if (newQ.trim()) {
      params.set('q', newQ.trim())
    } else {
      params.delete('q')
    }

    if (newCat && newCat !== 'all') {
      params.set('category', newCat)
    } else {
      params.delete('category')
    }

    if (newStat && newStat !== 'all') {
      params.set('status', newStat)
    } else {
      params.delete('status')
    }

    if (newSched && newSched !== 'all') {
      params.set('scheduleStatus', newSched)
    } else {
      params.delete('scheduleStatus')
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters(query, category, status, scheduleStatus)
  }

  const handleCategoryChange = (val: string) => {
    setCategory(val)
    applyFilters(query, val, status, scheduleStatus)
  }

  const handleStatusChange = (val: string) => {
    setStatus(val)
    applyFilters(query, category, val, scheduleStatus)
  }

  const handleScheduleStatusChange = (val: string) => {
    setScheduleStatus(val)
    applyFilters(query, category, status, val)
  }

  const handleReset = () => {
    setQuery('')
    setCategory('all')
    setStatus('all')
    setScheduleStatus('all')
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
    params.delete('q')
    params.delete('category')
    params.delete('status')
    params.delete('scheduleStatus')
    params.set('page', '1')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const hasActiveFilters = Boolean(
    query.trim() ||
      (category && category !== 'all') ||
      (status && status !== 'all') ||
      (scheduleStatus && scheduleStatus !== 'all')
  )

  return (
    <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                applyFilters('', category, status, scheduleStatus)
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          {categories && categories.length > 0 && (
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          {statusOptions && (
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          )}

          {/* Schedule Status Filter */}
          {scheduleStatusOptions && (
            <select
              value={scheduleStatus}
              onChange={(e) => handleScheduleStatusChange(e.target.value)}
              className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              <option value="all">Semua Status Jadwal</option>
              {scheduleStatusOptions.map((ss) => (
                <option key={ss.value} value={ss.value}>
                  {ss.label}
                </option>
              ))}
            </select>
          )}

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              title="Reset semua filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
