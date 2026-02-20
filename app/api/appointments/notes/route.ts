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

    // Ensure table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('appointment_notes')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Creating appointment_notes table...');
      
      // Note: In production, use migrations. This is a fallback.
      const { error: createError } = await supabase.rpc('create_appointment_notes_table', {});
      
      if (createError) {
        console.warn('Could not create table automatically:', createError);
        return NextResponse.json({
          notes: [],
          message: 'Notes table not yet created. Please run database migrations.'
        });
      }
    }

    // Fetch notes
    const { data: notes, error: fetchError } = await supabase
      .from('appointment_notes')
      .select('*')
      .eq('appointment_id', appointment_id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching notes:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch notes', details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notes: notes || [],
      count: notes?.length || 0
    });

  } catch (error: any) {
    console.error('Notes GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointment_id, note_text, staff_name } = body;

    // Validation
    if (!appointment_id || !note_text || !staff_name) {
      return NextResponse.json(
        { error: 'Missing required fields: appointment_id, note_text, staff_name' },
        { status: 400 }
      );
    }

    if (note_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Note text cannot be empty' },
        { status: 400 }
      );
    }

    // Insert note
    const { data: note, error: insertError } = await supabase
      .from('appointment_notes')
      .insert([
        {
          appointment_id,
          note_text: note_text.trim(),
          staff_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating note:', insertError);
      return NextResponse.json(
        { error: 'Failed to create note', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      note,
      message: 'Note added successfully'
    });

  } catch (error: any) {
    console.error('Notes POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update an existing note
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { note_id, note_text } = body;

    // Validation
    if (!note_id || !note_text) {
      return NextResponse.json(
        { error: 'Missing required fields: note_id, note_text' },
        { status: 400 }
      );
    }

    if (note_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Note text cannot be empty' },
        { status: 400 }
      );
    }

    // Update note
    const { data: note, error: updateError } = await supabase
      .from('appointment_notes')
      .update({
        note_text: note_text.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', note_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating note:', updateError);
      return NextResponse.json(
        { error: 'Failed to update note', details: updateError.message },
        { status: 500 }
      );
    }

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      note,
      message: 'Note updated successfully'
    });

  } catch (error: any) {
    console.error('Notes PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
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

    // Delete note
    const { error: deleteError } = await supabase
      .from('appointment_notes')
      .delete()
      .eq('id', note_id);

    if (deleteError) {
      console.error('Error deleting note:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete note', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error: any) {
    console.error('Notes DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
