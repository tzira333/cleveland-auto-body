'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPhoneDisplay } from '@/lib/utils/phone'

interface CustomerUser {
  id: string
  email: string
  full_name: string
  phone: string
  created_at: string
}

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

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<CustomerUser | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        router.push('/portal/auth/login')
        return
      }

      // Get customer user details
      const { data: customerData, error: customerError } = await supabase
        .from('customer_users')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single()

      if (customerError || !customerData) {
        // Not a valid customer
        await supabase.auth.signOut()
        router.push('/portal/auth/login')
        return
      }

      setCustomer(customerData)

      // Load appointments for this customer
      await loadAppointments(customerData.id)

    } catch (err: any) {
      console.error('Auth check error:', err)
      setError('Failed to load account information')
      setLoading(false)
    }
  }

  const loadAppointments = async (customerId: string) => {
    try {
      const { data, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_user_id', customerId)
        .order('created_at', { ascending: false })

      if (appointmentError) throw appointmentError

      setAppointments(data || [])
    } catch (err: any) {
      console.error('Error loading appointments:', err)
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/portal/auth/login')
    router.refresh()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-red-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/portal/auth/login')}
            className="bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {customer?.full_name}!
              </h1>
              <p className="text-gray-600">
                Domestic and Foreign Auto Body Inc. - Customer Portal
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{customer?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{formatPhoneDisplay(customer?.phone || '')}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Appointments</h3>
            <p className="text-4xl font-bold text-blue-900">{appointments.length}</p>
          </div>

          <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Active Appointments</h3>
            <p className="text-4xl font-bold text-green-900">
              {appointments.filter(a => ['pending', 'confirmed', 'in-progress'].includes(a.status)).length}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/schedule"
              className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              <span>📅</span>
              <span>Schedule Appointment</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <span>💬</span>
              <span>Contact Us</span>
            </Link>
            <Link
              href="/tow-request"
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <span>🚛</span>
              <span>Request Tow</span>
            </Link>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Appointments</h3>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">No Appointments Yet</h4>
              <p className="text-gray-600 mb-6">
                Schedule your first appointment to get started
              </p>
              <Link
                href="/schedule"
                className="inline-block bg-red-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Schedule Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-red-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {getServiceTypeLabel(appointment.service_type)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Appointment ID: {appointment.id.slice(0, 8)}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(appointment.status)}`}
                    >
                      {appointment.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Date & Time</p>
                      <p className="text-gray-900">
                        {appointment.appointment_date} at {appointment.appointment_time}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Submitted</p>
                      <p className="text-gray-900">
                        {new Date(appointment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {appointment.vehicle_make && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Vehicle</p>
                      <p className="text-gray-900">
                        {appointment.vehicle_year} {appointment.vehicle_make} {appointment.vehicle_model}
                      </p>
                    </div>
                  )}

                  {appointment.damage_description && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Details</p>
                      <p className="text-gray-900">{appointment.damage_description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-2">
            <strong>Questions or concerns?</strong>
          </p>
          <p className="text-gray-600">
            Call us at{' '}
            <a href="tel:+12164818696" className="text-red-600 font-semibold hover:underline">
              (216) 481-8696
            </a>
            {' '}or email{' '}
            <a href="mailto:domesticandforeignab@gmail.com" className="text-red-600 font-semibold hover:underline">
              domesticandforeignab@gmail.com
            </a>
          </p>
          <p className="text-gray-600 mt-2">
            17017 Saint Clair Ave, Cleveland, OH 44110
          </p>
        </div>
      </div>
    </div>
  )
}
