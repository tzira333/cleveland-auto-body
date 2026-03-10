// Customer-safe API endpoint for viewing appointment details
// Only returns data that customers should see (no staff notes)

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const appointmentId = params.id

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    // Use the customer_appointment_view which filters out staff-only data
    const { data: appointment, error: appointmentError } = await supabase
      .from('customer_appointment_view')
      .select('*')
      .eq('id', appointmentId)
      .single()

    if (appointmentError) {
      console.error('Error fetching appointment:', appointmentError)
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Return customer-safe data only
    return NextResponse.json({
      appointment: {
        id: appointment.id,
        customer_name: appointment.customer_name,
        customer_email: appointment.customer_email,
        customer_phone: appointment.customer_phone,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        duration_minutes: appointment.duration_minutes || null, // Optional field
        service_type: appointment.service_type,
        status: appointment.status,
        notes: appointment.notes, // Customer's own notes
        appointment_type: appointment.appointment_type || 'inquiry', // Default if missing
        created_at: appointment.created_at,
        updated_at: appointment.updated_at,
        shared_notes: appointment.shared_notes || [], // Staff notes marked as customer_visible
      }
    })

  } catch (error) {
    console.error('Error in customer appointment GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

// PUT endpoint for customers to edit their appointments
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const appointmentId = params.id
    const body = await request.json()

    const {
      customer_name,
      customer_email,
      customer_phone,
      appointment_date,
      appointment_time,
      service_type,
      notes,
      edit_reason
    } = body

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    // Verify appointment exists
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, customer_email')
      .eq('id', appointmentId)
      .single()

    if (fetchError || !existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Build update object with only customer-editable fields
    const updateData: any = {
      last_edited_by: customer_email,
      last_edited_at: new Date().toISOString()
    }

    if (customer_name !== undefined) updateData.customer_name = customer_name
    if (customer_email !== undefined) updateData.customer_email = customer_email
    if (customer_phone !== undefined) updateData.customer_phone = customer_phone
    if (appointment_date !== undefined) updateData.appointment_date = appointment_date
    if (appointment_time !== undefined) updateData.appointment_time = appointment_time
    if (service_type !== undefined) updateData.service_type = service_type
    if (notes !== undefined) updateData.notes = notes

    // Update appointment (trigger will automatically log to edit_history)
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating appointment:', updateError)
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      )
    }

    // If edit_reason provided, add it to the latest edit history entry
    if (edit_reason) {
      await supabase
        .from('appointment_edit_history')
        .update({ edit_reason })
        .eq('appointment_id', appointmentId)
        .order('edited_at', { ascending: false })
        .limit(1)
    }

    return NextResponse.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    })

  } catch (error) {
    console.error('Error in customer appointment PUT:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}
