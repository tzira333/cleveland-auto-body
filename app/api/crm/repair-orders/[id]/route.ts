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

// GET - Fetch single repair order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('crm_repair_orders')
      .select(`
        *,
        customer:crm_customers(*),
        vehicle:crm_vehicles(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching repair order:', error);
      return NextResponse.json(
        { error: 'Failed to fetch repair order', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Repair order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ repair_order: data });
  } catch (error: any) {
    console.error('Error in GET repair order:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update repair order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();
    const { edited_by, ...roUpdates } = updates;

    // Get current RO data for history tracking
    const { data: currentRO, error: fetchError } = await supabase
      .from('crm_repair_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching current RO:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch repair order', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!currentRO) {
      return NextResponse.json(
        { error: 'Repair order not found' },
        { status: 404 }
      );
    }

    // Update the repair order
    const { data, error } = await supabase
      .from('crm_repair_orders')
      .update({
        ...roUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating repair order:', error);
      return NextResponse.json(
        { error: 'Failed to update repair order', details: error.message },
        { status: 500 }
      );
    }

    // Log changes to edit history
    if (currentRO) {
      const edits = [];
      for (const [key, newValue] of Object.entries(roUpdates)) {
        const oldValue = currentRO[key];
        if (oldValue !== newValue && key !== 'updated_at') {
          edits.push({
            repair_order_id: id,
            field_name: key,
            old_value: oldValue ? String(oldValue) : null,
            new_value: newValue ? String(newValue) : null,
            edited_by: edited_by || 'Staff'
          });
        }
      }

      if (edits.length > 0) {
        const { error: historyError } = await supabase
          .from('crm_repair_order_edits')
          .insert(edits);

        if (historyError) {
          console.warn('Failed to log edit history:', historyError);
          // Don't fail the update if history logging fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      repair_order: data,
      message: 'Repair order updated successfully'
    });
  } catch (error: any) {
    console.error('Error in PUT repair order:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Archive repair order (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const archived_by = searchParams.get('archived_by') || 'Staff';

    const { data, error } = await supabase
      .from('crm_repair_orders')
      .update({
        archived: true,
        archived_at: new Date().toISOString(),
        archived_by
      })
      .eq('id', id)
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
    console.error('Error in DELETE repair order:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
