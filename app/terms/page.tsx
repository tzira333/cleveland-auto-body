import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Domestic and Foreign Auto Body Inc.',
  description: 'Terms of Service for Domestic and Foreign Auto Body Inc. Read our terms and conditions before using our services.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">
            <strong>Effective Date:</strong> January 1, 2026
            <br />
            <strong>Last Updated:</strong> January 29, 2026
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to Domestic and Foreign Auto Body Inc. ("Company," "we," "us," or "our"). These Terms of 
            Service ("Terms") govern your access to and use of our website{' '}
            <Link href="/" className="text-red-600 hover:underline">clevelandbody.com</Link>{' '}
            and all services provided by Domestic and Foreign Auto Body Inc.
          </p>
          <div className="bg-red-50 border-2 border-red-600 p-6 rounded-lg">
            <p className="text-gray-900 leading-relaxed font-semibold">
              BY ACCESSING OR USING OUR WEBSITE OR SERVICES, YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU DO 
              NOT AGREE TO THESE TERMS, DO NOT USE OUR WEBSITE OR SERVICES.
            </p>
          </div>
        </section>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li><a href="#acceptance" className="text-red-600 hover:underline">Acceptance of Terms</a></li>
            <li><a href="#services" className="text-red-600 hover:underline">Our Services</a></li>
            <li><a href="#user-consent" className="text-red-600 hover:underline">User Consent and Communications</a></li>
            <li><a href="#user-obligations" className="text-red-600 hover:underline">User Obligations</a></li>
            <li><a href="#estimates" className="text-red-600 hover:underline">Estimates and Pricing</a></li>
            <li><a href="#payment" className="text-red-600 hover:underline">Payment Terms</a></li>
            <li><a href="#cancellation" className="text-red-600 hover:underline">Cancellation and Refunds</a></li>
            <li><a href="#liability" className="text-red-600 hover:underline">Limitation of Liability</a></li>
            <li><a href="#disclaimer" className="text-red-600 hover:underline">Disclaimer of Warranties</a></li>
            <li><a href="#indemnification" className="text-red-600 hover:underline">Indemnification</a></li>
            <li><a href="#intellectual-property" className="text-red-600 hover:underline">Intellectual Property</a></li>
            <li><a href="#third-party" className="text-red-600 hover:underline">Third-Party Services</a></li>
            <li><a href="#governing-law" className="text-red-600 hover:underline">Governing Law</a></li>
            <li><a href="#dispute-resolution" className="text-red-600 hover:underline">Dispute Resolution</a></li>
            <li><a href="#modifications" className="text-red-600 hover:underline">Modifications to Terms</a></li>
            <li><a href="#severability" className="text-red-600 hover:underline">Severability</a></li>
            <li><a href="#contact-terms" className="text-red-600 hover:underline">Contact Information</a></li>
          </ol>
        </nav>

        {/* Section 1 */}
        <section id="acceptance" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            By accessing our website, submitting a request or form, using our services, or contacting us, 
            you acknowledge that you have read, understood, and agree to be bound by these Terms of Service 
            and our Privacy Policy.
          </p>
          <p className="text-gray-700 leading-relaxed">
            If you are using our services on behalf of an organization, you represent and warrant that you 
            have the authority to bind that organization to these Terms.
          </p>
        </section>

        {/* Section 2 */}
        <section id="services" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Our Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Domestic and Foreign Auto Body Inc. provides auto body repair, collision repair, painting, and 
            related automotive services ("Services"). Our Services include, but are not limited to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Collision repair and restoration</li>
            <li>Auto body painting and refinishing</li>
            <li>Dent removal and paintless dent repair</li>
            <li>Frame straightening</li>
            <li>Insurance claim assistance</li>
            <li>Free estimates</li>
            <li>Towing coordination</li>
            <li>Express care and expedited services</li>
          </ul>
        </section>

        {/* Section 3 - IMPORTANT */}
        <section id="user-consent" className="mb-8 scroll-mt-8">
          <div className="border-4 border-red-600 bg-red-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              ⚠️ 3. User Consent and Communications (IMPORTANT)
            </h2>
            
            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3.1 Express Consent to Contact
              </h3>
              <p className="text-gray-800 leading-relaxed mb-4 font-semibold">
                BY SUBMITTING A REQUEST, INQUIRY, OR FORM THROUGH OUR WEBSITE, PHONE, OR ANY OTHER MEANS, 
                YOU EXPRESSLY CONSENT AND AGREE TO:
              </p>
              <ul className="list-disc list-inside space-y-3 text-gray-800 ml-4">
                <li>
                  <strong>Receive SMS Text Messages:</strong> You consent to receive text messages (SMS) from 
                  us or our affiliates at the mobile phone number you provide, including messages sent using 
                  an automated telephone dialing system. Message and data rates may apply.
                </li>
                <li>
                  <strong>Receive Phone Calls:</strong> You consent to receive phone calls (including autodialed 
                  or pre-recorded calls) from us or our affiliates at any phone number you provide.
                </li>
                <li>
                  <strong>Receive Emails:</strong> You consent to receive emails from us or our affiliates at 
                  the email address you provide.
                </li>
                <li>
                  <strong>Receive Mailings:</strong> You consent to receive physical mail at any address you provide.
                </li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3.2 Purpose of Communications
              </h3>
              <p className="text-gray-800 leading-relaxed mb-3">
                Communications may be for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-800 ml-4">
                <li>Service-related: Appointments, estimates, vehicle status, pick-up notifications</li>
                <li>Administrative: Payment reminders, invoices, insurance coordination</li>
                <li>Marketing: Promotional offers, service specials, maintenance reminders</li>
                <li>Customer service: Surveys, feedback requests, support</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3.3 Opt-Out Rights
              </h3>
              <p className="text-gray-800 leading-relaxed mb-3">
                You may opt out at any time by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-800 ml-4">
                <li>Texting STOP to any SMS message</li>
                <li>Clicking "unsubscribe" in emails</li>
                <li>Calling (216) 481-8696</li>
                <li>Emailing domesticandforeignab@gmail.com</li>
              </ul>
              <p className="text-gray-800 leading-relaxed mt-4 italic">
                Note: Opting out may affect our ability to provide service updates regarding your vehicle.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="user-obligations" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Obligations</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            By using our Services, you agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain the security of any account credentials</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Be the lawful owner of the vehicle or have proper authorization to request services</li>
            <li>Provide all necessary documentation (title, registration, insurance)</li>
            <li>Remove all personal belongings from your vehicle before service</li>
            <li>Pay all charges in accordance with our payment terms</li>
            <li>Not misuse our website or services</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="estimates" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Estimates and Pricing</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>5.1 Estimates:</strong> Estimates provided are approximations based on visible damage. 
            Final costs may vary if additional damage is discovered during repairs.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>5.2 Additional Work:</strong> We will notify you of any additional work required and 
            obtain your approval before proceeding. You agree to be responsible for additional authorized charges.
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>5.3 Pricing Changes:</strong> We reserve the right to change our pricing at any time. 
            However, changes will not affect services already contracted.
          </p>
        </section>

        {/* Section 6 */}
        <section id="payment" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>6.1 Payment Due:</strong> Payment is due upon completion of services unless otherwise 
            agreed in writing. We accept cash, check, credit cards, and insurance payments.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>6.2 Insurance Claims:</strong> If paying via insurance, you are responsible for any 
            deductible, co-pay, or amounts not covered by insurance.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>6.3 Late Payments:</strong> Late payments may be subject to a service charge of 1.5% per 
            month (18% annually) or the maximum rate allowed by law.
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>6.4 Vehicle Lien:</strong> We reserve the right to retain possession of your vehicle until 
            all charges are paid in full, as permitted by Ohio law.
          </p>
        </section>

        {/* Section 7 */}
        <section id="cancellation" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cancellation and Refunds</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>7.1 Cancellation Policy:</strong> You may cancel an appointment or estimate request at 
            any time before work begins. Once work has started, cancellation may result in charges for work 
            performed.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>7.2 Refunds:</strong> Refunds, if applicable, are handled on a case-by-case basis. Partial 
            refunds may be issued for work not performed.
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>7.3 No-Show Policy:</strong> Failure to appear for a scheduled appointment without 24-hour 
            notice may result in charges or forfeiture of deposit if applicable.
          </p>
        </section>

        {/* Section 8 - IMPORTANT */}
        <section id="liability" className="mb-8 scroll-mt-8">
          <div className="border-4 border-yellow-500 bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ⚠️ 8. Limitation of Liability (IMPORTANT)
            </h2>
            
            <div className="bg-white p-4 rounded-lg mb-4">
              <p className="text-gray-800 leading-relaxed mb-4 font-semibold uppercase">
                TO THE FULLEST EXTENT PERMITTED BY LAW, DOMESTIC AND FOREIGN AUTO BODY INC., ITS OFFICERS, 
                DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, AND PARTNERS SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside space-y-3 text-gray-800 ml-4">
                <li>
                  <strong>Indirect, Incidental, Special, or Consequential Damages:</strong> Including lost 
                  profits, lost revenue, loss of data, loss of use, or other intangible losses
                </li>
                <li>
                  <strong>Personal Items:</strong> Any loss, theft, or damage to personal items left in your 
                  vehicle. You are responsible for removing all personal belongings before service.
                </li>
                <li>
                  <strong>Delays:</strong> Any delays in service due to parts availability, insurance processing, 
                  weather, or circumstances beyond our reasonable control
                </li>
                <li>
                  <strong>Third-Party Actions:</strong> Actions, errors, or omissions of third parties, including 
                  insurance companies, towing services, parts suppliers, or rental car companies
                </li>
                <li>
                  <strong>Pre-Existing Conditions:</strong> Damage or defects that existed before we began work, 
                  unless specifically addressed in our estimate
                </li>
                <li>
                  <strong>Rental Vehicles or Transportation:</strong> Any issues with rental vehicles or alternative 
                  transportation arranged by you or third parties
                </li>
                <li>
                  <strong>Website Availability:</strong> Interruptions, errors, or unavailability of our website 
                  or online services
                </li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-800 leading-relaxed mb-3 font-semibold">
                MAXIMUM LIABILITY:
              </p>
              <p className="text-gray-800 leading-relaxed">
                In no event shall our total liability to you for all claims exceed the amount you paid us for 
                the specific services giving rise to the claim, or $500, whichever is less.
              </p>
            </div>
          </div>
        </section>

        {/* Section 9 */}
        <section id="disclaimer" className="mb-8 scroll-mt-8">
          <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-400">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-gray-800 leading-relaxed mb-4 font-semibold uppercase">
              OUR SERVICES AND WEBSITE ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-800 ml-4">
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Warranties that services will be error-free, uninterrupted, or timely</li>
              <li>Warranties regarding the accuracy or reliability of information</li>
              <li>Warranties that defects will be corrected</li>
            </ul>
            <p className="text-gray-800 leading-relaxed mt-4">
              We provide workmanship warranties as specified in writing at the time of service. All other 
              warranties, express or implied, are disclaimed.
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section id="indemnification" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You agree to indemnify, defend, and hold harmless Domestic and Foreign Auto Body Inc., its officers, 
            directors, employees, agents, affiliates, and partners from and against any claims, liabilities, 
            damages, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or related to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Your use of our Services or website</li>
            <li>Your breach of these Terms</li>
            <li>Your violation of any law or regulation</li>
            <li>Your violation of any rights of a third party</li>
            <li>Information you provide that infringes on third-party rights</li>
            <li>Fraudulent, unlawful, or unauthorized use of our Services</li>
          </ul>
        </section>

        {/* Section 11 */}
        <section id="intellectual-property" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All content on our website, including text, graphics, logos, images, and software, is the property 
            of Domestic and Foreign Auto Body Inc. or its licensors and is protected by copyright, trademark, 
            and other intellectual property laws.
          </p>
          <p className="text-gray-700 leading-relaxed">
            You may not copy, reproduce, distribute, modify, or create derivative works from any content on 
            our website without our express written permission.
          </p>
        </section>

        {/* Section 12 */}
        <section id="third-party" className="mb-8 scroll-mt-8">
          <div className="bg-blue-50 border-2 border-blue-400 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Third-Party Services and Information Sharing</h2>
            <p className="text-gray-800 leading-relaxed mb-4 font-semibold">
              BY USING OUR SERVICES, YOU ACKNOWLEDGE AND AGREE THAT:
            </p>
            <ul className="list-disc list-inside space-y-3 text-gray-800 ml-4">
              <li>
                <strong>We may share your information</strong> with affiliates, partners, insurance companies, 
                towing services, parts suppliers, rental car companies, and other third parties necessary to 
                provide our Services
              </li>
              <li>
                <strong>We are not liable</strong> for the actions, errors, omissions, or privacy practices of 
                these third parties
              </li>
              <li>
                <strong>Third-party services</strong> are subject to their own terms and privacy policies
              </li>
              <li>
                <strong>We do not guarantee</strong> the quality, reliability, or availability of third-party services
              </li>
              <li>
                <strong>Your dealings</strong> with third parties are solely between you and them
              </li>
            </ul>
          </div>
        </section>

        {/* Section 13 */}
        <section id="governing-law" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the State of Ohio, 
            without regard to its conflict of law provisions. Any legal action or proceeding arising out of or 
            related to these Terms shall be brought exclusively in the courts located in Cuyahoga County, Ohio, 
            and you consent to the jurisdiction of such courts.
          </p>
        </section>

        {/* Section 14 */}
        <section id="dispute-resolution" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Dispute Resolution</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>14.1 Informal Resolution:</strong> In the event of any dispute, you agree to first contact 
            us to attempt to resolve the dispute informally.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>14.2 Arbitration:</strong> Any dispute that cannot be resolved informally may, at our option, 
            be submitted to binding arbitration in accordance with the rules of the American Arbitration Association.
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>14.3 Class Action Waiver:</strong> You agree that any dispute resolution proceedings will 
            be conducted only on an individual basis and not in a class, consolidated, or representative action.
          </p>
        </section>

        {/* Section 15 */}
        <section id="modifications" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Modifications to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to modify these Terms at any time. We will notify you of material changes by 
            posting the updated Terms on our website with a new "Last Updated" date. Your continued use of our 
            Services after such changes constitutes your acceptance of the modified Terms.
          </p>
        </section>

        {/* Section 16 */}
        <section id="severability" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Severability</h2>
          <p className="text-gray-700 leading-relaxed">
            If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining 
            provisions shall continue in full force and effect. The invalid provision shall be modified to the 
            minimum extent necessary to make it valid and enforceable.
          </p>
        </section>

        {/* Section 17 */}
        <section id="contact-terms" className="mb-8 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have questions about these Terms of Service, please contact us:
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
          </div>
        </section>

        {/* Acknowledgment */}
        <div className="mt-12 pt-6 border-t-4 border-red-600 bg-red-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Acknowledgment</h3>
          <p className="text-gray-800 leading-relaxed">
            BY USING OUR WEBSITE OR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE 
            BOUND BY THESE TERMS OF SERVICE AND OUR PRIVACY POLICY. YOU FURTHER ACKNOWLEDGE THAT YOU CONSENT 
            TO RECEIVE COMMUNICATIONS FROM US AND THAT WE MAY SHARE YOUR INFORMATION AS DESCRIBED IN THESE TERMS.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <p className="text-sm text-gray-600 mb-4">
            These Terms of Service were last updated on January 29, 2026.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="text-red-600 hover:underline font-semibold">
              ← Back to Home
            </Link>
            <Link href="/privacy" className="text-red-600 hover:underline font-semibold">
              View Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
