'use client'

import { useState, FormEvent, ChangeEvent, useRef, useEffect } from 'react'
import { normalizePhone, formatPhoneDisplay } from '@/lib/utils/phone'
import Link from 'next/link'

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

interface Appointment {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  service_type: string
  appointment_date: string
  appointment_time: string
  status: string
  vehicle_year?: string
  vehicle_make?: string
  vehicle_model?: string
  damage_description?: string
  created_at: string
  files?: AppointmentFile[]
}

interface UploadedFile {
  file: File
  preview?: string
  appointmentId?: string
}

export default function CustomerPortal() {
  const [phone, setPhone] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({})
  const [uploadError, setUploadError] = useState<Record<string, string>>({})
  const resultsRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to results when appointments are loaded
  useEffect(() => {
    if (searched && appointments.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [appointments, searched])

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '')
    
    // Limit to 10 digits
    const limitedDigits = digitsOnly.slice(0, 10)
    
    // Format as user types: XXX-XXX-XXXX
    let formatted = limitedDigits
    if (limitedDigits.length > 6) {
      formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6, 10)}`
    } else if (limitedDigits.length > 3) {
      formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`
    }
    
    setPhone(formatted)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSearched(true)

    // Normalize phone number to digits only
    const normalizedPhone = normalizePhone(phone)

    // Validate phone number is exactly 10 digits
    if (normalizedPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      setLoading(false)
      return
    }

    try {
      // Use API endpoint instead of direct Supabase query to bypass RLS
      const response = await fetch(`/api/appointments?phone=${encodeURIComponent(normalizedPhone)}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }

      const result = await response.json()
      setAppointments(result.appointments || [])
    } catch (err: any) {
      setError('Failed to retrieve appointments. Please try again.')
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (appointmentId: string, e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadError(prev => ({ ...prev, [appointmentId]: '' }))

    const maxSize = 10 * 1024 * 1024 // 10MB per file
    const maxFiles = 10
    // Comprehensive list of safe image and document types
    const allowedTypes = [
      // Standard image formats
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',
      'image/svg+xml',
      // HEIC/HEIF (iOS images)
      'image/heic',
      'image/heif',
      // Documents
      'application/pdf',
    ]

    const currentFiles = uploadedFiles[appointmentId] || []
    const newFiles: UploadedFile[] = []

    if (currentFiles.length + files.length > maxFiles) {
      setUploadError(prev => ({ 
        ...prev, 
        [appointmentId]: `Maximum ${maxFiles} files allowed` 
      }))
      return
    }

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        setUploadError(prev => ({ 
          ...prev, 
          [appointmentId]: `File ${file.name} exceeds 10MB limit` 
        }))
        return
      }

      // Check file type by MIME type or file extension (for mobile compatibility)
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'heic', 'heif', 'svg', 'pdf']
      const isValidType = allowedTypes.includes(file.type) || 
                          (fileExtension && validExtensions.includes(fileExtension)) ||
                          file.type === '' // Some mobile browsers don't set MIME type

      if (!isValidType) {
        setUploadError(prev => ({ 
          ...prev, 
          [appointmentId]: `File ${file.name} type not supported. Accepted: images (JPG, PNG, etc.) and PDF` 
        }))
        return
      }

      // Create preview for images
      let preview: string | undefined
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file)
      }

      newFiles.push({ file, preview, appointmentId })
    })

    setUploadedFiles(prev => ({
      ...prev,
      [appointmentId]: [...currentFiles, ...newFiles]
    }))

    // Reset input
    e.target.value = ''
  }

  const removeFile = (appointmentId: string, index: number) => {
    setUploadedFiles(prev => {
      const files = prev[appointmentId] || []
      // Revoke preview URL if it exists
      if (files[index]?.preview) {
        URL.revokeObjectURL(files[index].preview!)
      }
      return {
        ...prev,
        [appointmentId]: files.filter((_, i) => i !== index)
      }
    })
    setUploadError(prev => ({ ...prev, [appointmentId]: '' }))
  }

  const uploadFiles = async (appointmentId: string) => {
    const files = uploadedFiles[appointmentId]
    if (!files || files.length === 0) return

    setUploadingFiles(prev => ({ ...prev, [appointmentId]: true }))
    setUploadError(prev => ({ ...prev, [appointmentId]: '' }))

    try {
      const formData = new FormData()
      formData.append('appointment_id', appointmentId)
      files.forEach((uploadedFile, index) => {
        formData.append(`file_${index}`, uploadedFile.file)
      })
      formData.append('file_count', files.length.toString())

      const response = await fetch('/api/appointments/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      // Clear uploaded files for this appointment
      setUploadedFiles(prev => ({ ...prev, [appointmentId]: [] }))
      
      // Show success message
      alert(`Successfully uploaded ${files.length} file(s)!`)
    } catch (err: any) {
      console.error('Upload error:', err)
      setUploadError(prev => ({ 
        ...prev, 
        [appointmentId]: err.message || 'Failed to upload files. Please try again.' 
      }))
    } finally {
      setUploadingFiles(prev => ({ ...prev, [appointmentId]: false }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
  }

  const getServiceTypeLabel = (serviceType: string) => {
    const types: Record<string, string> = {
      'express-care': '⚡ Express Care',
      'schedule': '📅 Schedule',
      'tow-service': '🚛 Tow Service',
      'contact-inquiry': '💬 Contact',
    }
    return types[serviceType] || serviceType
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Customer Portal - Quick Lookup
            </h1>
            <p className="text-gray-600 mb-4">
              View your appointment status by phone number
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <Link
                href="/portal/auth/login"
                className="text-red-600 font-semibold hover:underline"
              >
                🔐 Login to Your Account
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/portal/auth/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                ✨ Create an Account
              </Link>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Enter Your Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
                required
                maxLength={12}
                placeholder="216-481-8696"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-semibold text-gray-900"
                autoComplete="tel"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter your 10-digit phone number (e.g., 216-481-8696)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Searching...
                </span>
              ) : (
                '🔍 View My Appointments'
              )}
            </button>
          </form>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Need Help?</strong>
            </p>
            <p>
              Call us at{' '}
              <a href="tel:+12164818696" className="text-red-600 font-semibold hover:underline">
                (216) 481-8696
              </a>
            </p>
            <p className="mt-1">17017 Saint Clair Ave, Cleveland, OH 44110</p>
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 font-semibold mb-2">
                💡 Pro Tip: Create an account for easier access!
              </p>
              <p className="text-blue-700 text-xs">
                With an account, you can view all your appointments instantly without entering your phone number each time.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div ref={resultsRef} className="space-y-4 scroll-mt-4">
            {appointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No Appointments Found
                </h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any appointments for{' '}
                  <span className="font-semibold">{formatPhoneDisplay(phone)}</span>
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-left">
                  <p className="text-sm text-blue-800">
                    <strong>Tips:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Make sure you entered the correct phone number</li>
                    <li>Try the phone number you used when booking</li>
                    <li>Call us at (216) 481-8696 for assistance</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <p className="text-green-800 font-semibold">
                    ✅ Found {appointments.length} appointment{appointments.length > 1 ? 's' : ''} for{' '}
                    {formatPhoneDisplay(phone)}
                  </p>
                </div>

                {appointments.map((appointment) => {
                  const appointmentFiles = uploadedFiles[appointment.id] || []
                  const isUploading = uploadingFiles[appointment.id] || false
                  const uploadErr = uploadError[appointment.id]

                  return (
                    <div key={appointment.id} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {appointment.customer_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Service: {getServiceTypeLabel(appointment.service_type)}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Date & Time:</p>
                          <p className="text-gray-900">
                            {appointment.appointment_date} at {appointment.appointment_time}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Phone:</p>
                          <p className="text-gray-900">{formatPhoneDisplay(appointment.customer_phone)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Email:</p>
                          <p className="text-gray-900">{appointment.customer_email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Submitted:</p>
                          <p className="text-gray-900">
                            {new Date(appointment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {appointment.vehicle_make && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Vehicle Information:</p>
                          <p className="text-gray-900">
                            {appointment.vehicle_year} {appointment.vehicle_make} {appointment.vehicle_model}
                          </p>
                        </div>
                      )}

                      {appointment.damage_description && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Damage Description:</p>
                          <p className="text-gray-900">{appointment.damage_description}</p>
                        </div>
                      )}

                      {/* Existing Files Display */}
                      {appointment.files && appointment.files.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-3">
                            📎 Uploaded Files ({appointment.files.length})
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {appointment.files.map((file) => (
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
                      )}

                      {/* File Upload Section */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold text-blue-900 mb-2">
                            📎 Upload Photos & Documents
                          </p>
                          <p className="text-xs text-blue-700 mb-3">
                            Add photos of damage, insurance documents, or other relevant files (Max 10 files, 10MB each)
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <label className="flex-1">
                              <input
                                type="file"
                                multiple
                                accept="image/*,.pdf,.heic,.heif"
                                onChange={(e) => handleFileSelect(appointment.id, e)}
                                className="hidden"
                                disabled={isUploading}
                              />
                              <span className="block w-full px-4 py-2 bg-white border-2 border-blue-300 rounded-lg text-blue-700 font-semibold text-center cursor-pointer hover:bg-blue-50 transition-colors">
                                📁 Choose Files
                              </span>
                            </label>
                            
                            {appointmentFiles.length > 0 && (
                              <button
                                onClick={() => uploadFiles(appointment.id)}
                                disabled={isUploading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUploading ? (
                                  <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Uploading...
                                  </span>
                                ) : (
                                  `⬆️ Upload ${appointmentFiles.length} File${appointmentFiles.length > 1 ? 's' : ''}`
                                )}
                              </button>
                            )}
                          </div>

                          {uploadErr && (
                            <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-r">
                              <p className="text-red-700 text-sm font-medium">{uploadErr}</p>
                            </div>
                          )}

                          {appointmentFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="text-xs font-semibold text-gray-700">Selected Files:</p>
                              {appointmentFiles.map((uploadedFile, index) => (
                                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {uploadedFile.preview && (
                                      <img 
                                        src={uploadedFile.preview} 
                                        alt={uploadedFile.file.name}
                                        className="w-10 h-10 object-cover rounded"
                                      />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {uploadedFile.file.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeFile(appointment.id, index)}
                                    className="ml-2 text-red-600 hover:text-red-700 font-bold"
                                    disabled={isUploading}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                          Questions? Call us at{' '}
                          <a href="tel:+12164818696" className="text-red-600 font-semibold hover:underline">
                            (216) 481-8696
                          </a>
                        </p>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
