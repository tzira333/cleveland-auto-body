'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+12164818696';
  const phoneDisplay = formatPhoneDisplay(businessPhone);
  const phoneHref = `tel:${businessPhone}`;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top Contact Bar - Desktop & Tablet Only */}
      <div className="hidden sm:block bg-red-700 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="font-medium">📍 17017 Saint Clair Ave, Cleveland, OH 44110</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Mon-Fri: 8:00 AM - 4:30 PM | Sat: 9:00 AM - 1:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left Section: Logo & Phone - INCREASED SIZE */}
            <div className="flex items-center space-x-6">
              {/* Logo - LARGER */}
              <Link href="/" className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-2xl font-bold">D&F</span>
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-xl font-bold text-gray-900 leading-tight">
                      Domestic & Foreign
                    </div>
                    <div className="text-lg text-red-700 font-semibold leading-tight">
                      Auto Body Inc.
                    </div>
                  </div>
                </div>
              </Link>

              {/* Phone Number - LARGER - Desktop Only */}
              <a
                href={phoneHref}
                className="hidden lg:flex items-center space-x-3 text-red-700 hover:text-red-800 transition-colors group"
              >
                <div className="bg-red-100 p-3 rounded-full group-hover:bg-red-200 transition-colors">
                  <Phone className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-medium">Call Us Now</div>
                  <div className="text-2xl font-bold">{phoneDisplay}</div>
                </div>
              </a>
            </div>

            {/* Center Section: Schedule Appointment Button - SMALLER - Desktop Only */}
            <div className="hidden lg:flex flex-1 justify-center px-8">
              <Link
                href="/schedule"
                className="bg-white text-red-700 border-2 border-red-700 hover:bg-red-700 hover:text-white px-5 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm"
              >
                Schedule Appointment
              </Link>
            </div>

            {/* Right Section: Navigation Links - Desktop Only */}
            <nav className="hidden lg:flex items-center space-x-2">
              <Link
                href="/"
                className="text-gray-700 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/services"
                className="text-gray-700 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Services
              </Link>
              <Link
                href="/insurance"
                className="text-gray-700 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Insurance
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </Link>

              {/* Customer Portal with Tooltip - FIXED WIDTH */}
              <div className="relative group">
                <Link
                  href="/portal"
                  className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  Customer Portal
                </Link>
                {showTooltip && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap animate-fadeIn z-50">
                    View, Update your appointment or add pictures
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45"></div>
                  </div>
                )}
              </div>

              {/* Staff Portal - MATCHING WIDTH */}
              <Link
                href="/admin/staff"
                className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-900 transition-colors whitespace-nowrap"
              >
                Staff Portal
              </Link>
            </nav>

            {/* Mobile Menu Button & Phone */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Mobile Phone Button */}
              <a
                href={phoneHref}
                className="bg-red-700 text-white p-2.5 rounded-full hover:bg-red-800 transition-colors"
                aria-label="Call us"
              >
                <Phone className="h-5 w-5" />
              </a>

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-red-700 p-2"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-7 w-7" />
                ) : (
                  <Menu className="h-7 w-7" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {/* Mobile Phone Display */}
            <a
              href={phoneHref}
              className="flex items-center justify-between p-3 text-red-700 bg-red-50 rounded-lg font-semibold hover:bg-red-100 transition-colors"
            >
              <span className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                {phoneDisplay}
              </span>
              <span className="text-sm">Tap to Call</span>
            </a>

            {/* Mobile Schedule Button */}
            <Link
              href="/schedule"
              className="block w-full text-center bg-red-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Schedule an Appointment
            </Link>

            {/* Mobile Navigation Links */}
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/services"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/insurance"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Insurance
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            {/* Mobile Portal Buttons */}
            <Link
              href="/portal"
              className="block w-full text-center bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Customer Portal
              <div className="text-xs text-blue-100 mt-1">
                View, Update your appointment or add pictures
              </div>
            </Link>
            <Link
              href="/admin/staff"
              className="block w-full text-center bg-gray-800 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Staff Portal
            </Link>

            {/* Mobile Call Button */}
            <a
              href={phoneHref}
              className="block w-full text-center bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              📞 Call Now: {phoneDisplay}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}