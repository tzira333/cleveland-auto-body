import { NextRequest, NextResponse } from 'next/server'
import { sendStaffSMS } from '@/lib/notifications/sms'
import { sendStaffEmail } from '@/lib/notifications/email'

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    // Verify API key (simple protection)
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    switch (type) {
      case 'new_repair_case':
        await notifyNewRepairCase(data)
        break
      case 'new_appointment':
        await notifyNewAppointment(data)
        break
      case 'new_tow_request':
        await notifyNewTowRequest(data)
        break
      case 'appointment_confirmed':
        await notifyAppointmentConfirmed(data)
        break
      case 'appointment_cancelled':
        await notifyAppointmentCancelled(data)
        break
      default:
        return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}

async function notifyNewRepairCase(data: any) {
  const smsBody = `🚗 NEW REPAIR CASE
Case: ${data.case_number}
Customer: ${data.customer_name}
Vehicle: ${data.vehicle_year || ''} ${data.vehicle_make || ''} ${data.vehicle_model || ''}
Phone: ${data.customer_phone}
View: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/cases/${data.id}`

  const emailHtml = `
    <h2>New Repair Case Submitted</h2>
    <p><strong>Case Number:</strong> ${data.case_number}</p>
    <p><strong>Customer:</strong> ${data.customer_name}</p>
    <p><strong>Email:</strong> ${data.customer_email}</p>
    <p><strong>Phone:</strong> ${data.customer_phone}</p>
    <p><strong>Vehicle:</strong> ${data.vehicle_year || ''} ${data.vehicle_make || ''} ${data.vehicle_model || ''}</p>
    ${data.incident_description ? `<p><strong>Description:</strong> ${data.incident_description}</p>` : ''}
    <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/cases/${data.id}">View Case Details</a></p>
  `

  await Promise.all([
    sendStaffSMS(smsBody),
    sendStaffEmail('New Repair Case Submitted', emailHtml),
  ])
}

async function notifyNewAppointment(data: any) {
  const smsBody = `📅 NEW APPOINTMENT REQUEST
Date: ${data.appointment_date} at ${data.appointment_time}
Customer: ${data.customer_name}
Service: ${data.service_type}
Phone: ${data.customer_phone}
View: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/appointments/${data.id}`

  const emailHtml = `
    <h2>New Appointment Request</h2>
    <p><strong>Date:</strong> ${data.appointment_date}</p>
    <p><strong>Time:</strong> ${data.appointment_time}</p>
    <p><strong>Customer:</strong> ${data.customer_name}</p>
    <p><strong>Email:</strong> ${data.customer_email}</p>
    <p><strong>Phone:</strong> ${data.customer_phone}</p>
    <p><strong>Service Type:</strong> ${data.service_type}</p>
    ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
    <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/appointments/${data.id}">View Appointment</a></p>
  `

  await Promise.all([
    sendStaffSMS(smsBody),
    sendStaffEmail('New Appointment Request', emailHtml),
  ])
}

async function notifyNewTowRequest(data: any) {
  const smsBody = `🚛 NEW TOW REQUEST
Customer: ${data.customer_name}
Phone: ${data.customer_phone}
Location: ${data.pickup_address}, ${data.pickup_city}, ${data.pickup_state}
Vehicle: ${data.vehicle_year || ''} ${data.vehicle_make || ''} ${data.vehicle_model || ''}
Condition: ${data.vehicle_condition}
View: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/tow-requests/${data.id}`

  const emailHtml = `
    <h2>New Tow Request</h2>
    <p><strong>Customer:</strong> ${data.customer_name}</p>
    <p><strong>Phone:</strong> ${data.customer_phone}</p>
    <h3>Pickup Location:</h3>
    <p>
      ${data.pickup_address}<br>
      ${data.pickup_city}, ${data.pickup_state} ${data.pickup_zip}
    </p>
    ${data.pickup_location_notes ? `<p><strong>Location Notes:</strong> ${data.pickup_location_notes}</p>` : ''}
    <h3>Vehicle:</h3>
    <p>${data.vehicle_year || ''} ${data.vehicle_make || ''} ${data.vehicle_model || ''}</p>
    <p><strong>Color:</strong> ${data.vehicle_color || 'N/A'}</p>
    <p><strong>Condition:</strong> ${data.vehicle_condition}</p>
    ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
    <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/tow-requests/${data.id}">View Tow Request</a></p>
  `

  await Promise.all([
    sendStaffSMS(smsBody),
    sendStaffEmail('New Tow Request', emailHtml),
  ])
}

async function notifyAppointmentConfirmed(data: any) {
  const smsBody = `✅ APPOINTMENT CONFIRMED
Date: ${data.appointment_date} at ${data.appointment_time}
Customer: ${data.customer_name}
Service: ${data.service_type}`

  const emailHtml = `
    <h2>Appointment Confirmed</h2>
    <p><strong>Date:</strong> ${data.appointment_date}</p>
    <p><strong>Time:</strong> ${data.appointment_time}</p>
    <p><strong>Customer:</strong> ${data.customer_name}</p>
    <p><strong>Service Type:</strong> ${data.service_type}</p>
  `

  await Promise.all([
    sendStaffSMS(smsBody),
    sendStaffEmail('Appointment Confirmed', emailHtml),
  ])
}

async function notifyAppointmentCancelled(data: any) {
  const smsBody = `❌ APPOINTMENT CANCELLED
Date: ${data.appointment_date} at ${data.appointment_time}
Customer: ${data.customer_name}
${data.cancellation_reason ? `Reason: ${data.cancellation_reason}` : ''}`

  const emailHtml = `
    <h2>Appointment Cancelled</h2>
    <p><strong>Date:</strong> ${data.appointment_date}</p>
    <p><strong>Time:</strong> ${data.appointment_time}</p>
    <p><strong>Customer:</strong> ${data.customer_name}</p>
    ${data.cancellation_reason ? `<p><strong>Reason:</strong> ${data.cancellation_reason}</p>` : ''}
  `

  await Promise.all([
    sendStaffSMS(smsBody),
    sendStaffEmail('Appointment Cancelled', emailHtml),
  ])
}
