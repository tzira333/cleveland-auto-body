import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/appointments/confirm
 * Converts a service inquiry to a confirmed appointment
 */
export async function POST(request: NextRequest) {
  try {
    const { appointment_id, appointment_date, appointment_time, staff_notes } = await request.json();

    console.log('Confirm appointment request:', { appointment_id, appointment_date, appointment_time });

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'appointment_id is required' },
        { status: 400 }
      );
    }

    // Fetch the appointment to verify it exists and is an inquiry
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointment_id)
      .single();

    if (fetchError || !appointment) {
      console.error('Appointment fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Appointment not found', details: fetchError },
        { status: 404 }
      );
    }

    console.log('Found appointment:', appointment);

    // Check if appointment_type column exists (for backward compatibility)
    const hasAppointmentType = 'appointment_type' in appointment;
    
    if (hasAppointmentType) {
      // Check if it's already confirmed
      if (appointment.appointment_type === 'confirmed') {
        return NextResponse.json(
          { error: 'Appointment is already confirmed', appointment },
          { status: 400 }
        );
      }

      // Check if it's archived
      if (appointment.archived) {
        return NextResponse.json(
          { error: 'Cannot confirm an archived appointment', appointment },
          { status: 400 }
        );
      }
    }

    // Update the appointment to confirmed
    const updateData: any = {
      status: 'confirmed',
      updated_at: new Date().toISOString()
    };

    // Add appointment_type if the column exists
    if (hasAppointmentType) {
      updateData.appointment_type = 'confirmed';
    }

    // Update date/time if provided
    if (appointment_date) updateData.appointment_date = appointment_date;
    if (appointment_time) updateData.appointment_time = appointment_time;
    if (staff_notes) updateData.staff_notes = staff_notes;

    console.log('Updating appointment with:', updateData);

    const { data: confirmedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointment_id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to confirm appointment', details: updateError },
        { status: 500 }
      );
    }

    console.log('Appointment confirmed successfully:', confirmedAppointment);

    return NextResponse.json({
      success: true,
      appointment: confirmedAppointment,
      message: 'Appointment confirmed successfully'
    });

  } catch (error: any) {
    console.error('Error confirming appointment:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
