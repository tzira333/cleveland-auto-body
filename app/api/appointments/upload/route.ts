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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const appointment_id = formData.get('appointment_id') as string;
    const file_count = parseInt(formData.get('file_count') as string || '0');

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    if (file_count === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`Processing ${file_count} file(s) for appointment ${appointment_id}`);

    const uploadedFiles: any[] = [];
    const errors: string[] = [];

    // Process each file
    for (let i = 0; i < file_count; i++) {
      const file = formData.get(`file_${i}`) as File;
      if (!file) {
        console.warn(`File ${i} not found in form data`);
        continue;
      }

      try {
        // Create unique file name
        const timestamp = Date.now();
        
        // Supabase Storage validation regex (from storage-api):
        // /^(\w|\/|!|\-|\.|\\*|'|\(|\)| |&|\$|@|\=|;|:|\\+|,|\?)*$/
        // Allowed: word chars (\w = a-z, A-Z, 0-9, _), forward slash, and special chars: ! - . * ' ( ) space & $ @ = ; : + , ?
        // 
        // Strategy: Use ONLY safe characters (alphanumeric, hyphen, underscore, dot)
        // Remove ALL other characters to avoid Supabase validation errors
        
        const sanitizedFileName = file.name
          .replace(/[^\w.-]/g, '-')  // Replace any non-word/dot/hyphen with hyphen
          .replace(/\s+/g, '-')       // Replace spaces with hyphens
          .replace(/-{2,}/g, '-')     // Replace multiple hyphens with single
          .replace(/^-+|-+$/g, '')    // Remove leading/trailing hyphens
          .toLowerCase();             // Normalize to lowercase
        
        // Ensure appointment_id is also safe (remove any non-alphanumeric except hyphen/underscore)
        const safeAppointmentId = String(appointment_id).replace(/[^\w-]/g, '');
        
        const fileName = `${safeAppointmentId}/${timestamp}_${sanitizedFileName}`;

        console.log(`Uploading file: ${fileName}`);
        console.log(`Original filename: ${file.name}`);
        console.log(`Sanitized filename: ${sanitizedFileName}`);
        console.log(`File type: ${file.type}`);
        console.log(`File size: ${file.size} bytes`);

        // Validate the path matches Supabase Storage requirements
        // Regex from supabase/storage-api: /^(\w|\/|!|\-|\.|\\*|'|\(|\)| |&|\$|@|\=|;|:|\\+|,|\?)*$/
        const supabasePathRegex = /^(\w|\/|!|\-|\.|\*|'|\(|\)| |&|\$|@|=|;|:|\+|,|\?)*$/;
        if (!supabasePathRegex.test(fileName)) {
          console.error(`Invalid file path for Supabase: ${fileName}`);
          errors.push(`${file.name}: Invalid filename format`);
          continue;
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Try to upload to Supabase Storage
        try {
          // First, ensure the bucket exists
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.some(b => b.name === 'appointment-files');

          if (!bucketExists) {
            console.log('Creating appointment-files bucket...');
            const { error: createError } = await supabase.storage.createBucket('appointment-files', {
              public: true,
              fileSizeLimit: 10485760, // 10MB
            });
            
            if (createError) {
              console.error('Error creating bucket:', createError);
            }
          }

          // Upload the file
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('appointment-files')
            .upload(fileName, buffer, {
              contentType: file.type,
              upsert: false,
            });

          if (uploadError) {
            console.error('File upload error:', uploadError);
            // Provide more specific error messages
            if (uploadError.message.includes('pattern')) {
              errors.push(`${file.name}: Invalid filename format. Please use only letters, numbers, dots, and hyphens.`);
            } else if (uploadError.message.includes('size')) {
              errors.push(`${file.name}: File too large (max 10MB)`);
            } else if (uploadError.message.includes('bucket')) {
              errors.push(`${file.name}: Storage configuration error`);
            } else {
              errors.push(`${file.name}: ${uploadError.message}`);
            }
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('appointment-files')
            .getPublicUrl(fileName);

          console.log(`File uploaded successfully: ${urlData.publicUrl}`);

          // Try to store file metadata in database
          try {
            // Check if appointment_files table exists
            const { error: tableCheckError } = await supabase
              .from('appointment_files')
              .select('id')
              .limit(1);

            if (tableCheckError) {
              console.warn('appointment_files table may not exist:', tableCheckError.message);
              // Store minimal info without database
              uploadedFiles.push({
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                public_url: urlData.publicUrl,
                storage_path: fileName,
              });
            } else {
              // Table exists, insert metadata
              const { data: fileRecord, error: fileError } = await supabase
                .from('appointment_files')
                .insert([
                  {
                    appointment_id,
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
                // Still count as successful upload
                uploadedFiles.push({
                  file_name: file.name,
                  file_type: file.type,
                  file_size: file.size,
                  public_url: urlData.publicUrl,
                  storage_path: fileName,
                });
              } else {
                uploadedFiles.push(fileRecord);
              }
            }
          } catch (metadataError) {
            console.error('Metadata storage error:', metadataError);
            // Still count as successful upload if file is in storage
            uploadedFiles.push({
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              public_url: urlData.publicUrl,
              storage_path: fileName,
            });
          }
        } catch (storageError: any) {
          console.error('Storage error:', storageError);
          errors.push(`${file.name}: Storage error - ${storageError.message}`);
        }
      } catch (fileError: any) {
        console.error(`Error processing file ${i}:`, fileError);
        errors.push(`${file.name}: ${fileError.message}`);
      }
    }

    // Return response
    if (uploadedFiles.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'All file uploads failed', 
          details: errors 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedFiles.length,
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)${errors.length > 0 ? ` (${errors.length} failed)` : ''}`,
    });

  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
