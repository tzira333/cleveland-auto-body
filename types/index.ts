import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Type aliases for easier use
export type Profile = Tables<'profiles'>
export type RepairCase = Tables<'repair_cases'>
export type CaseUpload = Tables<'case_uploads'>
export type Appointment = Tables<'appointments'>
export type TowRequest = Tables<'tow_requests'>
export type NotificationSetting = Tables<'notification_settings'>
export type Payment = Tables<'payments'>
export type ActivityLog = Tables<'activity_log'>

// Status types
export type RepairCaseStatus = 'new' | 'pending_info' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
export type AppointmentStatus = 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type TowRequestStatus = 'requested' | 'dispatched' | 'in_transit' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

// Service types
export type ServiceType = 'estimate' | 'inspection' | 'consultation' | 'drop_off' | 'pick_up'
export type VehicleCondition = 'drivable' | 'not_drivable' | 'partially_drivable'
export type ContactMethod = 'phone' | 'email' | 'sms'
export type FileType = 'photo' | 'document' | 'insurance_card' | 'estimate'
export type PaymentType = 'deposit' | 'full' | 'partial'
export type PaymentMethod = 'stripe' | 'cash' | 'check' | 'zelle' | 'venmo' | 'paypal' | 'cash_app'

// Form types
export interface RepairCaseFormData {
  // Vehicle Information
  vehicle_year?: number
  vehicle_make?: string
  vehicle_model?: string
  vehicle_vin?: string
  vehicle_license_plate?: string
  vehicle_mileage?: number
  
  // Incident Information
  incident_date?: string
  incident_description?: string
  damage_areas?: string[]
  
  // Insurance Information
  insurance_carrier?: string
  insurance_policy_number?: string
  insurance_claim_number?: string
  insurance_adjuster_name?: string
  insurance_adjuster_phone?: string
  insurance_adjuster_email?: string
  
  // Contact Information
  customer_name: string
  customer_email: string
  customer_phone: string
  preferred_contact_method?: ContactMethod
  
  // Notes
  notes?: string
}

export interface AppointmentFormData {
  appointment_date: string
  appointment_time: string
  service_type: ServiceType
  customer_name: string
  customer_email: string
  customer_phone: string
  notes?: string
}

export interface TowRequestFormData {
  pickup_address: string
  pickup_city: string
  pickup_state: string
  pickup_zip: string
  pickup_location_notes?: string
  vehicle_year?: number
  vehicle_make?: string
  vehicle_model?: string
  vehicle_color?: string
  vehicle_condition: VehicleCondition
  customer_name: string
  customer_phone: string
  preferred_contact_method?: ContactMethod
  notes?: string
}

// Notification types
export interface NotificationRecipients {
  recipients: string[]
}

export interface NotificationEvents {
  [key: string]: {
    sms: boolean
    email: boolean
  }
}

// Business hours configuration
export interface BusinessHours {
  [key: string]: {
    open: string
    close: string
    closed: boolean
  }
}

export const BUSINESS_HOURS: BusinessHours = {
  monday: { open: '08:00', close: '16:30', closed: false },
  tuesday: { open: '08:00', close: '16:30', closed: false },
  wednesday: { open: '08:00', close: '16:30', closed: false },
  thursday: { open: '08:00', close: '16:30', closed: false },
  friday: { open: '08:00', close: '16:30', closed: false },
  saturday: { open: '09:00', close: '13:00', closed: false },
  sunday: { open: '00:00', close: '00:00', closed: true },
}

export const APPOINTMENT_DURATION_MINUTES = 30
