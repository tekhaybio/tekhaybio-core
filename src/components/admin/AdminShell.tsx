/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Box,
  Image as ImageIcon,
  History,
  Settings,
  Users,
  Menu,
  X,
  LogOut,
  Globe,
  Home,
  Tag,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react'
import { AdminFeedbackProvider } from './AdminFeedbackContext'

export function AdminShell({ children, user }: { children: React.ReactNode; user: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (pathname === '/admin/login') {
    return <AdminFeedbackProvider>{children}</AdminFeedbackProvider>
  }

  const isSuperAdmin = user?.role === 'super_admin'

  const navGroups = [
    {
      groupLabel: 'Ikhtisar',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      groupLabel: 'Publikasi & Layanan',
      items: [
        { label: 'Berita & Artikel', href: '/admin/berita', icon: FileText },
        { label: 'Kategori Berita', href: '/admin/kategori-berita', icon: Tag },
        { label: 'Layanan Umat', href: '/admin/layanan', icon: Box },
      ],
    },
    {
      groupLabel: 'Tradisi & Dokumentasi',
      items: [
        { label: 'Kegiatan & Perayaan', href: '/admin/kegiatan', icon: CalendarDays },
        { label: 'Galeri & Media', href: '/admin/galeri', icon: ImageIcon },
      ],
    },
    {
      groupLabel: 'Profil Klenteng',
      items: [
        { label: 'Sejarah & Linimasa', href: '/admin/sejarah', icon: History },
      ],
    },
  ]

  const adminGroups = isSuperAdmin
    ? [
        {
          groupLabel: 'Sistem & Pengaturan',
          items: [
            { label: 'Halaman Beranda', href: '/admin/halaman-beranda', icon: Home },
            { label: 'Informasi Website', href: '/admin/informasi-website', icon: Globe },
            { label: 'Kelola Pengguna', href: '/admin/pengguna', icon: Users },
            { label: 'Pengaturan Lanjutan', href: '/admin/pengaturan', icon: Settings },
          ],
        },
      ]
    : []

  const isItemActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // Derive current section label for breadcrumbs
  const allItems = [...navGroups.flatMap((g) => g.items), ...adminGroups.flatMap((g) => g.items)]
  const currentItem = allItems.find((item) => isItemActive(item.href))

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header */}
      <div className="p-6 border-b border-stone-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-300 font-serif font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
            德
          </div>
          <div>
            <h1 className="text-base font-bold font-serif text-stone-900 tracking-tight leading-tight">
              TEK HAY BIO
            </h1>
            <p className="text-[11px] font-medium text-stone-600 tracking-wider">
              德海廟 • Portal Admin
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto min-h-0">
        {navGroups.map((group) => (
          <div key={group.groupLabel} className="space-y-1">
            <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5 px-3">
              {group.groupLabel}
            </div>
            {group.items.map((item) => {
              const active = isItemActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    active
                      ? 'bg-stone-100 text-stone-900 font-semibold shadow-2xs border-l-4 border-primary pl-2'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <item.icon
                    className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-stone-400'}`}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}

        {isSuperAdmin &&
          adminGroups.map((group) => (
            <div key={group.groupLabel} className="space-y-1 pt-2 border-t border-stone-100">
              <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5 px-3">
                {group.groupLabel}
              </div>
              {group.items.map((item) => {
                const active = isItemActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                      active
                        ? 'bg-stone-100 text-stone-900 font-semibold shadow-2xs border-l-4 border-primary pl-2'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-stone-400'}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-stone-200 bg-stone-50/60 shrink-0">
        <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs uppercase border border-stone-300 shrink-0">
            {user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-stone-900 truncate">{user?.email}</p>
            <div className="flex items-center gap-1 text-[10px] text-stone-600 capitalize">
              {isSuperAdmin ? (
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
              ) : (
                <User className="w-3 h-3 text-stone-600" />
              )}
              <span>{user?.role?.replace('_', ' ') || 'Editor'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-lg transition-colors text-xs font-medium text-rose-700 hover:bg-rose-50 hover:text-rose-800"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </div>
  )

  return (
    <AdminFeedbackProvider>
      <div className="fixed inset-0 flex overflow-hidden bg-stone-50 text-stone-900 font-sans">
        {/* Mobile Drawer (Dialog Overlay) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="relative w-64 max-w-xs bg-white h-full flex flex-col shadow-2xl z-10 border-r border-stone-200 animate-in slide-in-from-left duration-200">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Desktop Sidebar (Permanent, 100% viewport height, independent nav scroll) */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 h-full border-r border-stone-200 bg-white">
          <SidebarContent />
        </aside>

        {/* Main Content Area (Header + Scrollable Main Workspace) */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Mobile Top Header */}
          <div className="md:hidden h-14 bg-white border-b border-stone-200 flex items-center justify-between px-4 shrink-0 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-stone-900 text-amber-300 font-serif font-bold text-xs flex items-center justify-center">
                德
              </div>
              <span className="font-serif font-bold text-sm text-stone-900">Tek Hay Bio Admin</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Buka menu navigasi"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Desktop Top Header Bar */}
          <header className="hidden md:flex h-16 bg-white border-b border-stone-200 items-center justify-between px-8 shrink-0">
            {/* Breadcrumb / Title Context */}
            <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
              <Link href="/admin" className="hover:text-stone-900">
                Admin
              </Link>
              {currentItem && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-stone-900 font-semibold">{currentItem.label}</span>
                </>
              )}
            </div>

            {/* Quick Actions & Role Badge */}
            <div className="flex items-center gap-4">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  isSuperAdmin
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {isSuperAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                ) : (
                  <User className="w-3.5 h-3.5 text-stone-500" />
                )}
                <span>{isSuperAdmin ? 'Super Administrator' : 'Editor Konten'}</span>
              </span>

              <div className="h-4 w-px bg-stone-200" />

              <Link
                href="/id"
                target="_blank"
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors shadow-2xs"
              >
                <span>Lihat Website</span>
                <Globe className="w-3.5 h-3.5 text-stone-500" />
              </Link>
            </div>
          </header>

          {/* Scrollable Main Workspace */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-stone-50">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AdminFeedbackProvider>
  )
}
