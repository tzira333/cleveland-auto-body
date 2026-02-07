import { Metadata } from 'next'
import StaffNavigation from './StaffNavigation'

export const metadata: Metadata = {
  title: 'Staff Portal | Domestic and Foreign Auto Body Inc.',
  description: 'Choose between Appointments or BodyShop CRM',
}

export default function StaffPortalPage() {
  return <StaffNavigation />
}
