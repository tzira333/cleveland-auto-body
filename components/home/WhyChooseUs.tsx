export default function WhyChooseUs() {
  const reasons = [
    {
      title: 'Expert Technicians',
      description: 'Our body men and painters each have over 40 years of experience in collision repair and custom painting.',
    },
    {
      title: 'All Insurance Welcome',
      description: 'We work with all major insurance companies and handle the entire claims process for you.',
    },
    {
      title: 'Domestic & Foreign',
      description: 'Specialized in both domestic and foreign vehicles. No make or model is beyond our expertise.',
    },
    {
      title: 'Quality Guarantee',
      description: 'We stand behind our work with a comprehensive warranty on all repairs and paintwork.',
    },
    {
      title: 'Free Estimates',
      description: 'Get a detailed, no-obligation estimate for your repair work at no cost.',
    },
    {
      title: 'Towing Available',
      description: 'We can arrange towing services to bring your vehicle to our shop if it\'s not drivable.',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="section-heading">Why Choose Us</h2>
          <p className="section-subheading">
            Cleveland's trusted auto body repair specialists for over 40 years
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">{reason.title}</h3>
              <p className="text-gray-600">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
