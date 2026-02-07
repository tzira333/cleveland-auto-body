import { Metadata } from 'next'
import StaffAuthCheck from '../StaffAuthCheck'
import StaffDashboard from '../StaffDashboard'

export const metadata: Metadata = {
  title: 'Appointments | Staff Portal',
  description: 'Manage appointments and customer requests',
}

export default function AppointmentsPage() {
  return (
    <StaffAuthCheck>
      <StaffDashboard />
    </StaffAuthCheck>
  )
}
