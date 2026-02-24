import { Metadata } from 'next'
import StaffAuthCheck from '../StaffAuthCheck'
import CRMDashboard from './CRMDashboard'

export const metadata: Metadata = {
  title: 'BodyShop Workflow | Staff Portal',
  description: 'Complete repair workflow management system',
}

export default function CRMPage() {
  return (
    <StaffAuthCheck>
      <CRMDashboard />
    </StaffAuthCheck>
  )
}
