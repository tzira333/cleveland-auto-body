'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { normalizePhone, formatPhoneInput } from '@/lib/utils/phone'

export default function TowRequestForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    destination: '',
    vehicleInfo: '',
    date: '',
    time: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, serviceType: 'tow-service' })
      })

      const data = await response.json()


      
// In the component:
const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const formatted = formatPhoneInput(e.target.value)
  setFormData({ ...formData, phone: formatted })
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    // Send normalized phone to API
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        phone: normalizePhone(formData.phone), // Normalize before sending
      }),
    })
    
    // ... rest of submit logic
  } catch (error) {
    // ... error handling
  }
}






      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit tow request')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 pb-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Request Tow Service
          </h1>
          <p className="text-gray-600 mb-8">
            Need a tow? Fill out this form and we'll dispatch help right away.
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                Tow Request Received!
              </h2>
              <p className="text-green-700 mb-4">
                We've received your tow request. Our team will contact you shortly to coordinate pickup.
              </p>
              <p className="text-sm text-green-600">
                Redirecting to homepage...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    const input = e.target.value
                    const digits = input.replace(/\D/g, '')
                    const limited = digits.slice(0, 10)
                    let formatted = ''
                    if (limited.length <= 3) {
                      formatted = limited
                    } else if (limited.length <= 6) {
                      formatted = `${limited.slice(0, 3)}-${limited.slice(3)}`
                    } else {
                      formatted = `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`
                    }
                    setFormData({ ...formData, phone: formatted })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="216-555-1234"
                  maxLength={12}
                />
                <p className="text-xs text-gray-500 mt-1">Format: xxx-xxx-xxxx</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase().trim() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location (Pickup) *
                </label>
                <input
                  type="text"
                  name="location"
                  autoComplete="street-address"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="123 Main St, Cleveland, OH"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination (Optional)
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Leave blank to tow to our shop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Information *
                </label>
                <input
                  type="text"
                  name="vehicle"
                  required
                  value={formData.vehicleInfo}
                  onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., 2020 Honda Accord, Silver"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe the situation, vehicle condition, access notes, etc."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Emergency?</strong> For immediate assistance, please call us directly at{' '}
                  <a href="tel:+12164818696" className="font-bold underline">
                    (216) 481-8696
                  </a>
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 text-lg font-semibold rounded-lg
                             bg-primary text-white hover:bg-primary-dark
                             disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50
                             shadow-lg transition-all duration-200"
                >
                  {loading ? 'Submitting...' : 'Request Tow Service'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
