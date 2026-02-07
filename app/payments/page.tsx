import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Payments | Domestic and Foreign Auto Body Inc.',
  description: 'Payment options for auto body repair services. Call us to arrange payment.',
}

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Options</h1>
            <p className="text-xl text-gray-600">
              We offer flexible payment options for your convenience
            </p>
          </div>

          {/* Call to Arrange Payment */}
          <div className="card mb-8 bg-primary text-white text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Call to Arrange Payment</h2>
            <p className="text-xl mb-6">
              Please call us directly to discuss payment options and arrange payment for your repair services.
            </p>
            <a 
              href="tel:+12164818696" 
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg text-2xl font-bold hover:bg-secondary-cream transition-colors"
            >
              (216) 481-8696
            </a>
            <p className="mt-4 text-secondary-cream">
              Mon-Fri: 8:00 AM - 4:30 PM | Sat: 9:00 AM - 1:00 PM
            </p>
          </div>

          {/* Payment Methods We Accept */}
          <div className="card">
            <h3 className="text-2xl font-bold mb-6">Payment Methods We Accept</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold">Credit & Debit Cards</h4>
                  <p className="text-gray-600 text-sm">Visa, Mastercard, American Express, Discover</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold">Cash</h4>
                  <p className="text-gray-600 text-sm">Cash payments accepted in person</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold">Checks</h4>
                  <p className="text-gray-600 text-sm">Personal and business checks accepted</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold">Digital Payments</h4>
                  <p className="text-gray-600 text-sm">Zelle, Venmo, PayPal, Cash App</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold">Insurance Claims</h4>
                  <p className="text-gray-600 text-sm">We work directly with all major insurers</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold">Flexible Payment Plans</h4>
                  <p className="text-gray-600 text-sm">Ask about payment plans for larger repairs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="card mt-8 bg-blue-50 border-2 border-blue-200">
            <div className="flex items-start space-x-4">
              <svg className="w-12 h-12 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Insurance Customers</h3>
                <p className="text-blue-800 mb-4">
                  If your repair is covered by insurance, we will work directly with your insurance company. 
                  You may only need to pay your deductible.
                </p>
                <Link href="/insurance" className="text-primary font-semibold hover:underline">
                  Learn more about insurance claims →
                </Link>
              </div>
            </div>
          </div>

          {/* Questions? */}
          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold mb-4">Questions About Payment?</h3>
            <p className="text-gray-600 mb-6">
              Our team is happy to discuss payment options and answer any questions you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+12164818696" className="btn-primary">
                Call Us: (216) 481-8696
              </a>
              <Link href="/contact" className="btn-outline">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Coming Soon Notice (Optional - Remove when payments enabled) */}
          <div className="mt-12 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-bold text-yellow-900 mb-1">Online Payments Coming Soon</h4>
                <p className="text-yellow-800 text-sm">
                  We're working on adding secure online payment options to make paying for your repairs even more convenient. 
                  In the meantime, please call us to arrange payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
