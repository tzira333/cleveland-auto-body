import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const roId = searchParams.get('ro_id')

    if (roId) {
      // Get status metrics for specific repair order
      const { data: metrics, error: metricsError } = await supabase
        .from('status_metrics')
        .select('*')
        .eq('repair_order_id', roId)
        .single()

      if (metricsError && metricsError.code !== 'PGRST116') {
        throw metricsError
      }

      // Get status history for this repair order
      const { data: history, error: historyError } = await supabase
        .from('status_history')
        .select('*')
        .eq('repair_order_id', roId)
        .order('changed_at', { ascending: true })

      if (historyError) {
        throw historyError
      }

      // Get formatted duration report using the database function
      const { data: durationReport, error: reportError } = await supabase
        .rpc('get_status_duration_report', { p_repair_order_id: roId })

      if (reportError && reportError.code !== '42883') {
        // Ignore if function doesn't exist yet
        console.warn('get_status_duration_report function not found:', reportError)
      }

      return NextResponse.json({
        metrics: metrics || null,
        history: history || [],
        durationReport: durationReport || []
      })
    } else {
      // Get all status metrics with repair order details
      const { data: allMetrics, error } = await supabase
        .from('vw_repair_order_status_durations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json({ data: allMetrics || [] })
    }
  } catch (error: any) {
    console.error('Error fetching status metrics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch status metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { repair_order_id, new_status, changed_by, notes } = body

    if (!repair_order_id || !new_status) {
      return NextResponse.json(
        { error: 'repair_order_id and new_status are required' },
        { status: 400 }
      )
    }

    // Get current repair order
    const { data: ro, error: roError } = await supabase
      .from('crm_repair_orders')
      .select('status')
      .eq('id', repair_order_id)
      .single()

    if (roError) {
      throw roError
    }

    // Update repair order status (this will trigger the automatic logging)
    const { error: updateError } = await supabase
      .from('crm_repair_orders')
      .update({ status: new_status })
      .eq('id', repair_order_id)

    if (updateError) {
      throw updateError
    }

    // If notes provided, add to status_history
    if (notes) {
      const { error: notesError } = await supabase
        .from('status_history')
        .update({ notes, changed_by })
        .eq('repair_order_id', repair_order_id)
        .order('changed_at', { ascending: false })
        .limit(1)

      if (notesError) {
        console.warn('Failed to add notes to status history:', notesError)
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Status updated and logged successfully'
    })
  } catch (error: any) {
    console.error('Error updating status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update status' },
      { status: 500 }
    )
  }
}
