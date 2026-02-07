'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatPhoneInput } from '../../lib/utils/phone'

export default function TowRequestForm() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    destination: '',
    vehicleInfo: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [confirmationNumber, setConfirmationNumber] = useState('')

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value)
    setFormData({ ...formData, phone: formatted })
  }

  const generateConfirmationNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `TOW-${timestamp}-${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          serviceType: 'tow-service',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit tow request')
      }

      const confNumber = generateConfirmationNumber()
      setConfirmationNumber(confNumber)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6 text-center">
          <div className="text-6xl mb-3">🚛✅</div>
          <h2 className="text-3xl font-bold text-green-800 mb-2">
            Tow Request Received!
          </h2>
          <div className="bg-white border-2 border-green-600 rounded-lg p-4 mt-4 inline-block">
            <p className="text-sm text-gray-600 mb-1">Confirmation Number</p>
            <p className="text-2xl font-bold text-primary">{confirmationNumber}</p>
          </div>
        </div>

        {/* URGENT Notice */}
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center">
            <span className="text-2xl mr-2">🚨</span>
            URGENT: Call Immediately to Dispatch Tow Truck
          </h3>
          <p className="text-gray-700 mb-4">
            To dispatch a tow truck and confirm your location, please call us NOW:
          </p>
          <a 
            href="tel:+12164818696"
            className="block text-center bg-red-700 text-white font-bold text-2xl py-4 rounded-lg hover:bg-red-800 transition-colors animate-pulse"
          >
            📞 CALL (216) 481-8696
          </a>
          <p className="text-sm text-gray-600 mt-3 text-center">
            Reference confirmation number: <span className="font-bold">{confirmationNumber}</span>
          </p>
        </div>

        {/* Submitted Information */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
            Your Tow Request Details
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold text-gray-900">{formData.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="font-semibold text-gray-900">{formData.phone}</p>
            </div>

            {formData.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{formData.email}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Vehicle Information</p>
              <p className="font-semibold text-gray-900">{formData.vehicleInfo}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Current Location</p>
              <p className="font-semibold text-gray-900">{formData.location}</p>
            </div>

            {formData.destination && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Tow Destination</p>
                <p className="font-semibold text-gray-900">{formData.destination}</p>
              </div>
            )}

            {formData.message && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Additional Information</p>
                <p className="font-semibold text-gray-900 whitespace-pre-wrap">{formData.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">24/7 Emergency Towing Available</h3>
          <p className="text-gray-700 mb-2">Call anytime for towing service</p>
          <div className="space-y-1 text-gray-700 text-sm">
            <p><span className="font-semibold">Office Hours:</span></p>
            <p>Monday - Friday: 8:00 AM - 4:30 PM</p>
            <p>Saturday: 9:00 AM - 1:00 PM</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="tel:+12164818696"
            className="flex-1 px-6 py-3 bg-red-700 text-white text-center rounded-lg font-semibold hover:bg-red-800 transition-colors"
          >
            📞 Call Now
          </a>
          <button
            onClick={() => window.print()}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            🖨️ Print Confirmation
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Request Tow Service</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="216-555-1234"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Vehicle Info *</label>
            <input
              type="text"
              value={formData.vehicleInfo}
              onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="2020 Honda Accord, Silver"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Current Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="123 Main St, Cleveland, OH"
            />
            <p className="text-xs text-gray-600 mt-1">Where is your vehicle?</p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Tow Destination</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Our shop"
            />
            <p className="text-xs text-gray-600 mt-1">Leave blank to tow to our shop</p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Additional Info</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Special instructions..."
            />
          </div>
        </div>

        {/* Full Width Submit */}
        <div className="md:col-span-2 space-y-3">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Requesting Tow...' : 'Request Tow Service'}
          </button>

          <div className="text-center text-sm text-gray-600">
            Need immediate help? Call{' '}
            <a href="tel:+12164818696" className="text-primary font-bold hover:underline">
              (216) 481-8696
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}

