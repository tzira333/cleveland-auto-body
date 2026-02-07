'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface Appointment {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  service_type: string
  vehicle_info: string
  damage_description: string
  appointment_date: string
  appointment_time: string
  status: string
  created_at: string
  updated_at: string
}

export default function StaffDashboard() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Create Supabase client (SINGLE DEFINITION)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setAppointments(data || [])
    } catch (err) {
      console.error('Error fetching appointments:', err)
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/staff/login')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  const updateAppointmentStatus = async (id: string, newStatus: string) => {
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Refresh appointments
      fetchAppointments()
      setSelectedAppointment(null)
    } catch (err) {
      console.error('Error updating appointment:', err)
      alert('Failed to update appointment status')
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const query = searchQuery.toLowerCase()
    return (
      apt.customer_name.toLowerCase().includes(query) ||
      apt.customer_phone.includes(query) ||
      apt.customer_email.toLowerCase().includes(query) ||
      apt.vehicle_info.toLowerCase().includes(query) ||
      apt.status.toLowerCase().includes(query)
    )
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cleveland Auto Body - Staff Portal
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Appointment Management Dashboard
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search appointments by name, phone, email, vehicle, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Appointments</div>
            <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(a => a.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Confirmed</div>
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(a => a.status === 'confirmed').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="text-2xl font-bold text-purple-600">
              {appointments.filter(a => a.status === 'in-progress').length}
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Appointments ({filteredAppointments.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading appointments...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              {error}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No appointments found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date/Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.customer_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {formatDate(appointment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{appointment.customer_phone}</div>
                        <div className="text-xs text-gray-500">{appointment.customer_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{appointment.vehicle_info}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 capitalize">
                          {appointment.service_type.replace(/-/g, ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(appointment.appointment_date)}</div>
                        <div className="text-xs text-gray-500">{formatTime(appointment.appointment_time)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedAppointment(appointment)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Appointment Details
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {formatDate(selectedAppointment.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedAppointment.customer_name}</p>
                  <p><span className="font-medium">Phone:</span> {selectedAppointment.customer_phone}</p>
                  <p><span className="font-medium">Email:</span> {selectedAppointment.customer_email}</p>
                </div>
              </div>

              {/* Vehicle Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Vehicle Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>{selectedAppointment.vehicle_info}</p>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Service Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Service Type:</span> {selectedAppointment.service_type.replace(/-/g, ' ')}</p>
                  <p><span className="font-medium">Preferred Date:</span> {formatDate(selectedAppointment.appointment_date)}</p>
                  <p><span className="font-medium">Preferred Time:</span> {formatTime(selectedAppointment.appointment_time)}</p>
                </div>
              </div>

              {/* Damage Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Damage Description</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>{selectedAppointment.damage_description || 'No description provided'}</p>
                </div>
              </div>

              {/* Current Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full border ${getStatusBadgeColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>

              {/* Update Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, status)}
                      disabled={selectedAppointment.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedAppointment.status === status
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}