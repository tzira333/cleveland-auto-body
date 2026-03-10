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
 * POST /api/appointments/archive
 * Archives an appointment (manually by staff)
 */
export async function POST(request: NextRequest) {
  try {
    const { appointment_id, archived_by, archived_reason } = await request.json();

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'appointment_id is required' },
        { status: 400 }
      );
    }

    // Fetch the appointment first to check for staff_notes column
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

    // Prepare update data
    const updateData: any = {
      archived: true,
      archived_at: new Date().toISOString(),
      archived_by: archived_by || 'Staff',
      archived_reason: archived_reason || 'Manually archived by staff',
      updated_at: new Date().toISOString()
    };

    // Add staff note if column exists
    if ('staff_notes' in appointment) {
      const existingNotes = appointment.staff_notes || '';
      const timestamp = new Date().toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      const archiveNote = `[${timestamp}] Archived by ${archived_by || 'staff'}: ${archived_reason || 'Manually archived'}`;
      updateData.staff_notes = existingNotes 
        ? `${existingNotes}\n\n${archiveNote}`
        : archiveNote;
    }

    // Update the appointment to archived
    const { data: archivedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointment_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to archive appointment', details: updateError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment: archivedAppointment,
      message: 'Appointment archived successfully'
    });

  } catch (error: any) {
    console.error('Error archiving appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments/archive (Unarchive)
 * Unarchives an appointment
 */
export async function DELETE(request: NextRequest) {
  try {
    const { appointment_id, staff_email } = await request.json();

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'appointment_id is required' },
        { status: 400 }
      );
    }

    // Fetch the appointment first to check for staff_notes column
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

    // Prepare update data
    const updateData: any = {
      archived: false,
      archived_at: null,
      archived_by: null,
      archived_reason: null,
      updated_at: new Date().toISOString()
    };

    // Add staff note if column exists
    if ('staff_notes' in appointment) {
      const existingNotes = appointment.staff_notes || '';
      const timestamp = new Date().toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      const unarchiveNote = `[${timestamp}] Unarchived by ${staff_email || 'staff member'}`;
      updateData.staff_notes = existingNotes 
        ? `${existingNotes}\n\n${unarchiveNote}`
        : unarchiveNote;
    }

    // Update the appointment to unarchive
    const { data: unarchivedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointment_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to unarchive appointment', details: updateError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment: unarchivedAppointment,
      message: 'Appointment unarchived successfully'
    });

  } catch (error: any) {
    console.error('Error unarchiving appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
