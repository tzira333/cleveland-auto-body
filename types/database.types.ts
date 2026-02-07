export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      repair_cases: {
        Row: {
          id: string
          customer_id: string | null
          case_number: string
          status: string
          vehicle_year: number | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_vin: string | null
          vehicle_license_plate: string | null
          vehicle_mileage: number | null
          incident_date: string | null
          incident_description: string | null
          damage_areas: string[] | null
          insurance_carrier: string | null
          insurance_policy_number: string | null
          insurance_claim_number: string | null
          insurance_adjuster_name: string | null
          insurance_adjuster_phone: string | null
          insurance_adjuster_email: string | null
          customer_name: string
          customer_email: string
          customer_phone: string
          preferred_contact_method: string
          notes: string | null
          staff_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          case_number?: string
          status?: string
          vehicle_year?: number | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_vin?: string | null
          vehicle_license_plate?: string | null
          vehicle_mileage?: number | null
          incident_date?: string | null
          incident_description?: string | null
          damage_areas?: string[] | null
          insurance_carrier?: string | null
          insurance_policy_number?: string | null
          insurance_claim_number?: string | null
          insurance_adjuster_name?: string | null
          insurance_adjuster_phone?: string | null
          insurance_adjuster_email?: string | null
          customer_name: string
          customer_email: string
          customer_phone: string
          preferred_contact_method?: string
          notes?: string | null
          staff_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          case_number?: string
          status?: string
          vehicle_year?: number | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_vin?: string | null
          vehicle_license_plate?: string | null
          vehicle_mileage?: number | null
          incident_date?: string | null
          incident_description?: string | null
          damage_areas?: string[] | null
          insurance_carrier?: string | null
          insurance_policy_number?: string | null
          insurance_claim_number?: string | null
          insurance_adjuster_name?: string | null
          insurance_adjuster_phone?: string | null
          insurance_adjuster_email?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          preferred_contact_method?: string
          notes?: string | null
          staff_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      case_uploads: {
        Row: {
          id: string
          case_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number | null
          mime_type: string | null
          description: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size?: number | null
          mime_type?: string | null
          description?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number | null
          mime_type?: string | null
          description?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          case_id: string | null
          customer_id: string | null
          appointment_date: string
          appointment_time: string
          duration_minutes: number
          service_type: string
          status: string
          customer_name: string
          customer_email: string
          customer_phone: string
          notes: string | null
          staff_notes: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          customer_id?: string | null
          appointment_date: string
          appointment_time: string
          duration_minutes?: number
          service_type: string
          status?: string
          customer_name: string
          customer_email: string
          customer_phone: string
          notes?: string | null
          staff_notes?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          customer_id?: string | null
          appointment_date?: string
          appointment_time?: string
          duration_minutes?: number
          service_type?: string
          status?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          notes?: string | null
          staff_notes?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tow_requests: {
        Row: {
          id: string
          case_id: string | null
          customer_id: string | null
          pickup_address: string
          pickup_city: string
          pickup_state: string
          pickup_zip: string
          pickup_location_notes: string | null
          vehicle_year: number | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_color: string | null
          vehicle_condition: string | null
          customer_name: string
          customer_phone: string
          preferred_contact_method: string
          status: string
          priority: string
          notes: string | null
          staff_notes: string | null
          dispatch_partner: string | null
          dispatch_time: string | null
          completion_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          customer_id?: string | null
          pickup_address: string
          pickup_city: string
          pickup_state: string
          pickup_zip: string
          pickup_location_notes?: string | null
          vehicle_year?: number | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_color?: string | null
          vehicle_condition?: string | null
          customer_name: string
          customer_phone: string
          preferred_contact_method?: string
          status?: string
          priority?: string
          notes?: string | null
          staff_notes?: string | null
          dispatch_partner?: string | null
          dispatch_time?: string | null
          completion_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          customer_id?: string | null
          pickup_address?: string
          pickup_city?: string
          pickup_state?: string
          pickup_zip?: string
          pickup_location_notes?: string | null
          vehicle_year?: number | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_color?: string | null
          vehicle_condition?: string | null
          customer_name?: string
          customer_phone?: string
          preferred_contact_method?: string
          status?: string
          priority?: string
          notes?: string | null
          staff_notes?: string | null
          dispatch_partner?: string | null
          dispatch_time?: string | null
          completion_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notification_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          description: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          description?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          description?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          case_id: string | null
          customer_id: string | null
          amount: number
          payment_type: string | null
          payment_method: string | null
          payment_status: string
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          payment_reference: string | null
          receipt_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          customer_id?: string | null
          amount: number
          payment_type?: string | null
          payment_method?: string | null
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          payment_reference?: string | null
          receipt_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          customer_id?: string | null
          amount?: number
          payment_type?: string | null
          payment_method?: string | null
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          payment_reference?: string | null
          receipt_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          action: string
          actor_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          action: string
          actor_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          action?: string
          actor_id?: string | null
          details?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
