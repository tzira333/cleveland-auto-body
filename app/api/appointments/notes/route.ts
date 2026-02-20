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

// GET - Fetch all notes for an appointment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointment_id = searchParams.get('appointment_id');

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // First, ensure the appointment_notes table exists
    const { data: notes, error: fetchError } = await supabase
      .from('appointment_notes')
      .select('*')
      .eq('appointment_id', appointment_id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      // If table doesn't exist, return empty array
      if (fetchError.message.includes('does not exist')) {
        console.warn('appointment_notes table does not exist yet');
        return NextResponse.json({ notes: [] });
      }
      throw fetchError;
    }

    return NextResponse.json({ notes: notes || [] });

  } catch (error: any) {
    console.error('Error fetching appointment notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointment_id, note_text, staff_name } = body;

    if (!appointment_id || !note_text) {
      return NextResponse.json(
        { error: 'Appointment ID and note text are required' },
        { status: 400 }
      );
    }

    // Ensure the appointment_notes table exists, create if it doesn't
    try {
      // Try to create the table (will fail silently if it already exists)
      await supabase.rpc('create_appointment_notes_table_if_not_exists', {});
    } catch (e) {
      // Table might already exist or RPC function not available
      // We'll try to insert anyway
    }

    const { data: note, error: insertError } = await supabase
      .from('appointment_notes')
      .insert([
        {
          appointment_id,
          note_text,
          staff_name: staff_name || 'Staff',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      // If table doesn't exist, try to create it using raw SQL
      if (insertError.message.includes('does not exist')) {
        console.log('Creating appointment_notes table...');
        
        // Create table using raw SQL
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS appointment_notes (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
              note_text TEXT NOT NULL,
              staff_name TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_appointment_notes_appointment_id 
            ON appointment_notes(appointment_id);
            
            CREATE INDEX IF NOT EXISTS idx_appointment_notes_created_at 
            ON appointment_notes(created_at DESC);
          `
        });

        if (createError) {
          console.warn('Could not create table via RPC:', createError);
          // Return a helpful message
          return NextResponse.json(
            { 
              error: 'Database table not initialized',
              message: 'Please contact your administrator to set up the appointment_notes table',
              sqlNeeded: true
            },
            { status: 503 }
          );
        }

        // Retry the insert
        const { data: retryNote, error: retryError } = await supabase
          .from('appointment_notes')
          .insert([
            {
              appointment_id,
              note_text,
              staff_name: staff_name || 'Staff',
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (retryError) throw retryError;
        return NextResponse.json({ note: retryNote });
      }
      
      throw insertError;
    }

    return NextResponse.json({ note });

  } catch (error: any) {
    console.error('Error creating appointment note:', error);
    return NextResponse.json(
      { error: 'Failed to create note', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update an existing note
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { note_id, note_text } = body;

    if (!note_id || !note_text) {
      return NextResponse.json(
        { error: 'Note ID and note text are required' },
        { status: 400 }
      );
    }

    const { data: note, error: updateError } = await supabase
      .from('appointment_notes')
      .update({
        note_text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', note_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ note });

  } catch (error: any) {
    console.error('Error updating appointment note:', error);
    return NextResponse.json(
      { error: 'Failed to update note', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a note
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const note_id = searchParams.get('note_id');

    if (!note_id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('appointment_notes')
      .delete()
      .eq('id', note_id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error deleting appointment note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note', details: error.message },
      { status: 500 }
    );
  }
}
