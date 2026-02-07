import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white">
<div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Expert Auto Body, Custom Painting, Restoration & Collision Repair in Cleveland
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-secondary-cream">
            We repair all makes and models of Domestic and Foreign vehicles including all EVs and Hybrid vehicles. Professional collision repair, custom painting, and restoration services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/schedule" 
              className="btn-primary bg-white text-primary hover:bg-secondary-cream text-center text-lg"
            >
              Schedule An Estimate
            </Link>
            <Link 
              href="/tow-request" 
              className="btn-outline border-white text-white hover:bg-white hover:text-primary text-center text-lg"
            >
              Request Tow Service
            </Link>
            <Link 
              href="/repair-request" 
              className="btn-secondary bg-primary-light hover:bg-primary text-center text-lg"
            >
              Start Repair Request
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div>
                <p className="font-bold">4.6 Star Rating</p>
                <p className="text-sm text-secondary-cream">Trusted by Customers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="font-bold">All Insurance Accepted</p>
                <p className="text-sm text-secondary-cream">We handle claims</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold">40+ Years Experience</p>
                <p className="text-sm text-secondary-cream">Expert technicians</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
