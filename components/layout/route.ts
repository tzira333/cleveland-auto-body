import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Modern Next.js 14 configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const customer_name = formData.get('customer_name') as string;
    const customer_phone = formData.get('customer_phone') as string;
    const customer_email = formData.get('customer_email') as string;
    const service_type = formData.get('service_type') as string;
    const vehicle_info = formData.get('vehicle_info') as string;
    const damage_description = formData.get('damage_description') as string;
    const appointment_date = formData.get('appointment_date') as string;
    const appointment_time = formData.get('appointment_time') as string;
    const status = formData.get('status') as string || 'pending';
    const file_count = parseInt(formData.get('file_count') as string || '0');

    // Validate required fields
    if (!customer_name || !customer_phone || !service_type || !vehicle_info) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert appointment record
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert([
        {
          customer_name,
          customer_phone,
          customer_email,
          service_type,
          vehicle_info,
          damage_description,
          appointment_date,
          appointment_time,
          status,
        },
      ])
      .select()
      .single();

    if (appointmentError) {
      console.error('Appointment insert error:', appointmentError);
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }

    const appointmentId = appointment.id;
    const uploadedFiles: any[] = [];

    // Process file uploads if any
    if (file_count > 0) {
      for (let i = 0; i < file_count; i++) {
        const file = formData.get(`file_${i}`) as File;
        if (!file) continue;

        try {
          // Create unique file name
          const timestamp = Date.now();
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileName = `${appointmentId}/${timestamp}_${sanitizedFileName}`;

          // Convert file to buffer
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('appointment-files')
            .upload(fileName, buffer, {
              contentType: file.type,
              upsert: false,
            });

          if (uploadError) {
            console.error('File upload error:', uploadError);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('appointment-files')
            .getPublicUrl(fileName);

          // Store file metadata in database
          const { data: fileRecord, error: fileError } = await supabase
            .from('appointment_files')
            .insert([
              {
                appointment_id: appointmentId,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                storage_path: fileName,
                public_url: urlData.publicUrl,
              },
            ])
            .select()
            .single();

          if (fileError) {
            console.error('File metadata insert error:', fileError);
          } else {
            uploadedFiles.push(fileRecord);
          }
        } catch (fileError) {
          console.error(`Error processing file ${i}:`, fileError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      appointment,
      uploadedFiles,
      message: 'Appointment created successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Normalize phone number (remove all non-digits)
    const normalizedPhone = phone.replace(/\D/g, '');

    // Query appointments by phone
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        appointment_files (
          id,
          file_name,
          file_type,
          file_size,
          public_url,
          created_at
        )
      `)
      .or(`customer_phone.eq.${phone},customer_phone.eq.${normalizedPhone}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
