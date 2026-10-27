import React from 'react'
import { getGlobal } from './queries'
import { PageHeader } from '@/components/ui/PageHeader'
import { Container, Section } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'
import { notFound } from 'next/navigation'
import { MapPin, Clock, Phone, Mail, Compass, ExternalLink } from 'lucide-react'

export async function ContactPage({ locale }: { locale: 'id' | 'en' }) {
  const contactInfo = await getGlobal('contact-information', locale)
  
  if (!contactInfo) {
    notFound()
  }

  const socialMedia = Array.isArray(contactInfo.socialMedia) ? contactInfo.socialMedia : []

  return (
    <>
      <PageHeader 
        title={locale === 'id' ? 'Kontak & Lokasi TITD' : 'Contact & Temple Location'}
        description={locale === 'id' ? 'Panduan kunjungan, tata letak, dan saluran komunikasi resmi TITD Tek Hay Bio, Pecinan Semarang.' : 'Visitor guide, directions, and official contact channels for TITD Tek Hay Bio, Semarang Chinatown.'}
      />
      <Section className="bg-white py-16 md:py-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            
            <div className="space-y-10">
              {/* Address */}
              <div className="space-y-3 pb-6 border-b border-stone-200">
                <div className="flex items-center gap-2.5 text-stone-900">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <h2 className="text-xl font-serif font-bold">
                    {locale === 'id' ? 'Alamat & Lokasi' : 'Temple Address'}
                  </h2>
                </div>
                <p className="text-base text-stone-700 whitespace-pre-line leading-relaxed pl-7">
                  {contactInfo.address as string || 'Jl. Gang Pinggir No. 105-107, Kranggan, Semarang Tengah, Kota Semarang, Jawa Tengah 50137'}
                </p>
                {Boolean(contactInfo.googleMapsUrl) && (
                  <div className="pl-7 pt-1">
                    <Button href={contactInfo.googleMapsUrl as string} variant="outline" className="inline-flex items-center gap-2 text-xs">
                      <span>{locale === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Visiting Hours */}
              <div className="space-y-3 pb-6 border-b border-stone-200">
                <div className="flex items-center gap-2.5 text-stone-900">
                  <Clock className="w-5 h-5 text-amber-700 shrink-0" />
                  <h2 className="text-xl font-serif font-bold">
                    {locale === 'id' ? 'Jam Buka Operasional' : 'Visiting Hours'}
                  </h2>
                </div>
                <p className="text-base text-stone-700 whitespace-pre-line leading-relaxed pl-7">
                  {contactInfo.visitingHours as string || (locale === 'id' ? 'Setiap Hari\n06.00 - 18.00 WIB' : 'Open Daily\n06:00 AM - 06:00 PM WIB')}
                </p>
              </div>
              
              {/* Contact Channels */}
              <div className="space-y-4 pb-6 border-b border-stone-200">
                <div className="flex items-center gap-2.5 text-stone-900">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <h2 className="text-xl font-serif font-bold">
                    {locale === 'id' ? 'Saluran Komunikasi Resmi' : 'Official Communication'}
                  </h2>
                </div>
                <div className="space-y-3 pl-7 text-sm">
                  {Boolean(contactInfo.phone) && (
                    <div className="flex items-center gap-3 text-stone-700">
                      <span className="font-semibold text-stone-900 w-28">Telepon / WA:</span>
                      <a target="_blank" rel="noopener noreferrer" href={`https://wa.me/${(contactInfo.phone as string).replace(/\D/g, '').replace(/^0/, '62')}`} className="text-primary hover:underline font-medium">
                        {contactInfo.phone as string}
                      </a>
                    </div>
                  )}
                  {Boolean(contactInfo.email) && (
                    <div className="flex items-center gap-3 text-stone-700">
                      <span className="font-semibold text-stone-900 w-28">Email:</span>
                      <a href={`mailto:${contactInfo.email as string}`} className="text-primary hover:underline font-medium">
                        {contactInfo.email as string}
                      </a>
                    </div>
                  )}
                  {socialMedia.map((social: Record<string, unknown>, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-stone-700">
                      <span className="font-semibold text-stone-900 w-28 capitalize">{social.platform as string}:</span>
                      <a href={social.url as string} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                        {social.label as string}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Etiquette Notes */}
              <div className="p-5 bg-stone-50 rounded-lg border border-stone-200 space-y-2 text-xs text-stone-600">
                <div className="font-serif font-bold text-stone-900 flex items-center gap-2 text-sm">
                  <Compass className="w-4 h-4 text-primary" />
                  <span>{locale === 'id' ? 'Etiket & Tata Krama Pengunjung' : 'Visitor Etiquette'}</span>
                </div>
                <p className="leading-relaxed">
                  {locale === 'id'
                    ? 'Pengunjung dan peziarah dimohon berpakaian sopan dan menjaga ketenangan di area peribadatan dan altar dewa-dewi.'
                    : 'Visitors and devotees are kindly requested to dress respectfully and maintain quiet decorum within prayer halls and deity altar sanctuaries.'}
                </p>
              </div>
            </div>

            {/* Map Container */}
            <div className="bg-stone-100 rounded-lg overflow-hidden border border-stone-200 min-h-[420px] relative shadow-2xs">
              <div className="absolute inset-0 z-0">
                {Boolean(contactInfo.googleMapsEmbedCode) ? (
                  <div 
                    className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none" 
                    dangerouslySetInnerHTML={{ __html: contactInfo.googleMapsEmbedCode as string }} 
                  />
                ) : Boolean(contactInfo.latitude && contactInfo.longitude) ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    title="Google Maps Location"
                    src={`https://maps.google.com/maps?q=${contactInfo.latitude},${contactInfo.longitude}&z=18&output=embed&iwloc=`}
                  />
                ) : (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    title="Google Maps Location"
                    src="https://maps.google.com/maps?q=TITD%20Tek%20Hay%20Bio,%20Semarang&z=18&output=embed&iwloc="
                  />
                )}
              </div>
            </div>

          </div>
        </Container>
      </Section>
    </>
  )
}
