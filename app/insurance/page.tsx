export default function InsurancePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Insurance Claims</h1>
      
      <div className="prose max-w-3xl mb-12">
        <p className="text-lg text-gray-700 mb-4">
          We work with all major insurance companies and handle the entire claims process for you.
        </p>
        
        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">We Accept All Insurance</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>State Farm</li>
          <li>Allstate</li>
          <li>Progressive</li>
          <li>Geico</li>
          <li>Nationwide</li>
          <li>And all other major carriers</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">How It Works</h2>
        <ol className="list-decimal pl-6 text-gray-700 space-y-3">
          <li>Bring your vehicle to our shop or we can arrange towing</li>
          <li>We'll inspect the damage and provide a detailed estimate</li>
          <li>We work directly with your insurance company</li>
          <li>Once approved, we complete the repairs</li>
          <li>You pick up your vehicle looking like new</li>
        </ol>
      </div>
      
      <div className="bg-secondary-cream p-8 rounded-lg">
        <h3 className="text-2xl font-bold text-primary mb-4">Questions About Your Claim?</h3>
        <p className="text-gray-700 mb-4">Our experienced staff can help guide you through the insurance process.</p>
        <a href="tel:+12164818696" className="btn-primary inline-block">
          Call (216) 481-8696
        </a>
      </div>
    </div>
  )
}

