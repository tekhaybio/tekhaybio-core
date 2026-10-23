/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tekhaybio.com'
  
  const routes = [
    '',
    '/about', '/tentang-kami',
    '/history', '/sejarah',
    '/services', '/layanan',
    '/activities', '/kegiatan',
    '/ritual-calendar', '/kalender-ritual',
    '/news', '/berita',
    '/gallery', '/galeri',
    '/contact', '/kontak',
  ]

  return routes.flatMap((route) => {
    if (route === '') {
      return [
        { url: `${baseUrl}/id`, lastModified: new Date() },
        { url: `${baseUrl}/en`, lastModified: new Date() }
      ]
    }
    
    const isIndonesian = ['tentang-kami', 'sejarah', 'layanan', 'kegiatan', 'kalender-ritual', 'berita', 'galeri', 'kontak'].some(r => route.includes(r))
    const locale = isIndonesian ? 'id' : 'en'

    return {
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
    }
  })
}
