'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Hero() {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <section className="relative">
      {/* Red Section - Thin top banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white py-8 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
          Expert Auto Body & Collision Repair in Cleveland
        </h1>
        <p className="text-lg md:text-xl text-red-100">
          Over 40 years of experience serving domestic and foreign vehicles
        </p>
      </div>

      {/* Wave Divider: Red to White */}
      <div className="relative h-16 bg-white">
        <svg
          className="absolute top-0 w-full h-16"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,50 C240,100 480,0 720,50 C960,100 1200,0 1440,50 L1440,0 L0,0 Z"
            fill="#b91c1c"
          />
        </svg>
      </div>

      {/* White Section - Main content */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {/* Schedule Estimate */}
            <Link
              href="/schedule"
              className="px-6 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-all"
            >
              Schedule Estimate
            </Link>

            {/* Request Tow Service */}
            <Link
              href="/tow-request"
              className="px-6 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-all"
            >
              Request Tow Service
            </Link>

            {/* Express Care Request with Tooltip */}
            <div className="relative inline-block">
              <Link
                href="/repair-request"
                className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-lg"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                Express Care Request
              </Link>
              
              {/* Tooltip Bubble */}
              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-20 z-50 animate-fadeIn">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg shadow-2xl whitespace-nowrap relative">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-sm">
                        Get your vehicle repaired and returned to you in less than 24hrs
                      </span>
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-red-500"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">⭐</div>
              <p className="font-semibold text-gray-900">4.6 Star Rating</p>
              <p className="text-sm text-gray-600">Trusted by hundreds</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🛡️</div>
              <p className="font-semibold text-gray-900">All Insurance Accepted</p>
              <p className="text-sm text-gray-600">We work with all carriers</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🏆</div>
              <p className="font-semibold text-gray-900">40+ Years Experience</p>
              <p className="text-sm text-gray-600">Family owned & operated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider: White to Blue */}
      <div className="relative h-16 bg-blue-900">
        <svg
          className="absolute top-0 w-full h-16"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,50 C240,0 480,100 720,50 C960,0 1200,100 1440,50 L1440,0 L0,0 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* Blue Section - Bottom */}
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Services */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Services</h2>
              <ul className="space-y-2 text-blue-100">
                <li>✓ Collision Repair</li>
                <li>✓ Paintless Dent Removal</li>
                <li>✓ Frame Straightening</li>
                <li>✓ Paint & Refinishing</li>
                <li>✓ Insurance Claims Assistance</li>
                <li>✓ Free Estimates</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <div className="space-y-3 text-blue-100">
                <p className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <span>17017 Saint Clair Ave<br />Cleveland, OH 44110</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-xl">📞</span>
                  <a href="tel:+12164818696" className="hover:text-white font-semibold">
                    (216) 481-8696
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-xl">🕐</span>
                  <span>
                    Mon-Fri: 8:00 AM - 4:30 PM<br />
                    Sat: 9:00 AM - 1:00 PM
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
