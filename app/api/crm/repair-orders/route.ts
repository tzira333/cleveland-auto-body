import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * POST /api/crm/repair-orders
 * Creates a new repair order manually with all required information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      // Customer info
      customer_first_name,
      customer_last_name,
      customer_phone,
      customer_address,
      customer_email,
      
      // Vehicle info
      vehicle_year,
      vehicle_make,
      vehicle_model,
      vehicle_vin,
      vehicle_color,
      vehicle_license_plate,
      vehicle_mileage,
      
      // Insurance info (optional)
      insurance_carrier,
      insurance_claim_number,
      insurance_contact_name,
      insurance_contact_phone,
      insurance_contact_email,
      insurance_policy_number,
      
      // Repair order details
      damage_description,
      estimated_total_cost,
      estimated_duration_days,
      planned_start_date,
      priority,
      
      // Parts list (optional)
      parts_list
    } = body

    // Validation
    if (!customer_first_name || !customer_last_name || !customer_phone) {
      return NextResponse.json(
        { error: 'Customer first name, last name, and phone are required' },
        { status: 400 }
      )
    }

    if (!vehicle_year || !vehicle_make || !vehicle_model || !vehicle_vin) {
      return NextResponse.json(
        { error: 'Vehicle year, make, model, and VIN are required' },
        { status: 400 }
      )
    }

    if (!damage_description) {
      return NextResponse.json(
        { error: 'Damage description is required' },
        { status: 400 }
      )
    }

    // Normalize phone number
    const normalizedPhone = customer_phone.replace(/\D/g, '')

    // 1. Create or find customer
    let customer
    const { data: existingCustomer } = await supabase
      .from('crm_customers')
      .select('*')
      .eq('phone', normalizedPhone)
      .single()

    if (existingCustomer) {
      // Update existing customer with latest info
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('crm_customers')
        .update({
          first_name: customer_first_name,
          last_name: customer_last_name,
          email: customer_email,
          address: customer_address,
          insurance_company: insurance_carrier || existingCustomer.insurance_company,
          policy_number: insurance_policy_number || existingCustomer.policy_number,
          insurance_claim_number: insurance_claim_number || existingCustomer.insurance_claim_number,
          insurance_adjuster_name: insurance_contact_name || existingCustomer.insurance_adjuster_name,
          insurance_adjuster_phone: insurance_contact_phone || existingCustomer.insurance_adjuster_phone,
          insurance_adjuster_email: insurance_contact_email || existingCustomer.insurance_adjuster_email,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating customer:', updateError)
        customer = existingCustomer
      } else {
        customer = updatedCustomer
      }
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('crm_customers')
        .insert([{
          first_name: customer_first_name,
          last_name: customer_last_name,
          email: customer_email,
          phone: normalizedPhone,
          address: customer_address,
          insurance_company: insurance_carrier,
          policy_number: insurance_policy_number,
          insurance_claim_number: insurance_claim_number,
          insurance_adjuster_name: insurance_contact_name,
          insurance_adjuster_phone: insurance_contact_phone,
          insurance_adjuster_email: insurance_contact_email
        }])
        .select()
        .single()

      if (customerError) {
        return NextResponse.json(
          { error: 'Failed to create customer', details: customerError },
          { status: 500 }
        )
      }
      customer = newCustomer
    }

    // 2. Create or find vehicle
    let vehicle
    const { data: existingVehicle } = await supabase
      .from('crm_vehicles')
      .select('*')
      .eq('vin', vehicle_vin)
      .single()

    if (existingVehicle) {
      // Update vehicle customer association
      const { data: updatedVehicle } = await supabase
        .from('crm_vehicles')
        .update({
          customer_id: customer.id,
          year: vehicle_year,
          make: vehicle_make,
          model: vehicle_model,
          color: vehicle_color || existingVehicle.color,
          license_plate: vehicle_license_plate || existingVehicle.license_plate,
          mileage: vehicle_mileage || existingVehicle.mileage,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingVehicle.id)
        .select()
        .single()

      vehicle = updatedVehicle || existingVehicle
    } else {
      // Create new vehicle
      const { data: newVehicle, error: vehicleError } = await supabase
        .from('crm_vehicles')
        .insert([{
          customer_id: customer.id,
          year: vehicle_year,
          make: vehicle_make,
          model: vehicle_model,
          vin: vehicle_vin,
          color: vehicle_color || '',
          license_plate: vehicle_license_plate,
          mileage: vehicle_mileage
        }])
        .select()
        .single()

      if (vehicleError) {
        return NextResponse.json(
          { error: 'Failed to create vehicle', details: vehicleError },
          { status: 500 }
        )
      }
      vehicle = newVehicle
    }

    // 3. Generate RO number
    let roNumber: string
    
    // Try to use the database function first
    const { data: roNumberData, error: roNumberError } = await supabase
      .rpc('generate_ro_number')

    if (roNumberError || !roNumberData) {
      // Fallback: Generate RO number manually
      console.log('RPC function failed, using fallback RO number generation:', roNumberError)
      
      // Get the highest existing RO number
      const { data: existingROs } = await supabase
        .from('crm_repair_orders')
        .select('ro_number')
        .ilike('ro_number', 'RO-%')
        .order('ro_number', { ascending: false })
        .limit(1)
      
      let nextNumber = 1
      if (existingROs && existingROs.length > 0) {
        const lastRO = existingROs[0].ro_number
        const match = lastRO.match(/RO-(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1
        }
      }
      
      roNumber = `RO-${String(nextNumber).padStart(5, '0')}`
    } else {
      roNumber = roNumberData
    }

    // 4. Calculate planned completion date if start date and duration provided
    let plannedCompletionDate = null
    if (planned_start_date && estimated_duration_days) {
      const startDate = new Date(planned_start_date)
      startDate.setDate(startDate.getDate() + estimated_duration_days)
      plannedCompletionDate = startDate.toISOString().split('T')[0]
    }

    // 5. Create Repair Order
    const { data: repairOrder, error: roError } = await supabase
      .from('crm_repair_orders')
      .insert([{
        ro_number: roNumber,
        customer_id: customer.id,
        vehicle_id: vehicle.id,
        status: 'intake',
        priority: priority || 'medium',
        date_received: new Date().toISOString(),
        damage_description: damage_description,
        
        // Customer info (denormalized)
        customer_first_name: customer_first_name,
        customer_last_name: customer_last_name,
        customer_phone: normalizedPhone,
        customer_email: customer_email,
        customer_address: customer_address,
        
        // Vehicle info (denormalized)
        vehicle_year: vehicle_year,
        vehicle_make: vehicle_make,
        vehicle_model: vehicle_model,
        vehicle_vin: vehicle_vin,
        
        // Insurance info
        insurance_carrier: insurance_carrier,
        insurance_claim_number: insurance_claim_number,
        insurance_contact_name: insurance_contact_name,
        insurance_contact_phone: insurance_contact_phone,
        insurance_contact_email: insurance_contact_email,
        
        // Estimates and planning
        estimated_total_cost: estimated_total_cost,
        final_total_cost: null,
        estimated_duration_days: estimated_duration_days,
        planned_start_date: planned_start_date,
        planned_completion_date: plannedCompletionDate,
        estimated_completion: plannedCompletionDate ? new Date(plannedCompletionDate).toISOString() : null
      }])
      .select()
      .single()

    if (roError) {
      return NextResponse.json(
        { error: 'Failed to create repair order', details: roError },
        { status: 500 }
      )
    }

    // 6. Add parts list if provided
    if (parts_list && Array.isArray(parts_list) && parts_list.length > 0) {
      const partsToInsert = parts_list.map(part => ({
        repair_order_id: repairOrder.id,
        part_name: part.part_name,
        part_number: part.part_number,
        quantity: part.quantity || 1,
        estimated_cost: part.estimated_cost,
        notes: part.notes,
        status: 'required'
      }))

      const { error: partsError } = await supabase
        .from('crm_repair_order_parts_list')
        .insert(partsToInsert)

      if (partsError) {
        console.error('Error adding parts list:', partsError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      repair_order: repairOrder,
      customer: customer,
      vehicle: vehicle,
      message: `Successfully created Repair Order ${roNumber}`
    })

  } catch (error: any) {
    console.error('Error creating repair order:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/crm/repair-orders
 * Fetches all repair orders with customer and vehicle info
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const ro_number = searchParams.get('ro_number')

    let query = supabase
      .from('crm_repair_orders')
      .select(`
        *,
        customer:crm_customers(*),
        vehicle:crm_vehicles(*),
        parts:crm_repair_order_parts_list(*)
      `)
      .order('date_received', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (ro_number) {
      query = query.eq('ro_number', ro_number)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch repair orders', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ repair_orders: data })

  } catch (error: any) {
    console.error('Error fetching repair orders:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
