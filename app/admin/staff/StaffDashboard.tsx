'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import ConvertToROButton from './appointments/ConvertToROButton'

interface AppointmentFile {
  id: string
  appointment_id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  public_url: string
  created_at: string
}

interface AppointmentNote {
  id: string
  appointment_id: string
  note_text: string
  staff_name: string
  created_at: string
  updated_at: string
}

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
  archived?: boolean
  archived_at?: string
  files?: AppointmentFile[]
  notes?: AppointmentNote[]
}

export default function StaffDashboard() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [archivedAppointments, setArchivedAppointments] = useState<Appointment[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appointmentNotes, setAppointmentNotes] = useState<AppointmentNote[]>([])
  const [newNoteText, setNewNoteText] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteText, setEditingNoteText] = useState('')
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [savingNote, setSavingNote] = useState(false)

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

      // Fetch active (non-archived) appointments
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .or('archived.is.null,archived.eq.false')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Fetch archived appointments
      const { data: archivedData, error: archivedError } = await supabase
        .from('appointments')
        .select('*')
        .eq('archived', true)
        .order('archived_at', { ascending: false })

      if (archivedError) throw archivedError

      // Fetch files for each appointment
      const appointmentsWithFiles = await Promise.all(
        (data || []).map(async (appointment) => {
          try {
            const { data: files, error: filesError } = await supabase
              .from('appointment_files')
              .select('*')
              .eq('appointment_id', appointment.id)
              .order('created_at', { ascending: false })

            if (filesError) {
              console.warn(`Failed to fetch files for appointment ${appointment.id}:`, filesError)
              return { ...appointment, files: [] }
            }

            return { ...appointment, files: files || [] }
          } catch (err) {
            console.warn(`Error fetching files for appointment ${appointment.id}:`, err)
            return { ...appointment, files: [] }
          }
        })
      )

      // Fetch files for archived appointments
      const archivedWithFiles = await Promise.all(
        (archivedData || []).map(async (appointment) => {
          try {
            const { data: files, error: filesError } = await supabase
              .from('appointment_files')
              .select('*')
              .eq('appointment_id', appointment.id)
              .order('created_at', { ascending: false })

            if (filesError) {
              return { ...appointment, files: [] }
            }

            return { ...appointment, files: files || [] }
          } catch (err) {
            return { ...appointment, files: [] }
          }
        })
      )

      setAppointments(appointmentsWithFiles)
      setArchivedAppointments(archivedWithFiles)
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

  // Fetch notes for an appointment
  const fetchAppointmentNotes = async (appointmentId: string) => {
    try {
      setLoadingNotes(true)
      const response = await fetch(`/api/appointments/notes?appointment_id=${appointmentId}`)
      const data = await response.json()
      
      if (response.ok) {
        setAppointmentNotes(data.notes || [])
      } else {
        console.error('Error fetching notes:', data.error)
        setAppointmentNotes([])
      }
    } catch (err) {
      console.error('Error fetching appointment notes:', err)
      setAppointmentNotes([])
    } finally {
      setLoadingNotes(false)
    }
  }

  // Add a new note
  const addAppointmentNote = async () => {
    if (!selectedAppointment || !newNoteText.trim()) return

    try {
      setSavingNote(true)
      const response = await fetch('/api/appointments/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: selectedAppointment.id,
          note_text: newNoteText.trim(),
          staff_name: 'Staff' // You can get this from auth context
        })
      })

      const data = await response.json()

      if (response.ok) {
        setAppointmentNotes([data.note, ...appointmentNotes])
        setNewNoteText('')
      } else {
        alert('Failed to add note: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error adding note:', err)
      alert('Failed to add note')
    } finally {
      setSavingNote(false)
    }
  }

  // Update an existing note
  const updateAppointmentNote = async (noteId: string, noteText: string) => {
    try {
      setSavingNote(true)
      const response = await fetch('/api/appointments/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_id: noteId,
          note_text: noteText.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        setAppointmentNotes(
          appointmentNotes.map(note => 
            note.id === noteId ? data.note : note
          )
        )
        setEditingNoteId(null)
        setEditingNoteText('')
      } else {
        alert('Failed to update note: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error updating note:', err)
      alert('Failed to update note')
    } finally {
      setSavingNote(false)
    }
  }

  // Delete a note
  const deleteAppointmentNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/appointments/notes?note_id=${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAppointmentNotes(appointmentNotes.filter(note => note.id !== noteId))
      } else {
        const data = await response.json()
        alert('Failed to delete note: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error deleting note:', err)
      alert('Failed to delete note')
    }
  }

  const archiveAppointment = async (appointmentId: string) => {
    if (!confirm('Archive this appointment? It will be moved to the archived section.')) return

    try {
      const response = await fetch('/api/appointments/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to archive appointment')
        return
      }

      alert('Appointment archived successfully')
      fetchAppointments()
      setSelectedAppointment(null)
    } catch (error) {
      console.error('Error archiving appointment:', error)
      alert('Failed to archive appointment')
    }
  }

  const unarchiveAppointment = async (appointmentId: string) => {
    if (!confirm('Restore this appointment from archive?')) return

    try {
      const response = await fetch('/api/appointments/archive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to restore appointment')
        return
      }

      alert('Appointment restored successfully')
      fetchAppointments()
      setSelectedAppointment(null)
    } catch (error) {
      console.error('Error restoring appointment:', error)
      alert('Failed to restore appointment')
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

  const deleteAppointment = async (id: string) => {
    // Confirm deletion
    const confirmed = window.confirm(
      'Are you sure you want to delete this appointment? This action cannot be undone.'
    )

    if (!confirmed) return

    try {
      // Delete associated files first (cascade should handle this, but explicit is safer)
      const { error: filesError } = await supabase
        .from('appointment_files')
        .delete()
        .eq('appointment_id', id)

      if (filesError) {
        console.warn('Error deleting appointment files:', filesError)
      }

      // Delete the appointment
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Show success message
      alert('Appointment deleted successfully')

      // Refresh appointments list
      fetchAppointments()
      setSelectedAppointment(null)
    } catch (err) {
      console.error('Error deleting appointment:', err)
      alert('Failed to delete appointment. Please try again.')
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
    // If it's a full ISO timestamp, extract time
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
    // Otherwise return as-is (for appointment times like "09:00:00")
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Archived</div>
            <div className="text-2xl font-bold text-gray-600">
              {archivedAppointments.length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setShowArchived(false)}
              className={`${
                !showArchived
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Active Appointments ({appointments.length})
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`${
                showArchived
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Archived Appointments ({archivedAppointments.length})
            </button>
          </nav>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {showArchived ? 'Archived Appointments' : 'Active Appointments'} ({showArchived ? archivedAppointments.length : filteredAppointments.length})
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
          ) : showArchived ? (
            archivedAppointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No archived appointments found
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
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Archived Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {archivedAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.customer_name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{appointment.customer_phone}</div>
                          <div className="text-xs text-gray-500">{appointment.customer_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{appointment.service_type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.archived_at ? formatDate(appointment.archived_at) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              fetchAppointmentNotes(appointment.id)
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => unarchiveAppointment(appointment.id)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              fetchAppointmentNotes(appointment.id)
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View Details
                          </button>
                          {appointment.status === 'completed' && (
                            <ConvertToROButton 
                              appointmentId={appointment.id}
                              appointmentStatus={appointment.status}
                              onSuccess={fetchAppointments}
                            />
                          )}
                          <button
                            onClick={() => archiveAppointment(appointment.id)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors"
                            title="Archive appointment"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteAppointment(appointment.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete appointment"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
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

              {/* Uploaded Files */}
              {selectedAppointment.files && selectedAppointment.files.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Files ({selectedAppointment.files.length})
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedAppointment.files.map((file) => (
                        <a
                          key={file.id}
                          href={file.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all overflow-hidden"
                        >
                          {file.file_type.startsWith('image/') ? (
                            <div className="aspect-square">
                              <img
                                src={file.public_url}
                                alt={file.file_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square flex items-center justify-center bg-gray-100">
                              <div className="text-center p-2">
                                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <p className="text-xs text-gray-600 font-medium">PDF</p>
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs font-medium truncate">
                              {file.file_name}
                            </p>
                            <p className="text-white/80 text-xs">
                              {(file.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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

              {/* Progress Notes & Updates */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Progress Notes & Updates
                </h4>

                {/* Add New Note */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add New Note
                  </label>
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter progress update, notes, or additional information..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y"
                    disabled={savingNote}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={addAppointmentNote}
                      disabled={!newNoteText.trim() || savingNote}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {savingNote ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Note
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700">
                    History ({appointmentNotes.length})
                  </h5>
                  
                  {loadingNotes ? (
                    <div className="text-center py-8">
                      <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-sm text-gray-500 mt-2">Loading notes...</p>
                    </div>
                  ) : appointmentNotes.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">No notes yet. Add the first progress update above.</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {appointmentNotes.map((note) => (
                        <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium text-gray-900">{note.staff_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {editingNoteId !== note.id && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingNoteId(note.id)
                                      setEditingNoteText(note.note_text)
                                    }}
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Edit note"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => deleteAppointmentNote(note.id)}
                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete note"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {editingNoteId === note.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-y text-sm"
                                disabled={savingNote}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingNoteId(null)
                                    setEditingNoteText('')
                                  }}
                                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                  disabled={savingNote}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => updateAppointmentNote(note.id, editingNoteText)}
                                  disabled={!editingNoteText.trim() || savingNote}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                                >
                                  {savingNote ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note_text}</p>
                          )}
                          
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDate(note.created_at)} at {formatTime(note.created_at)}
                            </span>
                            {note.updated_at !== note.created_at && (
                              <span className="italic">(edited)</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {selectedAppointment.status === 'completed' && (
                  <ConvertToROButton 
                    appointmentId={selectedAppointment.id}
                    appointmentStatus={selectedAppointment.status}
                    onSuccess={() => {
                      fetchAppointments()
                      setSelectedAppointment(null)
                    }}
                  />
                )}
                <button
                  onClick={() => deleteAppointment(selectedAppointment.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  title="Delete appointment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
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