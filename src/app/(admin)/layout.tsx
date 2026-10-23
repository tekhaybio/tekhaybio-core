/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import '../globals.css'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { AdminShell } from '@/components/admin/AdminShell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  return (
    <html lang="id" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-stone-50 text-stone-900 font-sans antialiased" suppressHydrationWarning>
        <AdminShell user={user}>
          {children}
        </AdminShell>
      </body>
    </html>
  )
}
