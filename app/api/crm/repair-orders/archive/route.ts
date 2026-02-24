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

// POST - Archive a repair order
export async function POST(request: NextRequest) {
  try {
    const { ro_id, archived_by } = await request.json();

    if (!ro_id) {
      return NextResponse.json(
        { error: 'Repair order ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('crm_repair_orders')
      .update({
        archived: true,
        archived_at: new Date().toISOString(),
        archived_by: archived_by || 'Staff'
      })
      .eq('id', ro_id)
      .select()
      .single();

    if (error) {
      console.error('Error archiving repair order:', error);
      return NextResponse.json(
        { error: 'Failed to archive repair order', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Repair order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Repair order archived successfully',
      repair_order: data
    });
  } catch (error: any) {
    console.error('Error in archive repair order:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Unarchive a repair order
export async function PUT(request: NextRequest) {
  try {
    const { ro_id } = await request.json();

    if (!ro_id) {
      return NextResponse.json(
        { error: 'Repair order ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('crm_repair_orders')
      .update({
        archived: false,
        archived_at: null,
        archived_by: null
      })
      .eq('id', ro_id)
      .select()
      .single();

    if (error) {
      console.error('Error unarchiving repair order:', error);
      return NextResponse.json(
        { error: 'Failed to unarchive repair order', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Repair order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Repair order restored successfully',
      repair_order: data
    });
  } catch (error: any) {
    console.error('Error in unarchive repair order:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
