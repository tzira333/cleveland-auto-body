'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Get phone from env or use default
  const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+12164818696'
  
  // Format phone for display (XXX) XXX-XXXX
  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return phone
  }

  return (
    <header className="bg-primary shadow-md sticky top-0 z-50">
      {/* Ultra-Compact Navigation */}
      <nav className="container mx-auto px-3">
        <div className="flex items-center justify-between py-0.5">
          
          {/* Logo Section - Ultra Minimal */}
          <Link 
            href="/" 
            className="flex-shrink-0 hover:opacity-90 transition-opacity"
            style={{ width: '22%', minWidth: '180px' }}
          >
            <div className="bg-primary rounded py-0.5 px-1 border border-secondary-cream/50">
              {/* Company Name */}
              <div className="text-center">
                <h1 className="text-secondary-cream font-bold text-xs md:text-sm leading-tight">
                  DOMESTIC & FOREIGN
                </h1>
              </div>

              {/* AUTOBODY SHOP */}
              <div className="bg-secondary-cream text-primary text-center py-0.5 my-0.5 rounded">
                <span className="font-bold text-xs leading-none">
                  AUTOBODY SHOP
                </span>
              </div>

              {/* Phone Only */}
              <div className="text-center">
                <a 
                  href={`tel:${businessPhone}`}
                  className="block text-secondary-cream font-bold text-xs hover:text-white transition-colors leading-tight"
                >
                  {formatPhoneDisplay(businessPhone)}
                </a>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - Ultra Compact */}
          <div className="hidden lg:flex items-center justify-start flex-grow gap-1.5 ml-4">
            <Link href="/" className="text-xs text-white hover:text-secondary-cream transition-colors whitespace-nowrap px-1">
              Home
            </Link>
            <span className="text-white/30 text-xs">|</span>
            <Link href="/services" className="text-xs text-white hover:text-secondary-cream transition-colors whitespace-nowrap px-1">
              Services
            </Link>
            <span className="text-white/30 text-xs">|</span>
            <Link href="/insurance" className="text-xs text-white hover:text-secondary-cream transition-colors whitespace-nowrap px-1">
              Insurance
            </Link>
            <span className="text-white/30 text-xs">|</span>
            <Link href="/gallery" className="text-xs text-white hover:text-secondary-cream transition-colors whitespace-nowrap px-1">
              Gallery
            </Link>
            <span className="text-white/30 text-xs">|</span>
            <Link href="/reviews" className="text-xs text-white hover:text-secondary-cream transition-colors whitespace-nowrap px-1">
              Reviews
            </Link>
            <span className="text-white/30 text-xs">|</span>
            <Link href="/contact" className="text-xs text-white hover:text-secondary-cream transition-colors whitespace-nowrap px-1">
              Contact
            </Link>
            <span className="text-white/30 text-xs">|</span>
            <Link 
              href="/portal" 
              className="text-xs px-1.5 py-0.5 border border-white text-white hover:bg-white hover:text-primary transition-colors rounded whitespace-nowrap"
            >
              Portal
            </Link>
            <Link 
              href="/schedule" 
              className="text-xs px-1.5 py-0.5 bg-white text-primary hover:bg-secondary-cream transition-colors rounded font-semibold whitespace-nowrap"
            >
              Schedule
            </Link>
            <Link 
              href="/admin" 
              className="text-xs px-1.5 py-0.5 border border-white text-white hover:bg-white hover:text-primary transition-colors rounded font-semibold whitespace-nowrap"
            >
              Staff
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-1"
            aria-label="Toggle menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu - Compact */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-1 space-y-0.5">
            <Link 
              href="/" 
              className="block py-0.5 text-xs text-white hover:text-secondary-cream transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/services" 
              className="block py-0.5 text-xs text-white hover:text-secondary-cream transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              href="/insurance" 
              className="block py-0.5 text-xs text-white hover:text-secondary-cream transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Insurance
            </Link>
            <Link 
              href="/gallery" 
              className="block py-0.5 text-xs text-white hover:text-secondary-cream transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link 
              href="/reviews" 
              className="block py-0.5 text-xs text-white hover:text-secondary-cream transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Reviews
            </Link>
            <Link 
              href="/contact" 
              className="block py-0.5 text-xs text-white hover:text-secondary-cream transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              href="/portal" 
              className="block py-0.5 text-xs text-white hover:text-secondary-cream transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Portal
            </Link>
            <Link 
              href="/schedule" 
              className="block py-1 bg-white text-primary text-center text-xs font-semibold rounded hover:bg-secondary-cream transition-colors mt-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Schedule
            </Link>
            <Link 
              href="/admin" 
              className="block py-1 border border-white text-white text-center text-xs font-semibold rounded hover:bg-white hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Staff
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}




