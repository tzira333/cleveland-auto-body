import { Metadata } from 'next'
import TowRequestForm from './TowRequestForm'

export const metadata = {
  title: 'Request Tow Service | Domestic & Foreign Auto Body',
  description: 'Request emergency tow service for your vehicle.',
}

export default function TowRequestPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <TowRequestForm />
    </div>
  )
}

