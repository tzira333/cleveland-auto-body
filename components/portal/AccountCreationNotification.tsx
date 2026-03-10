'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface AccountCreationNotificationProps {
  showBanner?: boolean
  showModal?: boolean
  onDismissModal?: () => void
}

export default function AccountCreationNotification({ 
  showBanner = true, 
  showModal = false,
  onDismissModal 
}: AccountCreationNotificationProps) {
  const [modalOpen, setModalOpen] = useState(showModal)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('accountNotificationDismissed')
    if (dismissed) {
      setBannerDismissed(true)
    }
  }, [])

  const handleDismissBanner = () => {
    setBannerDismissed(true)
    localStorage.setItem('accountNotificationDismissed', 'true')
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    if (onDismissModal) {
      onDismissModal()
    }
  }

  return (
    <>
      {/* Banner Notification */}
      {showBanner && !bannerDismissed && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Important: Account Required After Estimate Approval</h3>
                <p className="text-sm text-orange-50">
                  You can currently edit your service inquiry and appointment information. 
                  However, once your estimate is approved and a Repair Order is created, 
                  <strong className="text-white"> you MUST create an account</strong> to track 
                  your repair status and protect your data and privacy.
                </p>
                <Link
                  href="/portal/auth/register"
                  className="inline-block mt-2 px-4 py-1.5 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-sm"
                >
                  Create Account Now
                </Link>
              </div>
            </div>
            <button
              onClick={handleDismissBanner}
              className="text-white hover:text-orange-100 transition-colors flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Notification */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8" />
                <h2 className="text-2xl font-bold">Account Creation Required</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Why do I need an account?
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Track Your Repair:</strong> Once your estimate is approved and Repair Order is created, you'll need an account to view real-time repair status updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Data Privacy:</strong> Your account protects your personal information and repair details with secure authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Photo Upload:</strong> Securely upload and view photos of your vehicle throughout the repair process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Communication:</strong> Receive updates and communicate directly with our staff</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Current Status:</strong> You can edit your service inquiry and appointment 
                  information without an account. Account creation becomes mandatory only after 
                  estimate approval.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/portal/auth/register"
                  className="flex-1 text-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
                >
                  Create Account Now
                </Link>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  I'll Do It Later
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Already have an account? <Link href="/portal/auth/login" className="text-blue-600 hover:underline">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
