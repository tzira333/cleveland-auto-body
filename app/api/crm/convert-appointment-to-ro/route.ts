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
 * POST /api/crm/convert-appointment-to-ro
 * Converts a completed appointment (with or without repair case) to a Repair Order
 * Includes all customer data, vehicle info, insurance info, and documents
 */
export async function POST(request: NextRequest) {
  try {
    const { appointment_id } = await request.json()

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'appointment_id is required' },
        { status: 400 }
      )
    }

    // 1. Fetch appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*, repair_cases(*)')
      .eq('id', appointment_id)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found', details: appointmentError },
        { status: 404 }
      )
    }

    // Check if already converted
    const { data: existingRO } = await supabase
      .from('crm_repair_orders')
      .select('id, ro_number')
      .eq('source_appointment_id', appointment_id)
      .single()

    if (existingRO) {
      return NextResponse.json(
        { 
          error: 'Appointment already converted to repair order', 
          repair_order: existingRO 
        },
        { status: 400 }
      )
    }

    // 2. Parse customer name into first/last
    const nameParts = (appointment.customer_name || '').split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // 3. Get repair case if linked
    const repairCase = appointment.repair_cases

    // 4. Create or find customer in CRM
    let customer
    const { data: existingCustomer } = await supabase
      .from('crm_customers')
      .select('*')
      .eq('phone', appointment.customer_phone)
      .single()

    if (existingCustomer) {
      // Update existing customer with latest info
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('crm_customers')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: appointment.customer_email,
          insurance_company: repairCase?.insurance_carrier || existingCustomer.insurance_company,
          policy_number: repairCase?.insurance_policy_number || existingCustomer.policy_number,
          insurance_claim_number: repairCase?.insurance_claim_number || existingCustomer.insurance_claim_number,
          insurance_adjuster_name: repairCase?.insurance_adjuster_name || existingCustomer.insurance_adjuster_name,
          insurance_adjuster_phone: repairCase?.insurance_adjuster_phone || existingCustomer.insurance_adjuster_phone,
          insurance_adjuster_email: repairCase?.insurance_adjuster_email || existingCustomer.insurance_adjuster_email,
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
          first_name: firstName,
          last_name: lastName,
          email: appointment.customer_email,
          phone: appointment.customer_phone,
          insurance_company: repairCase?.insurance_carrier,
          policy_number: repairCase?.insurance_policy_number,
          insurance_claim_number: repairCase?.insurance_claim_number,
          insurance_adjuster_name: repairCase?.insurance_adjuster_name,
          insurance_adjuster_phone: repairCase?.insurance_adjuster_phone,
          insurance_adjuster_email: repairCase?.insurance_adjuster_email
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

    // 5. Create or find vehicle if repair case has vehicle info
    let vehicle
    if (repairCase && repairCase.vehicle_vin) {
      const { data: existingVehicle } = await supabase
        .from('crm_vehicles')
        .select('*')
        .eq('vin', repairCase.vehicle_vin)
        .single()

      if (existingVehicle) {
        // Update vehicle customer association
        const { data: updatedVehicle } = await supabase
          .from('crm_vehicles')
          .update({
            customer_id: customer.id,
            year: repairCase.vehicle_year?.toString() || existingVehicle.year,
            make: repairCase.vehicle_make || existingVehicle.make,
            model: repairCase.vehicle_model || existingVehicle.model,
            license_plate: repairCase.vehicle_license_plate || existingVehicle.license_plate,
            mileage: repairCase.vehicle_mileage || existingVehicle.mileage,
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
            year: repairCase.vehicle_year?.toString() || '',
            make: repairCase.vehicle_make || '',
            model: repairCase.vehicle_model || '',
            vin: repairCase.vehicle_vin,
            license_plate: repairCase.vehicle_license_plate,
            mileage: repairCase.vehicle_mileage,
            color: ''
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
    } else {
      // No vehicle info - create placeholder
      const { data: newVehicle, error: vehicleError } = await supabase
        .from('crm_vehicles')
        .insert([{
          customer_id: customer.id,
          year: 'Unknown',
          make: 'Unknown',
          model: 'Unknown',
          vin: `PENDING-${Date.now()}`,
          color: ''
        }])
        .select()
        .single()

      if (vehicleError) {
        return NextResponse.json(
          { error: 'Failed to create vehicle placeholder', details: vehicleError },
          { status: 500 }
        )
      }
      vehicle = newVehicle
    }

    // 6. Generate RO number
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

    // 7. Create Repair Order
    const { data: repairOrder, error: roError } = await supabase
      .from('crm_repair_orders')
      .insert([{
        ro_number: roNumber,
        customer_id: customer.id,
        vehicle_id: vehicle.id,
        source_appointment_id: appointment.id,
        source_repair_case_id: repairCase?.id || null,
        status: 'intake',
        priority: 'medium',
        date_received: new Date().toISOString(),
        damage_description: repairCase?.incident_description || appointment.notes || 'Appointment conversion - details pending',
        
        // Customer info (denormalized for quick access)
        customer_first_name: firstName,
        customer_last_name: lastName,
        customer_phone: appointment.customer_phone,
        customer_email: appointment.customer_email,
        customer_address: customer.address || '',
        
        // Vehicle info (denormalized)
        vehicle_year: vehicle.year,
        vehicle_make: vehicle.make,
        vehicle_model: vehicle.model,
        vehicle_vin: vehicle.vin,
        
        // Insurance info
        insurance_carrier: repairCase?.insurance_carrier || customer.insurance_company,
        insurance_claim_number: repairCase?.insurance_claim_number || customer.insurance_claim_number,
        insurance_contact_name: repairCase?.insurance_adjuster_name || customer.insurance_adjuster_name,
        insurance_contact_phone: repairCase?.insurance_adjuster_phone || customer.insurance_adjuster_phone,
        insurance_contact_email: repairCase?.insurance_adjuster_email || customer.insurance_adjuster_email,
        
        // Estimates
        estimated_total_cost: null,
        final_total_cost: null,
        estimated_duration_days: null,
        planned_start_date: null,
        planned_completion_date: null
      }])
      .select()
      .single()

    if (roError) {
      return NextResponse.json(
        { error: 'Failed to create repair order', details: roError },
        { status: 500 }
      )
    }

    // 8. Copy documents/photos if they exist
    if (repairCase) {
      // Fetch appointment files
      const { data: appointmentFiles } = await supabase
        .from('appointment_files')
        .select('*')
        .eq('appointment_id', appointment.id)

      if (appointmentFiles && appointmentFiles.length > 0) {
        const documents = appointmentFiles.map(file => ({
          repair_order_id: repairOrder.id,
          document_type: file.file_type.startsWith('image/') ? 'photo' : 'other',
          document_name: file.file_name,
          document_url: file.public_url,
          description: `Transferred from appointment ${appointment.id}`
        }))

        await supabase
          .from('crm_documents')
          .insert(documents)
      }
    }

    // 9. Update appointment status to mark as converted
    await supabase
      .from('appointments')
      .update({
        staff_notes: `Converted to Repair Order ${roNumber}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointment.id)

    return NextResponse.json({
      success: true,
      repair_order: repairOrder,
      customer: customer,
      vehicle: vehicle,
      message: `Successfully created Repair Order ${roNumber}`
    })

  } catch (error: any) {
    console.error('Error converting appointment to RO:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
