/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, User, AlertCircle, Info, Loader2 } from 'lucide-react'

export function CreateFirstUserForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 1. Create User using First User Endpoint (Requires no auth if 0 users exist)
      const res = await fetch('/api/users/first-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role: 'super_admin' }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Gagal membuat pengguna pertama.')
        setIsLoading(false)
        return
      }

      // 2. Login
      const loginRes = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (loginRes.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        router.push('/admin/login')
        router.refresh()
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleCreate} className="space-y-4">
      <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-lg border border-amber-200 flex items-start gap-2 leading-relaxed">
        <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
        <span>
          Sistem mendeteksi database belum memiliki akun administrator. Buat akun <strong>Super Administrator</strong> pertama Anda untuk mengawali pengelolaan situs.
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Nama Lengkap</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pengurus TITD"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Alamat Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@tekhaybio.org"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Kata Sandi</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-stone-900 text-white py-2.5 px-4 rounded-lg text-xs font-semibold hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/30 transition-colors disabled:opacity-50 shadow-2xs"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Membuat Akun...</span>
          </>
        ) : (
          <span>Buat Super Admin &amp; Masuk</span>
        )}
      </button>
    </form>
  )
}
