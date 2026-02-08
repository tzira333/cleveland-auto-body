import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { auth_user_id, email, full_name, phone } = body

    // Validation
    if (!auth_user_id || !email || !full_name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if customer user already exists
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('customer_users')
      .select('id')
      .eq('auth_user_id', auth_user_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Customer account already exists' },
        { status: 409 }
      )
    }

    // Create customer_users record
    const { data, error } = await supabaseAdmin
      .from('customer_users')
      .insert({
        auth_user_id,
        email,
        full_name,
        phone,
        is_active: true,
        email_verified: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating customer_users record:', error)
      return NextResponse.json(
        { error: 'Failed to create customer account' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, customer: data }, { status: 201 })

  } catch (error: any) {
    console.error('Customer registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
