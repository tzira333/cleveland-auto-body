import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

// POST - Archive an appointment
export async function POST(request: NextRequest) {
  try {
    const { appointment_id, archived_by } = await request.json();

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({
        archived: true,
        archived_at: new Date().toISOString(),
        archived_by: archived_by || 'Staff'
      })
      .eq('id', appointment_id)
      .select()
      .single();

    if (error) {
      console.error('Error archiving appointment:', error);
      return NextResponse.json(
        { error: 'Failed to archive appointment', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment archived successfully',
      appointment: data
    });
  } catch (error: any) {
    console.error('Error in archive appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Unarchive an appointment
export async function PUT(request: NextRequest) {
  try {
    const { appointment_id } = await request.json();

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({
        archived: false,
        archived_at: null,
        archived_by: null
      })
      .eq('id', appointment_id)
      .select()
      .single();

    if (error) {
      console.error('Error unarchiving appointment:', error);
      return NextResponse.json(
        { error: 'Failed to unarchive appointment', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment restored successfully',
      appointment: data
    });
  } catch (error: any) {
    console.error('Error in unarchive appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
