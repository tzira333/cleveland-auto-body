export default function ReviewsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Customer Reviews</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="card">
          <div className="flex items-center mb-3">
            <div className="text-yellow-500 text-xl">★★★★★</div>
          </div>
          <p className="text-gray-700 italic mb-3">
            "Excellent service and quality work. They handled my insurance claim and got my car looking brand new."
          </p>
          <p className="text-sm text-gray-600">— Local Customer</p>
        </div>
        
        <div className="card">
          <div className="flex items-center mb-3">
            <div className="text-yellow-500 text-xl">★★★★★</div>
          </div>
          <p className="text-gray-700 italic mb-3">
            "Over 40 years of experience really shows. Professional, honest, and fair pricing."
          </p>
          <p className="text-sm text-gray-600">— Cleveland Resident</p>
        </div>
      </div>
      
      <div className="bg-primary-dark text-white p-8 rounded-lg text-center">
        <h3 className="text-2xl font-bold mb-4">Ready to Experience Quality Service?</h3>
        <a href="tel:+12164818696" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-secondary-cream transition-colors inline-block">
          (216) 481-8696
        </a>
      </div>
    </div>
  )
}