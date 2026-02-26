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

// Notify customer about RO status change (automatic)
export async function notifyCustomerROStatusChange(ro: any, newStatus: string) {
  try {
    // Only send SMS for specific statuses
    const statusesToNotify = ['insurance', 'estimate_approval', 'parts_ordered', 'in_repair', 'painting', 'quality_control', 'ready_pickup', 'completed'];
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
    
    const response = await fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/sms/send', {
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

export { fillTemplate, getTemplate };
