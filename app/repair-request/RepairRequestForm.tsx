'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { formatPhoneInput } from '@/lib/utils/phone'

interface FormData {
  name: string
  phone: string
  email: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
  damageDescription: string
  insuranceClaim: string
  preferredDate: string
  preferredTime: string
}

export default function RepairRequestForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    damageDescription: '',
    insuranceClaim: 'no',
    preferredDate: '',
    preferredTime: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [confirmationNumber, setConfirmationNumber] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhoneInput(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const generateConfirmationNumber = (): string => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `EXP-${timestamp}-${random}`
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          serviceType: 'express-care',
          appointmentDate: formData.preferredDate,
          appointmentTime: formData.preferredTime,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      const confNum = generateConfirmationNumber()
      setConfirmationNumber(confNum)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleReturnHome = () => {
    window.location.href = '/'
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8 border-l-8 border-red-600">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Express Care Request Confirmed!</h1>
            <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-red-800 mb-1">HIGH PRIORITY REQUEST</p>
              <p className="text-2xl font-bold text-red-600 tracking-wider">{confirmationNumber}</p>
            </div>
            <p className="text-gray-600">Your request has been submitted successfully</p>
          </div>

          {/* Express Care Explanation */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-2">What is Express Care?</h3>
                <p className="text-gray-700 leading-relaxed">
                  An <strong>Express Care Request</strong> identifies your vehicle repair job as a <strong className="text-red-700">High Priority</strong>. 
                  The intent is to repair your vehicle and have it ready to be picked up <strong className="text-red-700">as fast as possible</strong> without 
                  impacting the quality of the craftsmanship and parts. These repair jobs typically have a <strong className="text-red-700">24-hour turnaround</strong>, 
                  but like any other repair job, are dependent on the availability of quality parts.
                </p>
              </div>
            </div>
          </div>

          {/* Submitted Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Submitted Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-semibold">Name</p>
                <p className="text-gray-900">{formData.name}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Phone</p>
                <p className="text-gray-900">{formData.phone}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Email</p>
                <p className="text-gray-900">{formData.email}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Vehicle</p>
                <p className="text-gray-900">{formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-600 font-semibold">Damage Description</p>
                <p className="text-gray-900">{formData.damageDescription}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Insurance Claim</p>
                <p className="text-gray-900">{formData.insuranceClaim === 'yes' ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Preferred Date/Time</p>
                <p className="text-gray-900">{formData.preferredDate} at {formData.preferredTime}</p>
              </div>
            </div>
          </div>

          {/* Call to Confirm - Urgent Styling */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6 mb-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-3 animate-pulse">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">⚡ CALL NOW TO CONFIRM</h3>
                <p className="text-red-100 text-sm mb-3">Please call us immediately to confirm receipt and schedule your express repair</p>
                <a 
                  href="tel:+12164818696" 
                  className="inline-block bg-white text-red-600 font-bold px-6 py-3 rounded-lg hover:bg-red-50 transition-colors shadow-md"
                >
                  📞 (216) 481-8696
                </a>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-400 text-sm text-red-100">
              <p className="font-semibold mb-1">Business Hours:</p>
              <p>Monday - Friday: 8:00 AM - 4:30 PM</p>
              <p>Saturday: 9:00 AM - 1:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handlePrint}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Confirmation
            </button>
            <button
              onClick={handleReturnHome}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Header with Express Care Branding */}
        <div className="mb-6 pb-4 border-b-4 border-red-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              ⚡ High Priority
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Express Care Request</h1>
          </div>
          <p className="text-gray-600">Fast-track your repair with our 24-hour turnaround service</p>
        </div>

        {/* Express Care Info Banner */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-600 p-4 mb-6 rounded-r-lg">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-gray-700 leading-relaxed">
              <p className="font-semibold text-red-800 mb-1">What is Express Care?</p>
              <p>
                An <strong>Express Care Request</strong> identifies your vehicle repair job as a <strong className="text-red-700">High Priority</strong>. 
                The intent is to repair your vehicle and have it ready to be picked up <strong className="text-red-700">as fast as possible</strong> without 
                impacting the quality of the craftsmanship and parts. These repair jobs typically have a <strong className="text-red-700">24-hour turnaround</strong>, 
                but like any other repair job, are dependent on the availability of quality parts.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Two-column layout for desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="216-481-8696"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="johndoe@email.com"
              />
            </div>

            {/* Vehicle Year */}
            <div>
              <label htmlFor="vehicleYear" className="block text-sm font-semibold text-gray-700 mb-1">
                Vehicle Year *
              </label>
              <input
                type="text"
                id="vehicleYear"
                name="vehicleYear"
                value={formData.vehicleYear}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="2020"
              />
            </div>

            {/* Vehicle Make */}
            <div>
              <label htmlFor="vehicleMake" className="block text-sm font-semibold text-gray-700 mb-1">
                Vehicle Make *
              </label>
              <input
                type="text"
                id="vehicleMake"
                name="vehicleMake"
                value={formData.vehicleMake}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Honda"
              />
            </div>

            {/* Vehicle Model */}
            <div>
              <label htmlFor="vehicleModel" className="block text-sm font-semibold text-gray-700 mb-1">
                Vehicle Model *
              </label>
              <input
                type="text"
                id="vehicleModel"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Accord"
              />
            </div>

            {/* Preferred Date */}
            <div>
              <label htmlFor="preferredDate" className="block text-sm font-semibold text-gray-700 mb-1">
                Preferred Drop-off Date *
              </label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Preferred Time */}
            <div>
              <label htmlFor="preferredTime" className="block text-sm font-semibold text-gray-700 mb-1">
                Preferred Drop-off Time *
              </label>
              <select
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select time</option>
                <option value="8:00 AM">8:00 AM</option>
                <option value="9:00 AM">9:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="1:00 PM">1:00 PM</option>
                <option value="2:00 PM">2:00 PM</option>
                <option value="3:00 PM">3:00 PM</option>
                <option value="4:00 PM">4:00 PM</option>
              </select>
            </div>

            {/* Insurance Claim */}
            <div>
              <label htmlFor="insuranceClaim" className="block text-sm font-semibold text-gray-700 mb-1">
                Insurance Claim? *
              </label>
              <select
                id="insuranceClaim"
                name="insuranceClaim"
                value={formData.insuranceClaim}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>

          {/* Damage Description - Full Width */}
          <div>
            <label htmlFor="damageDescription" className="block text-sm font-semibold text-gray-700 mb-1">
              Damage Description *
            </label>
            <textarea
              id="damageDescription"
              name="damageDescription"
              value={formData.damageDescription}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Describe the damage to your vehicle..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              '⚡ Submit Express Care Request'
            )}
          </button>
        </form>

        {/* Contact Info Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>Questions? Call us at <a href="tel:+12164818696" className="text-red-600 font-semibold hover:underline">(216) 481-8696</a></p>
          <p className="mt-1">17017 Saint Clair Ave, Cleveland, OH 44110</p>
        </div>
      </div>
    </div>
  )
}
