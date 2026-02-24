'use client'

import { useState, useEffect } from 'react'

interface EditRepairOrderModalProps {
  repairOrder: any
  onClose: () => void
  onSave: () => void
}

export default function EditRepairOrderModal({ 
  repairOrder, 
  onClose, 
  onSave 
}: EditRepairOrderModalProps) {
  const [formData, setFormData] = useState({
    ro_number: repairOrder.ro_number || '',
    status: repairOrder.status || 'intake',
    priority: repairOrder.priority || 'medium',
    estimated_completion: repairOrder.estimated_completion?.split('T')[0] || '',
    damage_description: repairOrder.damage_description || '',
    estimate_amount: repairOrder.estimate_amount || ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/crm/repair-orders/${repairOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          edited_by: 'Staff' // You can get this from auth context
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update repair order')
      }

      onSave()
      onClose()
    } catch (err: any) {
      console.error('Error saving:', err)
      setError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Edit Repair Order</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={saving}
            >
              &times;
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* RO Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RO Number *
            </label>
            <input
              type="text"
              value={formData.ro_number}
              onChange={(e) => setFormData({ ...formData, ro_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={saving}
              placeholder="RO-00001"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can change the RO number to any unique identifier
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
            >
              <option value="intake">Intake</option>
              <option value="insurance">Insurance</option>
              <option value="estimate_approval">Estimate Approval</option>
              <option value="blueprinting">Blueprinting</option>
              <option value="parts_ordered">Parts Ordered</option>
              <option value="in_repair">In Repair</option>
              <option value="painting">Painting</option>
              <option value="quality_control">Quality Control</option>
              <option value="ready_pickup">Ready for Pickup</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Estimated Completion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Completion Date
            </label>
            <input
              type="date"
              value={formData.estimated_completion}
              onChange={(e) => setFormData({ ...formData, estimated_completion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
            />
          </div>

          {/* Damage Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Damage Description
            </label>
            <textarea
              value={formData.damage_description}
              onChange={(e) => setFormData({ ...formData, damage_description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y"
              rows={4}
              disabled={saving}
              placeholder="Describe the damage and repairs needed..."
            />
          </div>

          {/* Estimate Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimate Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.estimate_amount}
              onChange={(e) => setFormData({ ...formData, estimate_amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
              placeholder="0.00"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
