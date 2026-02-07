import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Domestic and Foreign Auto Body Inc. | Auto Body & Collision Repair | Cleveland, Ohio',
  description: 'Expert auto body repair, collision repair, and custom painting in Cleveland, OH.  Major & minor collision repair, complete paint & touch-ups.',
  keywords: 'auto body repair, collision center, car repair Cleveland, auto painting, body shop Cleveland OH,Old Schools, Towing, Tow Service, Insurnace claim, accident, damage, car accident, stolen, theft',
  openGraph: {
    title: 'Domestic and Foreign Auto Body Inc.',
    description: 'Cleveland\'s trusted auto body & collision repair specialists',
    url: 'https://www.clevelandbody.com',
    siteName: 'Domestic and Foreign Auto Body Inc.',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
