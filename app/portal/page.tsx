'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { createClient } from '@supabase/supabase-js'
import { normalizePhone, formatPhoneDisplay } from '@/lib/utils/phone'
import Link from 'next/link'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface Appointment {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  service_type: string
  appointment_date: string
  appointment_time: string
  status: string
  vehicle_year?: string
  vehicle_make?: string
  vehicle_model?: string
  damage_description?: string
  created_at: string
}

export default function CustomerPortal() {
  const [phone, setPhone] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '')
    
    // Limit to 10 digits
    const limitedDigits = digitsOnly.slice(0, 10)
    
    // Format as user types: XXX-XXX-XXXX
    let formatted = limitedDigits
    if (limitedDigits.length > 6) {
      formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6, 10)}`
    } else if (limitedDigits.length > 3) {
      formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`
    }
    
    setPhone(formatted)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSearched(true)

    // Normalize phone number to digits only
    const normalizedPhone = normalizePhone(phone)

    // Validate phone number is exactly 10 digits
    if (normalizedPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      setLoading(false)
      return
    }

    try {
      const { data, error: queryError } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_phone', normalizedPhone)
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      setAppointments(data || [])
    } catch (err: any) {
      setError('Failed to retrieve appointments. Please try again.')
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
  }

  const getServiceTypeLabel = (serviceType: string) => {
    const types: Record<string, string> = {
      'express-care': '⚡ Express Care',
      'schedule': '📅 Schedule',
      'tow-service': '🚛 Tow Service',
      'contact-inquiry': '💬 Contact',
    }
    return types[serviceType] || serviceType
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Customer Portal - Quick Lookup
            </h1>
            <p className="text-gray-600 mb-4">
              View your appointment status by phone number
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <Link
                href="/portal/auth/login"
                className="text-red-600 font-semibold hover:underline"
              >
                🔐 Login to Your Account
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/portal/auth/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                ✨ Create an Account
              </Link>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Enter Your Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
                required
                maxLength={12}
                placeholder="216-481-8696"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-semibold text-gray-900"
                autoComplete="tel"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter your 10-digit phone number (e.g., 216-481-8696)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Searching...
                </span>
              ) : (
                '🔍 View My Appointments'
              )}
            </button>
          </form>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Need Help?</strong>
            </p>
            <p>
              Call us at{' '}
              <a href="tel:+12164818696" className="text-red-600 font-semibold hover:underline">
                (216) 481-8696
              </a>
            </p>
            <p className="mt-1">17017 Saint Clair Ave, Cleveland, OH 44110</p>
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 font-semibold mb-2">
                💡 Pro Tip: Create an account for easier access!
              </p>
              <p className="text-blue-700 text-xs">
                With an account, you can view all your appointments instantly without entering your phone number each time.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No Appointments Found
                </h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any appointments for{' '}
                  <span className="font-semibold">{formatPhoneDisplay(phone)}</span>
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-left">
                  <p className="text-sm text-blue-800">
                    <strong>Tips:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Make sure you entered the correct phone number</li>
                    <li>Try the phone number you used when booking</li>
                    <li>Call us at (216) 481-8696 for assistance</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <p className="text-green-800 font-semibold">
                    ✅ Found {appointments.length} appointment{appointments.length > 1 ? 's' : ''} for{' '}
                    {formatPhoneDisplay(phone)}
                  </p>
                </div>

                {appointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {appointment.customer_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Service: {getServiceTypeLabel(appointment.service_type)}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Date & Time:</p>
                        <p className="text-gray-900">
                          {appointment.appointment_date} at {appointment.appointment_time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Phone:</p>
                        <p className="text-gray-900">{formatPhoneDisplay(appointment.customer_phone)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Email:</p>
                        <p className="text-gray-900">{appointment.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Submitted:</p>
                        <p className="text-gray-900">
                          {new Date(appointment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {appointment.vehicle_make && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Vehicle Information:</p>
                        <p className="text-gray-900">
                          {appointment.vehicle_year} {appointment.vehicle_make} {appointment.vehicle_model}
                        </p>
                      </div>
                    )}

                    {appointment.damage_description && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Damage Description:</p>
                        <p className="text-gray-900">{appointment.damage_description}</p>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 text-center">
                        Questions? Call us at{' '}
                        <a href="tel:+12164818696" className="text-red-600 font-semibold hover:underline">
                          (216) 481-8696
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
