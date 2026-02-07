import type { Metadata } from 'next'
import Script from 'next/script'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Domestic and Foreign Auto Body Inc. | Cleveland Auto Body Repair',
  description: 'Expert auto body repair and collision services in Cleveland, OH. Over 40 years of experience. Serving domestic and foreign vehicles. Free estimates.',
  keywords: 'auto body repair, collision repair, Cleveland, Ohio, car repair, auto paint, dent removal',
  openGraph: {
    title: 'Domestic and Foreign Auto Body Inc.',
    description: 'Expert auto body repair in Cleveland, OH with over 40 years of experience',
    url: 'https://clevelandbody.com',
    siteName: 'Domestic and Foreign Auto Body Inc.',
    images: [
      {
        url: 'https://clevelandbody.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Domestic and Foreign Auto Body Inc.',
    description: 'Expert auto body repair in Cleveland, OH',
    images: ['https://clevelandbody.com/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://clevelandbody.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-17911238689"
        />
        <Script
          id="gtag-init"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17911238689');
            `,
          }}
        />

        {/* JSON-LD Structured Data for Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'AutoRepair',
              name: 'Domestic and Foreign Auto Body Inc.',
              image: 'https://clevelandbody.com/logo.jpg',
              '@id': 'https://clevelandbody.com',
              url: 'https://clevelandbody.com',
              telephone: '+12164818696',
              priceRange: '$$',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '17017 Saint Clair Ave',
                addressLocality: 'Cleveland',
                addressRegion: 'OH',
                postalCode: '44110',
                addressCountry: 'US',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 41.5868,
                longitude: -81.5579,
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  opens: '08:00',
                  closes: '16:30',
                },
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: 'Saturday',
                  opens: '09:00',
                  closes: '13:00',
                },
              ],
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.6',
                reviewCount: '150',
              },
            }),
          }}
        />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
