// API endpoint for staff to create repair order notes with customer visibility control

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const {
      repair_order_id,
      note_text,
      customer_visible = false, // Default to staff-only
      created_by
    } = body

    // Validation
    if (!repair_order_id || !note_text || !created_by) {
      return NextResponse.json(
        { error: 'Missing required fields: repair_order_id, note_text, created_by' },
        { status: 400 }
      )
    }

    // Verify repair order exists
    const { data: repairOrder, error: roError } = await supabase
      .from('repair_orders')
      .select('id')
      .eq('id', repair_order_id)
      .single()

    if (roError || !repairOrder) {
      return NextResponse.json(
        { error: 'Repair order not found' },
        { status: 404 }
      )
    }

    // Insert note
    const { data: note, error: noteError } = await supabase
      .from('repair_order_notes')
      .insert({
        repair_order_id,
        note_text,
        customer_visible,
        created_by
      })
      .select()
      .single()

    if (noteError) {
      console.error('Error creating repair order note:', noteError)
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Note created successfully',
      note
    })

  } catch (error) {
    console.error('Error in repair order notes POST:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}

// GET all notes for a repair order (staff view)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const repairOrderId = searchParams.get('repair_order_id')

    if (!repairOrderId) {
      return NextResponse.json(
        { error: 'repair_order_id query parameter is required' },
        { status: 400 }
      )
    }

    const { data: notes, error } = await supabase
      .from('repair_order_notes')
      .select('*')
      .eq('repair_order_id', repairOrderId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching repair order notes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ notes })

  } catch (error) {
    console.error('Error in repair order notes GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}
