import { Metadata } from 'next'
import RepairRequestForm from './RepairRequestForm'

export const metadata: Metadata = {
  title: 'Express Care Request | Domestic and Foreign Auto Body Inc.',
  description: 'High-priority vehicle repair with 24-hour turnaround. Submit your Express Care Request for fast, quality auto body repair in Cleveland, OH.',
}

export default function RepairRequestPage() {
  return <RepairRequestForm />
}
