import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TemplateVariables {
  [key: string]: string;
}

// Replace template variables with actual values
function fillTemplate(template: string, variables: TemplateVariables): string {
  let message = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    message = message.replace(new RegExp(placeholder, 'g'), value || 'N/A');
  }
  
  return message;
}

// Get SMS template from database
async function getTemplate(templateName: string): Promise<string | null> {
  const { data } = await supabase
    .from('sms_templates')
    .select('message_template')
    .eq('template_name', templateName)
    .eq('is_active', true)
    .single();
  
  return data?.message_template || null;
}

// Get active staff phone numbers for notifications
async function getStaffNotificationPhones(notificationType: 'appointments' | 'tow_requests' | 'urgent_ros'): Promise<string[]> {
  const column = 
    notificationType === 'appointments' ? 'notify_new_appointments' :
    notificationType === 'tow_requests' ? 'notify_new_tow_requests' :
    'notify_urgent_ros';
  
  const { data } = await supabase
    .from('staff_sms_settings')
    .select('phone_number')
    .eq('is_active', true)
    .eq(column, true);
  
  return data?.map(s => s.phone_number) || [];
}

// Send SMS to multiple recipients
async function sendBulkSMS(phoneNumbers: string[], message: string, messageType: string, relatedId?: string) {
  const promises = phoneNumbers.map(phone => 
    fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phone,
        message,
        messageType,
        ...(messageType === 'staff_notification' && relatedId ? { relatedAppointmentId: relatedId } : {}),
        ...(messageType === 'customer_update' && relatedId ? { relatedRoId: relatedId } : {})
      })
    })
  );
  
  const results = await Promise.allSettled(promises);
  return results;
}

// Notify staff about new appointment
export async function notifyStaffNewAppointment(appointment: any) {
  try {
    const template = await getTemplate('new_appointment_staff');
    if (!template) {
      console.error('Template not found: new_appointment_staff');
      return;
    }
    
    const message = fillTemplate(template, {
      customer_name: appointment.customer_name,
      customer_phone: appointment.customer_phone,
      service_type: appointment.service_type,
      appointment_date: appointment.appointment_date || 'Not specified',
      appointment_time: appointment.appointment_time || 'Not specified',
      vehicle_info: appointment.vehicle_info || 'Not specified'
    });
    
    const phones = await getStaffNotificationPhones('appointments');
    if (phones.length === 0) {
      console.log('No staff members configured for appointment notifications');
      return;
    }
    
    await sendBulkSMS(phones, message, 'staff_notification', appointment.id);
    console.log(`Sent appointment notification to ${phones.length} staff members`);
    
  } catch (error) {
    console.error('Error notifying staff about appointment:', error);
  }
}

// Notify staff about new tow request
export async function notifyStaffNewTowRequest(towRequest: any) {
  try {
    const template = await getTemplate('new_tow_request_staff');
    if (!template) {
      console.error('Template not found: new_tow_request_staff');
      return;
    }
    
    const message = fillTemplate(template, {
      customer_name: towRequest.customer_name,
      customer_phone: towRequest.customer_phone,
      location: towRequest.location || 'Not specified',
      vehicle_info: towRequest.vehicle_info || 'Not specified',
      is_urgent: towRequest.is_urgent ? 'YES' : 'No'
    });
    
    const phones = await getStaffNotificationPhones('tow_requests');
    if (phones.length === 0) {
      console.log('No staff members configured for tow request notifications');
      return;
    }
    
    await sendBulkSMS(phones, message, 'staff_notification', towRequest.id);
    console.log(`Sent tow request notification to ${phones.length} staff members`);
    
  } catch (error) {
    console.error('Error notifying staff about tow request:', error);
  }
}

// Notify customer about RO status change
export async function notifyCustomerROStatusChange(ro: any, newStatus: string) {
  try {
    // Only send SMS for specific statuses
    const statusesToNotify = ['estimate_approval', 'parts_ordered', 'in_repair', 'ready_pickup', 'completed'];
    if (!statusesToNotify.includes(newStatus)) {
      return;
    }
    
    const templateName = `ro_status_${newStatus}`;
    const template = await getTemplate(templateName);
    if (!template) {
      console.log(`Template not found: ${templateName}`);
      return;
    }
    
    const message = fillTemplate(template, {
      vehicle_info: [ro.vehicle_year, ro.vehicle_make, ro.vehicle_model].filter(Boolean).join(' ') || 'your vehicle',
      estimate_amount: ro.estimate_amount || '0.00',
      estimated_completion: ro.estimated_completion ? new Date(ro.estimated_completion).toLocaleDateString() : 'TBD',
      ro_number: ro.ro_number
    });
    
    const customerPhone = ro.customer_phone;
    if (!customerPhone) {
      console.log('No customer phone number for RO:', ro.ro_number);
      return;
    }
    
    const response = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: customerPhone,
        message,
        messageType: 'customer_update',
        relatedRoId: ro.id
      })
    });
    
    if (response.ok) {
      console.log(`Sent status update SMS to customer for RO ${ro.ro_number}`);
    }
    
  } catch (error) {
    console.error('Error notifying customer about RO status:', error);
  }
}

export { fillTemplate, getTemplate, getStaffNotificationPhones, sendBulkSMS };
