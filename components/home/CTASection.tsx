import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-secondary-cream">
            Schedule a free estimate or request a tow service today. We'll get your vehicle back on the road in no time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/schedule" 
              className="btn-primary bg-white text-primary hover:bg-secondary-cream w-full sm:w-auto text-center text-lg"
            >
              Schedule Free Estimate
            </Link>
            <Link 
              href="/tow-request" 
              className="btn-outline border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto text-center text-lg"
            >
              Request Tow Service
            </Link>
            <Link 
              href="/repair-request" 
              className="btn-secondary bg-primary-light hover:bg-primary w-full sm:w-auto text-center text-lg"
            >
              Start Repair Request
            </Link>
          </div>

          <div className="mt-12 pt-12 border-t border-white/20">
            <p className="text-lg mb-4">Or call us directly:</p>
            <a 
              href="tel:+12164818696" 
              className="text-3xl md:text-4xl font-bold hover:text-secondary-cream transition-colors inline-flex items-center"
            >
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              (216) 481-8696
            </a>
            <p className="mt-4 text-secondary-cream">
              Mon-Fri: 8:00 AM - 4:30 PM | Sat: 9:00 AM - 1:00 PM
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
