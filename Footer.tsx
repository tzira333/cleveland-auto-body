import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary-light">
              DOMESTIC & FOREIGN<br />AUTO BODY INC.
            </h3>
            <p className="text-gray-300 mb-4">
              Expert auto body repair and collision services in Cleveland, OH. Over 40 years of experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/services" className="text-gray-300 hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/insurance" className="text-gray-300 hover:text-white transition-colors">Insurance Claims</Link></li>
              <li><Link href="/gallery" className="text-gray-300 hover:text-white transition-colors">Gallery</Link></li>
              <li><Link href="/reviews" className="text-gray-300 hover:text-white transition-colors">Reviews</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Collision Repair</li>
              <li>Auto Body Repair</li>
              <li>Custom Painting</li>
              <li>Paintless Dent Removal</li>
              <li>Insurance Claims</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-gray-300">
              <div>
                <p className="font-semibold text-white">Address:</p>
                <p>17017 Saint Clair Ave<br />Cleveland, OH 44110</p>
              </div>
              <div>
                <p className="font-semibold text-white">Phone:</p>
                <a href="tel:+12164818696" className="hover:text-white transition-colors">
                  (216) 481-8696
                </a>
              </div>
              <div>
                <p className="font-semibold text-white">Hours:</p>
                <p className="text-sm">
                  Mon-Fri: 8:00 AM - 4:30 PM<br />
                  Sat: 9:00 AM - 1:00 PM<br />
                  Sun: Closed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {currentYear} Domestic and Foreign Auto Body Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/schedule" className="hover:text-white transition-colors">Schedule Appointment</Link>
            <Link href="/tow-request" className="hover:text-white transition-colors">Request Tow</Link>
            <Link href="/portal" className="hover:text-white transition-colors">Customer Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
