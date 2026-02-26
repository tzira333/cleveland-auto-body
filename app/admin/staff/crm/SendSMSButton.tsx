'use client'

import { useState } from 'react'

interface SendSMSButtonProps {
  customerPhone: string
  customerName: string
  roNumber: string
  roId: string
  vehicleInfo: string
}

export default function SendSMSButton({
  customerPhone,
  customerName,
  roNumber,
  roId,
  vehicleInfo
}: SendSMSButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const quickMessages = [
    `Hi ${customerName}, this is Cleveland Auto Body. We have an update on your ${vehicleInfo}. Please call us at (555) 123-4567. RO#${roNumber}`,
    `Hi ${customerName}, your ${vehicleInfo} is ready for pickup. Please call us to schedule. (555) 123-4567 - RO#${roNumber}`,
    `Hi ${customerName}, we need to discuss your ${vehicleInfo} estimate. Please call us at (555) 123-4567. RO#${roNumber}`,
    `Hi ${customerName}, we're starting work on your ${vehicleInfo}. We'll keep you updated. Cleveland Auto Body - RO#${roNumber}`
  ]
  
  const handleQuickMessage = (msg: string) => {
    setMessage(msg)
  }
  
  const handleSend = async () => {
    if (!message.trim()) {
      setError('Please enter a message')
      return
    }
    
    if (!customerPhone) {
      setError('No customer phone number available')
      return
    }
    
    setSending(true)
    setError('')
    setSuccess(false)
    
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerPhone,
          message: message.trim(),
          messageType: 'manual',
          relatedRoId: roId,
          sentBy: 'Staff' // You can get this from auth context
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS')
      }
      
      setSuccess(true)
      setMessage('')
      
      setTimeout(() => {
        setShowModal(false)
        setSuccess(false)
      }, 2000)
      
    } catch (err: any) {
      console.error('Error sending SMS:', err)
      setError(err.message || 'Failed to send SMS')
    } finally {
      setSending(false)
    }
  }
  
  if (!customerPhone) {
    return null // Don't show button if no phone
  }
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        title="Send SMS to customer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Send SMS
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Send SMS to Customer</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {customerName} • {customerPhone}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  disabled={sending}
                >
                  &times;
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-3">
                  <p className="text-green-700 text-sm">SMS sent successfully!</p>
                </div>
              )}
              
              {/* Quick Message Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Messages (click to use)
                </label>
                <div className="space-y-2">
                  {quickMessages.map((msg, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickMessage(msg)}
                      className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      disabled={sending}
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Custom Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    setError('')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-y"
                  placeholder="Type your message here..."
                  disabled={sending}
                  maxLength={1600}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length}/1600 characters
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                disabled={sending || !message.trim()}
              >
                {sending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send SMS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
