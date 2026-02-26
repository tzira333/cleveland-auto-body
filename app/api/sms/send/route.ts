import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Twilio configuration - add these to your Vercel environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SendSMSRequest {
  to: string;
  message: string;
  messageType: 'staff_notification' | 'customer_update' | 'manual';
  relatedAppointmentId?: string;
  relatedRoId?: string;
  sentBy?: string;
}

// Helper function to format phone number for Twilio (E.164 format)
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it's a 10-digit US number, add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // If it already has country code
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  // If it already has +
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Default: assume US number
  return `+1${cleaned}`;
}

// Check if customer has opted out of SMS
async function checkOptOutStatus(phoneNumber: string): Promise<boolean> {
  const { data } = await supabase
    .from('customer_sms_preferences')
    .select('opted_in')
    .eq('phone_number', phoneNumber)
    .single();
  
  return data ? data.opted_in : true; // Default to opted in if no record
}

// Send SMS via Twilio
async function sendTwilioSMS(to: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const params = new URLSearchParams();
    params.append('To', formatPhoneNumber(to));
    params.append('From', formatPhoneNumber(TWILIO_PHONE_NUMBER));
    params.append('Body', message);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to send SMS'
      };
    }
    
    return {
      success: true,
      sid: data.sid
    };
  } catch (error: any) {
    console.error('Twilio API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS'
    };
  }
}

// Log SMS to database
async function logSMS(
  to: string,
  message: string,
  messageType: string,
  status: string,
  twilioSid?: string,
  errorMessage?: string,
  relatedAppointmentId?: string,
  relatedRoId?: string,
  sentBy?: string
) {
  await supabase.from('sms_logs').insert({
    to_phone: to,
    from_phone: TWILIO_PHONE_NUMBER,
    message_body: message,
    message_type: messageType,
    status,
    twilio_sid: twilioSid,
    error_message: errorMessage,
    related_appointment_id: relatedAppointmentId,
    related_ro_id: relatedRoId,
    sent_by: sentBy
  });
}

// POST - Send SMS
export async function POST(request: NextRequest) {
  try {
    const body: SendSMSRequest = await request.json();
    const { to, message, messageType, relatedAppointmentId, relatedRoId, sentBy } = body;
    
    // Validate required fields
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }
    
    // Validate Twilio credentials
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Twilio credentials not configured');
      return NextResponse.json(
        { error: 'SMS service not configured. Please add Twilio credentials to environment variables.' },
        { status: 500 }
      );
    }
    
    // Check if customer has opted out (only for customer messages)
    if (messageType === 'customer_update') {
      const optedIn = await checkOptOutStatus(to);
      if (!optedIn) {
        await logSMS(to, message, messageType, 'failed', undefined, 'Customer opted out', relatedAppointmentId, relatedRoId, sentBy);
        return NextResponse.json(
          { error: 'Customer has opted out of SMS notifications' },
          { status: 400 }
        );
      }
    }
    
    // Send SMS via Twilio
    const result = await sendTwilioSMS(to, message);
    
    if (!result.success) {
      await logSMS(to, message, messageType, 'failed', undefined, result.error, relatedAppointmentId, relatedRoId, sentBy);
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS' },
        { status: 500 }
      );
    }
    
    // Log success
    await logSMS(to, message, messageType, 'sent', result.sid, undefined, relatedAppointmentId, relatedRoId, sentBy);
    
    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      twilioSid: result.sid
    });
    
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch SMS logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointment_id');
    const roId = searchParams.get('ro_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query = supabase
      .from('sms_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (appointmentId) {
      query = query.eq('related_appointment_id', appointmentId);
    }
    
    if (roId) {
      query = query.eq('related_ro_id', roId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch SMS logs', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ logs: data });
    
  } catch (error: any) {
    console.error('Error fetching SMS logs:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
