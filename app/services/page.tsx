export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Our Services</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-3">Collision Repair</h2>
          <p className="text-gray-700">Major and minor collision repair with over 40 years of experience. We work with all insurance companies.</p>
        </div>
        
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-3">Custom Painting</h2>
          <p className="text-gray-700">Professional auto painting and refinishing. Complete repaints or touch-ups to restore your vehicle's finish.</p>
        </div>
        
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-3">Frame Straightening</h2>
          <p className="text-gray-700">Precision frame and unibody repair using state-of-the-art equipment to restore structural integrity.</p>
        </div>
        
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-3">Rust Repair</h2>
          <p className="text-gray-700">Expert rust removal and prevention to extend your vehicle's life and maintain its value.</p>
        </div>
      </div>
      
      <div className="bg-primary-dark text-white p-8 rounded-lg text-center">
        <h3 className="text-2xl font-bold mb-4">Need a Free Estimate?</h3>
        <p className="mb-6">Call us today or stop by our shop for a detailed quote.</p>
        <a href="tel:+12164818696" className="btn-primary inline-block">
          (216) 481-8696
        </a>
      </div>
    </div>
  )
}