'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface Appointment {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  appointment_date: string
  appointment_time: string
  service_type: string | null
  vehicle_info: string | null
  message: string | null
  status: string
  created_at: string
}

interface AppointmentPhoto {
  id: string
  appointment_id: string
  photo_url: string
  photo_path: string
  caption: string
  uploaded_by: string
  created_at: string
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [appointmentPhotos, setAppointmentPhotos] = useState<Record<string, AppointmentPhoto[]>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null)
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null)
  const router = useRouter()

  // Initialize Supabase client inside component
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkAuth()
    fetchAppointments()
  }, [filter])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin')
    }
  }

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      
      const appointmentsData = data || []
      setAppointments(appointmentsData)

      // Load photos for all appointments
      for (const appointment of appointmentsData) {
        await loadPhotosForAppointment(appointment.id)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPhotosForAppointment = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointment_photos')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setAppointmentPhotos(prev => ({
        ...prev,
        [appointmentId]: data || []
      }))
    } catch (err) {
      console.error('Error loading photos:', err)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setAppointments(prev =>
        prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt)
      )
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const toggleAppointmentDetails = (appointmentId: string) => {
    setExpandedAppointment(expandedAppointment === appointmentId ? null : appointmentId)
  }

  const filteredAppointments = appointments.filter(apt =>
    apt.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.customer_phone.includes(searchTerm) ||
    apt.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPhotoCount = (appointmentId: string) => {
    return appointmentPhotos[appointmentId]?.length || 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {photoModalUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPhotoModalUrl(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={() => setPhotoModalUrl(null)}
              className="absolute top-4 right-4 bg-white text-gray-900 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100"
            >
              ✕
            </button>
            <img
              src={photoModalUrl}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}

      <div className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-white/80">Domestic & Foreign Auto Body</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Filter by Status
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'confirmed', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      filter === status
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone, or email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', count: appointments.length, color: 'text-primary' },
            { label: 'Pending', count: appointments.filter(a => a.status === 'pending').length, color: 'text-yellow-600' },
            { label: 'Confirmed', count: appointments.filter(a => a.status === 'confirmed').length, color: 'text-blue-600' },
            { label: 'Completed', count: appointments.filter(a => a.status === 'completed').length, color: 'text-green-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.count}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
              Loading appointments...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
              No appointments found
            </div>
          ) : (
            filteredAppointments.map((appointment) => {
              const photoCount = getPhotoCount(appointment.id)
              const isExpanded = expandedAppointment === appointment.id

              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleAppointmentDetails(appointment.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {appointment.customer_name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          {photoCount > 0 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                              📷 {photoCount}
                            </span>
                          )}
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Vehicle:</span>{' '}
                            <span className="font-semibold">{appointment.vehicle_info || 'Not provided'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>{' '}
                            <span className="font-semibold">
                              {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}{' '}
                              at {appointment.appointment_time}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Service:</span>{' '}
                            <span className="font-semibold">{appointment.service_type || 'Not specified'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        {isExpanded ? '▼' : '▶'}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t px-6 py-4 bg-gray-50">
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Phone:</span>{' '}
                              <a href={`tel:${appointment.customer_phone}`} className="text-primary hover:underline font-semibold">
                                {appointment.customer_phone}
                              </a>
                            </div>
                            {appointment.customer_email && (
                              <div>
                                <span className="text-gray-600">Email:</span>{' '}
                                <a href={`mailto:${appointment.customer_email}`} className="text-primary hover:underline">
                                  {appointment.customer_email}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
                          <select
                            value={appointment.status}
                            onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {appointment.message && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Customer Notes</h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {appointment.message}
                          </p>
                        </div>
                      )}

                      {photoCount > 0 ? (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Customer Photos ({photoCount})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {appointmentPhotos[appointment.id]?.map((photo) => (
                              <div
                                key={photo.id}
                                className="relative group cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPhotoModalUrl(photo.photo_url)
                                }}
                              >
                                <img
                                  src={photo.photo_url}
                                  alt={photo.caption}
                                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-primary transition-colors"
                                />
                                <p className="text-xs text-gray-600 mt-1 truncate">{photo.caption}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                          <p className="text-gray-600">No photos uploaded yet</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
