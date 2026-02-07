import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Domestic and Foreign Auto Body Inc.</h3>
            <p className="text-gray-400 mb-4">
              Over 40 years of experience providing expert auto body repair and collision services in Cleveland, OH.
            </p>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center gap-2">
                <span>📍</span>
                <span>17017 Saint Clair Ave<br />Cleveland, OH 44110</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="text-gray-400 hover:text-white transition-colors">
                  Schedule Estimate
                </Link>
              </li>
              <li>
                <Link href="/repair-request" className="text-gray-400 hover:text-white transition-colors">
                  Express Care Request
                </Link>
              </li>
              <li>
                <Link href="/tow-request" className="text-gray-400 hover:text-white transition-colors">
                  Tow Request
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/portal" className="text-gray-400 hover:text-white transition-colors">
                  Customer Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-3 text-gray-400">
              <p className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+12164818696" className="hover:text-white transition-colors">
                  (216) 481-8696
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span>📧</span>
                <a href="mailto:domesticandforeignab@gmail.com" className="hover:text-white transition-colors">
                  domesticandforeignab@gmail.com
                </a>
              </p>
              <div className="mt-4">
                <p className="font-semibold text-white mb-2">Business Hours:</p>
                <p>Monday - Friday: 8:00 AM - 4:30 PM</p>
                <p>Saturday: 9:00 AM - 1:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Legal Links */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Domestic and Foreign Auto Body Inc. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
