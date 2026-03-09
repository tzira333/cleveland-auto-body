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
      return NextResponse.json(
        { error: 'Appointment not found', details: fetchError },
        { status: 404 }
      );
    }

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

    // Update the appointment to confirmed
    const updateData: any = {
      appointment_type: 'confirmed',
      status: 'confirmed',
      updated_at: new Date().toISOString()
    };

    // Update date/time if provided
    if (appointment_date) updateData.appointment_date = appointment_date;
    if (appointment_time) updateData.appointment_time = appointment_time;
    if (staff_notes) updateData.staff_notes = staff_notes;

    const { data: confirmedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointment_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to confirm appointment', details: updateError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment: confirmedAppointment,
      message: 'Appointment confirmed successfully'
    });

  } catch (error: any) {
    console.error('Error confirming appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
