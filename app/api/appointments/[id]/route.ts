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

// DELETE - Soft delete appointment (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { deleted_by } = body;

    if (!deleted_by) {
      return NextResponse.json(
        { error: 'deleted_by is required' },
        { status: 400 }
      );
    }

    // Verify user is admin
    const { data: staffUser } = await supabase
      .from('staff_users')
      .select('role, email')
      .eq('email', deleted_by)
      .single();

    if (!staffUser || (staffUser.role !== 'admin' && staffUser.email !== 'domesticandforeignab@gmail.com')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Soft delete the appointment
    const { data, error } = await supabase
      .from('appointments')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deleted_by
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error soft deleting appointment:', error);
      return NextResponse.json(
        { error: 'Failed to delete appointment', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully',
      data
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
