import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Domestic and Foreign Auto Body Inc.',
  description: 'Privacy Policy for Domestic and Foreign Auto Body Inc. Learn how we collect, use, and protect your personal information.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">
            <strong>Effective Date:</strong> January 1, 2026
            <br />
            <strong>Last Updated:</strong> January 29, 2026
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed mb-4">
            Domestic and Foreign Auto Body Inc. ("we," "us," "our," or "Company") respects your privacy 
            and is committed to protecting your personal information. This Privacy Policy explains how we 
            collect, use, disclose, and safeguard your information when you visit our website{' '}
            <Link href="/" className="text-red-600 hover:underline">clevelandbody.com</Link>{' '}
            and use our services.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By accessing or using our website and services, you agree to this Privacy Policy. If you do not 
            agree with the terms of this Privacy Policy, please do not access or use our services.
          </p>
        </section>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li><a href="#information-we-collect" className="text-red-600 hover:underline">Information We Collect</a></li>
            <li><a href="#how-we-use" className="text-red-600 hover:underline">How We Use Your Information</a></li>
            <li><a href="#consent-communications" className="text-red-600 hover:underline">Consent to Communications</a></li>
            <li><a href="#sharing-information" className="text-red-600 hover:underline">Sharing Your Information</a></li>
            <li><a href="#data-security" className="text-red-600 hover:underline">Data Security</a></li>
            <li><a href="#cookies" className="text-red-600 hover:underline">Cookies and Tracking</a></li>
            <li><a href="#your-rights" className="text-red-600 hover:underline">Your Rights</a></li>
            <li><a href="#children" className="text-red-600 hover:underline">Children's Privacy</a></li>
            <li><a href="#third-party" className="text-red-600 hover:underline">Third-Party Links</a></li>
            <li><a href="#changes" className="text-red-600 hover:underline">Changes to This Policy</a></li>
            <li><a href="#contact" className="text-red-600 hover:underline">Contact Us</a></li>
          </ol>
        </nav>

        {/* Section 1 */}
        <section id="information-we-collect" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 Personal Information You Provide</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We collect information that you voluntarily provide to us when you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
            <li>Submit a service request, appointment, or estimate form</li>
            <li>Contact us via phone, email, or contact form</li>
            <li>Use our customer portal</li>
            <li>Sign up for notifications or updates</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Personal information may include:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
            <li>Full name</li>
            <li>Phone number (mobile and/or landline)</li>
            <li>Email address</li>
            <li>Mailing address</li>
            <li>Vehicle information (year, make, model, VIN)</li>
            <li>Insurance information</li>
            <li>Damage descriptions and photos</li>
            <li>Payment information (processed securely by third-party processors)</li>
            <li>Any other information you choose to provide</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2 Automatically Collected Information</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            When you visit our website, we automatically collect certain information, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent on pages</li>
            <li>Referring website addresses</li>
            <li>Date and time of visits</li>
            <li>Clickstream data</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section id="how-we-use" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li><strong>Service Delivery:</strong> To schedule appointments, provide estimates, perform repairs, and deliver requested services</li>
            <li><strong>Communication:</strong> To contact you via phone, SMS text message, email, or mail regarding your service requests, appointments, estimates, and vehicle status</li>
            <li><strong>Customer Support:</strong> To respond to your inquiries, questions, and support requests</li>
            <li><strong>Business Operations:</strong> To process payments, maintain records, and conduct normal business activities</li>
            <li><strong>Improvement:</strong> To improve our website, services, and customer experience</li>
            <li><strong>Marketing:</strong> To send promotional offers, service reminders, and updates (with your consent where required)</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
            <li><strong>Analytics:</strong> To analyze website usage and visitor behavior through tools like Google Analytics</li>
          </ul>
        </section>

        {/* Section 3 - IMPORTANT */}
        <section id="consent-communications" className="mb-8 scroll-mt-8">
          <div className="border-4 border-red-600 bg-red-50 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              ⚠️ 3. Consent to Communications (IMPORTANT)
            </h2>
            
            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3.1 Express Consent to Contact
              </h3>
              <p className="text-gray-800 leading-relaxed mb-4 font-semibold">
                BY SUBMITTING A REQUEST, FORM, OR INQUIRY THROUGH OUR WEBSITE, YOU EXPRESSLY CONSENT AND 
                AGREE TO RECEIVE COMMUNICATIONS FROM DOMESTIC AND FOREIGN AUTO BODY INC., INCLUDING BUT NOT 
                LIMITED TO:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-800 ml-4">
                <li><strong>SMS Text Messages</strong> to the mobile phone number you provide</li>
                <li><strong>Phone Calls</strong> (including autodialed or pre-recorded calls) to any phone number you provide</li>
                <li><strong>Emails</strong> to the email address you provide</li>
                <li><strong>Mailings</strong> to any physical address you provide</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3.2 Types of Communications
              </h3>
              <p className="text-gray-800 leading-relaxed mb-4">
                These communications may include, but are not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-800 ml-4">
                <li>Appointment confirmations and reminders</li>
                <li>Service status updates and notifications</li>
                <li>Estimate and invoice information</li>
                <li>Pick-up and drop-off coordination</li>
                <li>Payment reminders</li>
                <li>Customer satisfaction surveys</li>
                <li>Promotional offers and marketing messages</li>
                <li>Service reminders and maintenance recommendations</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3.3 SMS Text Messaging Terms
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-800 ml-4">
                <li>Message frequency varies based on your service needs and requests</li>
                <li>Message and data rates may apply from your wireless carrier</li>
                <li>Carriers are not liable for delayed or undelivered messages</li>
                <li>To opt-out of SMS messages, reply <strong>STOP</strong> to any text message</li>
                <li>For help with SMS messages, reply <strong>HELP</strong> or contact us at (216) 481-8696</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3.4 Withdrawal of Consent
              </h3>
              <p className="text-gray-800 leading-relaxed">
                You may withdraw your consent to receive communications at any time by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-800 ml-4 mt-2">
                <li>Replying <strong>STOP</strong> to any SMS text message</li>
                <li>Clicking "unsubscribe" in any promotional email</li>
                <li>Calling us at (216) 481-8696</li>
                <li>Emailing us at the contact information provided below</li>
              </ul>
              <p className="text-gray-800 leading-relaxed mt-4 italic">
                Note: Withdrawing consent may limit our ability to provide certain services or updates regarding your vehicle service.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="sharing-information" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing Your Information</h2>
          
          <div className="bg-yellow-50 border-2 border-yellow-400 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              4.1 Sharing with Affiliates and Partners
            </h3>
            <p className="text-gray-800 leading-relaxed mb-4">
              <strong>BY USING OUR SERVICES, YOU ACKNOWLEDGE AND CONSENT</strong> that we may share your 
              personal information with our affiliates, partners, service providers, and third parties to 
              conduct normal business operations, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-800 ml-4">
              <li><strong>Insurance Companies:</strong> To process claims and obtain authorizations</li>
              <li><strong>Parts Suppliers:</strong> To order necessary parts and materials</li>
              <li><strong>Towing Services:</strong> To coordinate vehicle transportation</li>
              <li><strong>Rental Car Companies:</strong> To arrange temporary transportation</li>
              <li><strong>Payment Processors:</strong> To process payments and transactions</li>
              <li><strong>Technology Service Providers:</strong> For website hosting, data storage, and communication services</li>
              <li><strong>Business Partners:</strong> Who help us provide and improve our services</li>
              <li><strong>Marketing Partners:</strong> For promotional and marketing purposes (with your consent where required)</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Legal Disclosures</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may disclose your information when required by law or when we believe disclosure is necessary to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Comply with legal obligations, court orders, or government requests</li>
            <li>Protect our rights, property, or safety, or that of our customers or others</li>
            <li>Prevent fraud or illegal activities</li>
            <li>Enforce our Terms of Service or other agreements</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Business Transfers</h3>
          <p className="text-gray-700 leading-relaxed">
            In the event of a merger, acquisition, sale of assets, bankruptcy, or other business transfer, 
            your information may be transferred to the acquiring entity or successor organization.
          </p>
        </section>

        {/* Section 5 */}
        <section id="data-security" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We implement reasonable administrative, technical, and physical security measures to protect your 
            personal information from unauthorized access, disclosure, alteration, or destruction. These measures include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
            <li>Secure SSL/TLS encryption for data transmission</li>
            <li>Secure data storage systems</li>
            <li>Access controls and authentication</li>
            <li>Regular security assessments</li>
            <li>Employee training on data protection</li>
          </ul>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-800 leading-relaxed font-semibold">
              ⚠️ IMPORTANT: While we strive to protect your personal information, no method of transmission 
              over the internet or electronic storage is 100% secure. We cannot guarantee absolute security 
              of your information. You acknowledge and accept this risk when using our services.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section id="cookies" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use cookies, web beacons, and similar tracking technologies to enhance your experience and 
            collect information about how you use our website.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Types of Cookies We Use</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
            <li><strong>Essential Cookies:</strong> Required for website functionality</li>
            <li><strong>Analytics Cookies:</strong> Google Analytics to understand website usage</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Advertising Cookies:</strong> Track ad performance and deliver relevant ads</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Managing Cookies</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            You can control cookies through your browser settings. However, disabling cookies may limit your 
            ability to use certain features of our website.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Google Analytics</h3>
          <p className="text-gray-700 leading-relaxed">
            We use Google Analytics to collect and analyze website usage data. Google Analytics uses cookies 
            to track visitor interactions. For more information, visit{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
              Google's Privacy Policy
            </a>.
          </p>
        </section>

        {/* Section 7 */}
        <section id="your-rights" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Privacy Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Depending on your location, you may have certain rights regarding your personal information:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
            <li><strong>Opt-Out:</strong> Withdraw consent for marketing communications</li>
            <li><strong>Portability:</strong> Request transfer of your data in a machine-readable format</li>
            <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            To exercise these rights, please contact us using the information provided in Section 11.
          </p>
        </section>

        {/* Section 8 */}
        <section id="children" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Our services are not directed to individuals under the age of 18. We do not knowingly collect 
            personal information from children. If you believe we have inadvertently collected information 
            from a child, please contact us immediately, and we will take steps to delete such information.
          </p>
        </section>

        {/* Section 9 */}
        <section id="third-party" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
          <p className="text-gray-700 leading-relaxed">
            Our website may contain links to third-party websites, services, or applications. We are not 
            responsible for the privacy practices or content of these third parties. We encourage you to 
            review the privacy policies of any third-party sites you visit.
          </p>
        </section>

        {/* Section 10 */}
        <section id="changes" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our practices, 
            technology, legal requirements, or other factors. We will post the updated Privacy Policy on 
            this page with a new "Last Updated" date. Your continued use of our services after any changes 
            constitutes acceptance of the updated Privacy Policy.
          </p>
        </section>

        {/* Section 11 */}
        <section id="contact" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, 
            please contact us:
          </p>
          <div className="bg-gray-100 p-6 rounded-lg">
            <p className="text-gray-900 font-semibold mb-2">Domestic and Foreign Auto Body Inc.</p>
            <p className="text-gray-700">17017 Saint Clair Ave</p>
            <p className="text-gray-700">Cleveland, OH 44110</p>
            <p className="text-gray-700 mt-3">
              <strong>Phone:</strong>{' '}
              <a href="tel:+12164818696" className="text-red-600 hover:underline">
                (216) 481-8696
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong>{' '}
              <a href="mailto:domesticandforeignab@gmail.com" className="text-red-600 hover:underline">
                domesticandforeignab@gmail.com
              </a>
            </p>
            <p className="text-gray-700 mt-3">
              <strong>Business Hours:</strong>
              <br />
              Monday - Friday: 8:00 AM - 4:30 PM
              <br />
              Saturday: 9:00 AM - 1:00 PM
              <br />
              Sunday: Closed
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <p className="text-sm text-gray-600 mb-4">
            This Privacy Policy was last updated on January 29, 2026.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="text-red-600 hover:underline font-semibold">
              ← Back to Home
            </Link>
            <Link href="/terms" className="text-red-600 hover:underline font-semibold">
              View Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
