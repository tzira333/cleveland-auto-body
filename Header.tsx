'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold hover:opacity-90 transition-opacity">
            <div className="flex flex-col">
              <span className="text-xl font-semibold">DOMESTIC & FOREIGN</span>
              <span>AUTO BODY INC.</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="hover:text-secondary-cream transition-colors">Home</Link>
            <Link href="/services" className="hover:text-secondary-cream transition-colors">Services</Link>
            <Link href="/insurance" className="hover:text-secondary-cream transition-colors">Insurance</Link>
            <Link href="/gallery" className="hover:text-secondary-cream transition-colors">Gallery</Link>
            <Link href="/reviews" className="hover:text-secondary-cream transition-colors">Reviews</Link>
            <Link href="/contact" className="hover:text-secondary-cream transition-colors">Contact</Link>
            <Link 
              href="/schedule" 
              className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-secondary-cream transition-colors"
            >
              Schedule Appointment
            </Link>
            <Link 
              href="/portal" 
              className="border-2 border-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              Customer Portal
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-3">
            <Link href="/" className="block py-2 hover:text-secondary-cream transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/services" className="block py-2 hover:text-secondary-cream transition-colors" onClick={() => setMobileMenuOpen(false)}>Services</Link>
            <Link href="/insurance" className="block py-2 hover:text-secondary-cream transition-colors" onClick={() => setMobileMenuOpen(false)}>Insurance</Link>
            <Link href="/gallery" className="block py-2 hover:text-secondary-cream transition-colors" onClick={() => setMobileMenuOpen(false)}>Gallery</Link>
            <Link href="/reviews" className="block py-2 hover:text-secondary-cream transition-colors" onClick={() => setMobileMenuOpen(false)}>Reviews</Link>
            <Link href="/contact" className="block py-2 hover:text-secondary-cream transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <Link 
              href="/schedule" 
              className="block bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-secondary-cream transition-colors text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Schedule Appointment
            </Link>
            <Link 
              href="/portal" 
              className="block border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Customer Portal
            </Link>
          </div>
        )}
      </nav>

      {/* Contact Info Bar */}
      <div className="bg-primary-dark">
        <div className="container mx-auto px-4 py-2 flex flex-col sm:flex-row justify-between items-center text-sm">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <a href="tel:+12164818696" className="hover:text-secondary-cream transition-colors flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              (216) 481-8696
            </a>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Mon-Fri: 8:00 AM - 4:30 PM | Sat: 9:00 AM - 1:00 PM</span>
          </div>
        </div>
      </div>
    </header>
  )
}
