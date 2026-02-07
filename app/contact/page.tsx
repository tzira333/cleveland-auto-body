import { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata = {
  title: 'Contact Us | Domestic & Foreign Auto Body',
  description: 'Get in touch with us for auto body repair services.',
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <ContactForm />
    </div>
  )
}