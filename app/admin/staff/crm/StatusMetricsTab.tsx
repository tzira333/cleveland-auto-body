'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface StatusMetrics {
  id: string
  ro_number: string
  customer_name: string
  vehicle_info: string
  current_status: string
  absolute_end_date: string | null
  created_at: string
  
  // Time in each status (seconds)
  seconds_in_pending: number
  seconds_in_parts_ordered: number
  seconds_in_waiting_parts: number
  seconds_in_in_progress: number
  seconds_in_waiting_customer: number
  seconds_in_waiting_insurance: number
  seconds_in_quality_check: number
  seconds_in_completed: number
  seconds_in_ready_pickup: number
  seconds_in_delivered: number
  seconds_in_cancelled: number
  
  total_seconds: number
  current_status_duration_seconds: number
  countdown_days: number | null
  current_status_started_at: string
}

interface StatusDuration {
  status_name: string
  duration_seconds: number
  duration_formatted: string
  percentage: number
}

export default function StatusMetricsTab() {
  const [allMetrics, setAllMetrics] = useState<StatusMetrics[]>([])
  const [selectedRO, setSelectedRO] = useState<StatusMetrics | null>(null)
  const [detailedMetrics, setDetailedMetrics] = useState<StatusDuration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  useEffect(() => {
    fetchAllMetrics()
  }, [])

  const fetchAllMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/crm/status-metrics')
      const result = await response.json()
      setAllMetrics(result.data || [])
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDetailedMetrics = async (roId: string) => {
    try {
      const response = await fetch(`/api/crm/status-metrics?ro_id=${roId}`)
      const result = await response.json()
      setDetailedMetrics(result.durationReport || [])
    } catch (error) {
      console.error('Error fetching detailed metrics:', error)
    }
  }

  const handleRowClick = (ro: StatusMetrics) => {
    setSelectedRO(ro)
    fetchDetailedMetrics(ro.id)
  }

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Pending': 'bg-gray-100 text-gray-800',
      'Parts Ordered': 'bg-blue-100 text-blue-800',
      'Waiting for Parts': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-indigo-100 text-indigo-800',
      'Waiting for Customer': 'bg-orange-100 text-orange-800',
      'Waiting for Insurance': 'bg-purple-100 text-purple-800',
      'Quality Check': 'bg-cyan-100 text-cyan-800',
      'Completed': 'bg-green-100 text-green-800',
      'Ready for Pickup': 'bg-teal-100 text-teal-800',
      'Delivered': 'bg-emerald-100 text-emerald-800',
      'Cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredMetrics = allMetrics.filter(ro => {
    const matchesSearch = 
      ro.ro_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ro.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ro.vehicle_info && ro.vehicle_info.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || ro.current_status === filterStatus

    return matchesSearch && matchesStatus
  })

  const statusOptions = [
    'all',
    'Pending',
    'Parts Ordered',
    'Waiting for Parts',
    'In Progress',
    'Waiting for Customer',
    'Waiting for Insurance',
    'Quality Check',
    'Completed',
    'Ready for Pickup',
    'Delivered'
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Status Metrics & Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track how long repair orders spend in each status
          </p>
        </div>
        <button
          onClick={fetchAllMetrics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by RO#, customer, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: List of ROs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Repair Orders ({filteredMetrics.length})
            </h3>
          </div>
          <div className="overflow-auto max-h-[600px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RO#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time in Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredMetrics.map(ro => (
                  <tr
                    key={ro.id}
                    onClick={() => handleRowClick(ro)}
                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedRO?.id === ro.id ? 'bg-blue-100' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{ro.ro_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{ro.customer_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ro.current_status)}`}>
                        {ro.current_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDuration(ro.current_status_duration_seconds)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatDuration(ro.total_seconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Detailed metrics for selected RO */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {selectedRO ? (
            <>
              <div className="px-6 py-4 border-b border-gray-200 bg-blue-600 text-white">
                <h3 className="text-lg font-semibold">
                  {selectedRO.ro_number} - {selectedRO.customer_name}
                </h3>
                <p className="text-sm mt-1 text-blue-100">{selectedRO.vehicle_info}</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Current Status Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Current Status</span>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedRO.current_status)}`}>
                      {selectedRO.current_status}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatDuration(selectedRO.current_status_duration_seconds)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Since {new Date(selectedRO.current_status_started_at).toLocaleString()}
                  </div>
                </div>

                {/* Status Duration Breakdown */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Time in Each Status</h4>
                  <div className="space-y-2">
                    {detailedMetrics.length > 0 ? (
                      detailedMetrics.map((metric, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(metric.status_name)}`}>
                              {metric.status_name}
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${metric.percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-sm font-bold text-gray-900">{metric.duration_formatted}</div>
                            <div className="text-xs text-gray-500">{metric.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic text-center py-4">
                        No status history available yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Time */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Total Time Active</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatDuration(selectedRO.total_seconds)}
                    </span>
                  </div>
                </div>

                {/* Countdown */}
                {selectedRO.countdown_days !== null && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Days Until Deadline</span>
                      <span className={`text-xl font-bold ${
                        selectedRO.countdown_days < 0 ? 'text-red-600' :
                        selectedRO.countdown_days <= 3 ? 'text-orange-600' :
                        selectedRO.countdown_days <= 7 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {selectedRO.countdown_days < 0 ? 
                          `${Math.abs(selectedRO.countdown_days)} days OVERDUE` : 
                          `${selectedRO.countdown_days} days`
                        }
                      </span>
                    </div>
                    {selectedRO.absolute_end_date && (
                      <div className="text-xs text-gray-500 text-right mt-1">
                        Due: {new Date(selectedRO.absolute_end_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm font-medium">Select a repair order to view detailed metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
