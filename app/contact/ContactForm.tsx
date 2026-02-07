'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatPhoneInput } from '../../lib/utils/phone'

export default function ContactForm() {
  const router = useRouter()
  const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+12164818696'

  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return phone
  }

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
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
    return `MSG-${timestamp}-${random}`
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
          serviceType: 'contact-inquiry',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
          }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message')
      }

      const confNumber = generateConfirmationNumber()
      setConfirmationNumber(confNumber)
      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6 text-center">
          <div className="text-6xl mb-3">✉️✅</div>
          <h2 className="text-3xl font-bold text-green-800 mb-2">
            Message Received!
          </h2>
          <div className="bg-white border-2 border-green-600 rounded-lg p-4 mt-4 inline-block">
            <p className="text-sm text-gray-600 mb-1">Confirmation Number</p>
            <p className="text-2xl font-bold text-primary">{confirmationNumber}</p>
          </div>
        </div>

        {/* Call to Confirm */}
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
            <span className="text-2xl mr-2">📞</span>
            Please Call to Confirm Receipt
          </h3>
          <p className="text-gray-700 mb-4">
            To ensure we received your message and to get an immediate response, please call us:
          </p>
          <a 
            href="tel:+12164818696"
            className="block text-center bg-blue-700 text-white font-bold text-2xl py-4 rounded-lg hover:bg-blue-800 transition-colors"
          >
            (216) 481-8696
          </a>
          <p className="text-sm text-gray-600 mt-3 text-center">
            Reference confirmation number: <span className="font-bold">{confirmationNumber}</span>
          </p>
        </div>

        {/* Submitted Information */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
            Your Message Details
          </h3>
          
          <div className="space-y-4">
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
                <p className="text-sm text-gray-600">Subject</p>
                <p className="font-semibold text-gray-900">{formData.subject}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Message</p>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <p className="text-gray-900 whitespace-pre-wrap">{formData.message}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">We'll Respond Within 24 Hours</h3>
          <p className="text-gray-700 mb-3">Our typical response time is within a few hours during business hours.</p>
          <div className="space-y-1 text-gray-700">
            <p><span className="font-semibold">Monday - Friday:</span> 8:00 AM - 4:30 PM</p>
            <p><span className="font-semibold">Saturday:</span> 9:00 AM - 1:00 PM</p>
            <p><span className="font-semibold">Sunday:</span> Closed</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="tel:+12164818696"
            className="flex-1 px-6 py-3 bg-blue-700 text-white text-center rounded-lg font-semibold hover:bg-blue-800 transition-colors"
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
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Contact Us</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Information - Left */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Get In Touch</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Phone</p>
                <a href={`tel:${businessPhone}`} className="text-primary hover:underline">
                  {formatPhoneDisplay(businessPhone)}
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="text-xl">✉️</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Email</p>
                <a href="mailto:domesticandforeignab@gmail.com" className="text-primary hover:underline text-sm">
                  domesticandforeignab@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="text-xl">📍</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Address</p>
                <p className="text-gray-700 text-sm">17017 Saint Clair Ave<br />Cleveland, OH 44110</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="text-xl">⏰</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Hours</p>
                <p className="text-gray-700 text-sm">Mon-Fri: 8:00 AM - 4:30 PM</p>
                <p className="text-gray-700 text-sm">Sat: 9:00 AM - 1:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form - Right */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Your name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Tell us more..."
              />
            </div>

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
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
