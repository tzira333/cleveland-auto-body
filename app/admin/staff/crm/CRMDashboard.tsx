'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import CreateRepairOrderForm from './CreateRepairOrderForm'
import EditRepairOrderModal from './EditRepairOrderModal'

type ViewType = 'dashboard' | 'repair-orders' | 'archived-ros' | 'customers' | 'parts' | 'reports'

interface RepairOrder {
  id: string
  ro_number: string
  status: string
  priority: string
  date_received: string
  estimated_completion: string
  customer_id: string
  vehicle_id: string
  damage_description: string
  archived: boolean
  archived_at?: string
  customer_first_name?: string
  customer_last_name?: string
  vehicle_year?: string
  vehicle_make?: string
  vehicle_model?: string
}

export default function CRMDashboard() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([])
  const [archivedROs, setArchivedROs] = useState<RepairOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateROForm, setShowCreateROForm] = useState(false)
  const [selectedRO, setSelectedRO] = useState<RepairOrder | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load active (non-archived) repair orders
      const { data, error } = await supabase
        .from('crm_repair_orders')
        .select('*')
        .or('archived.is.null,archived.eq.false')
        .order('date_received', { ascending: false })

      if (error) throw error
      setRepairOrders(data || [])

      // Load archived repair orders
      const { data: archivedData, error: archivedError } = await supabase
        .from('crm_repair_orders')
        .select('*')
        .eq('archived', true)
        .order('archived_at', { ascending: false })

      if (archivedError) throw archivedError
      setArchivedROs(archivedData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/staff/login')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      intake: 'bg-blue-100 text-blue-800',
      insurance: 'bg-purple-100 text-purple-800',
      estimate_approval: 'bg-orange-100 text-orange-800',
      blueprinting: 'bg-teal-100 text-teal-800',
      parts_ordered: 'bg-yellow-100 text-yellow-800',
      in_repair: 'bg-indigo-100 text-indigo-800',
      painting: 'bg-pink-100 text-pink-800',
      quality_control: 'bg-red-100 text-red-800',
      ready_pickup: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    }
    return colors[priority] || 'text-gray-600'
  }

  const archiveRepairOrder = async (roId: string) => {
    if (!confirm('Archive this repair order? It will be moved to the archived section.')) return

    try {
      const response = await fetch('/api/crm/repair-orders/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ro_id: roId })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to archive repair order')
        return
      }

      alert('Repair order archived successfully')
      loadData()
    } catch (error) {
      console.error('Error archiving RO:', error)
      alert('Failed to archive repair order')
    }
  }

  const unarchiveRepairOrder = async (roId: string) => {
    if (!confirm('Restore this repair order from archive?')) return

    try {
      const response = await fetch('/api/crm/repair-orders/archive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ro_id: roId })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to restore repair order')
        return
      }

      alert('Repair order restored successfully')
      loadData()
    } catch (error) {
      console.error('Error restoring RO:', error)
      alert('Failed to restore repair order')
    }
  }

  const handleEditRO = (ro: RepairOrder) => {
    setSelectedRO(ro)
    setShowEditModal(true)
  }

  const handleEditSave = () => {
    setShowEditModal(false)
    setSelectedRO(null)
    loadData()
  }

  const statusCounts = {
    active: repairOrders.filter(ro => ro.status !== 'completed').length,
    overdue: repairOrders.filter(ro => ro.estimated_completion && new Date(ro.estimated_completion) < new Date() && ro.status !== 'completed').length,
    ready: repairOrders.filter(ro => ro.status === 'ready_pickup').length,
    archived: archivedROs.length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/staff')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Portal"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  BodyShop Workflow - Repair Management
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete repair tracking system
                </p>
              </div>
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

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard' as ViewType, label: 'Dashboard', icon: '📊' },
              { id: 'repair-orders' as ViewType, label: 'Repair Orders', icon: '📋' },
              { id: 'archived-ros' as ViewType, label: 'Archived ROs', icon: '📦' },
              { id: 'customers' as ViewType, label: 'Customers', icon: '👥' },
              { id: 'parts' as ViewType, label: 'Parts', icon: '🔧' },
              { id: 'reports' as ViewType, label: 'Reports', icon: '📈' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  currentView === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Repairs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{statusCounts.active}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{statusCounts.overdue}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ready for Pickup</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{statusCounts.ready}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{repairOrders.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Archived</p>
                    <p className="text-3xl font-bold text-gray-600 mt-2">{statusCounts.archived}</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Repair Orders */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Recent Repair Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RO#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Received</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Completion</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : repairOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          No repair orders yet. Create your first repair order to get started.
                        </td>
                      </tr>
                    ) : (
                      repairOrders.slice(0, 10).map((ro) => (
                        <tr key={ro.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {ro.ro_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ro.customer_first_name && ro.customer_last_name 
                              ? `${ro.customer_first_name} ${ro.customer_last_name}`
                              : ro.customer_id.substring(0, 8) + '...'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ro.vehicle_year && ro.vehicle_make && ro.vehicle_model
                              ? `${ro.vehicle_year} ${ro.vehicle_make} ${ro.vehicle_model}`
                              : ro.vehicle_id.substring(0, 8) + '...'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ro.status)}`}>
                              {ro.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getPriorityColor(ro.priority)}`}>
                              {ro.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(ro.date_received).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ro.estimated_completion
                              ? new Date(ro.estimated_completion).toLocaleDateString()
                              : 'Not set'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleEditRO(ro)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                              title="View/Edit"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === 'repair-orders' && (
          <div>
            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Repair Orders</h2>
              <button
                onClick={() => setShowCreateROForm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Repair Order
              </button>
            </div>

            {/* Create RO Form Modal */}
            {showCreateROForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="my-8">
                  <CreateRepairOrderForm
                    onSuccess={(ro) => {
                      setShowCreateROForm(false)
                      loadData() // Reload repair orders
                    }}
                    onCancel={() => setShowCreateROForm(false)}
                  />
                </div>
              </div>
            )}

            {/* Repair Orders List */}
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RO#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : repairOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No repair orders yet. Click "Create New Repair Order" to get started.
                        </td>
                      </tr>
                    ) : (
                      repairOrders.map((ro) => (
                        <tr key={ro.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {ro.ro_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ro.customer_first_name && ro.customer_last_name 
                              ? `${ro.customer_first_name} ${ro.customer_last_name}`
                              : ro.customer_id.substring(0, 8) + '...'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ro.vehicle_year && ro.vehicle_make && ro.vehicle_model
                              ? `${ro.vehicle_year} ${ro.vehicle_make} ${ro.vehicle_model}`
                              : ro.vehicle_id.substring(0, 8) + '...'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ro.status)}`}>
                              {ro.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getPriorityColor(ro.priority)}`}>
                              {ro.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(ro.date_received).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleEditRO(ro)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View/Edit"
                            >
                              <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => archiveRepairOrder(ro.id)}
                              className="text-gray-600 hover:text-gray-800"
                              title="Archive"
                            >
                              <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === 'archived-ros' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Archived Repair Orders</h2>
              <div className="text-sm text-gray-600">
                {archivedROs.length} archived order{archivedROs.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RO#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archived Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : archivedROs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No archived repair orders.
                        </td>
                      </tr>
                    ) : (
                      archivedROs.map((ro) => (
                        <tr key={ro.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                            {ro.ro_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ro.customer_first_name && ro.customer_last_name 
                              ? `${ro.customer_first_name} ${ro.customer_last_name}`
                              : ro.customer_id.substring(0, 8) + '...'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ro.vehicle_year && ro.vehicle_make && ro.vehicle_model
                              ? `${ro.vehicle_year} ${ro.vehicle_make} ${ro.vehicle_model}`
                              : ro.vehicle_id.substring(0, 8) + '...'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ro.status)}`}>
                              {ro.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ro.archived_at
                              ? new Date(ro.archived_at).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleEditRO(ro)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => unarchiveRepairOrder(ro.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Restore from Archive"
                            >
                              <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView !== 'dashboard' && currentView !== 'repair-orders' && currentView !== 'archived-ros' && (
          <div className="bg-white rounded-lg shadow p-12">
            <div className="text-center text-gray-500">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentView.charAt(0).toUpperCase() + currentView.slice(1).replace(/-/g, ' ')} View
              </h3>
              <p className="text-gray-600 mb-4">
                This section is ready for implementation. The full workflow features will be built out based on your specific needs.
              </p>
              <p className="text-sm text-gray-500">
                Available features: Customer Management, Vehicle Tracking, Parts Inventory, Time Tracking, Documents, and Reports
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Edit RO Modal */}
      {showEditModal && selectedRO && (
        <EditRepairOrderModal
          repairOrder={selectedRO}
          onClose={() => {
            setShowEditModal(false)
            setSelectedRO(null)
          }}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
