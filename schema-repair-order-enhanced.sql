-- ============================================
-- ENHANCED REPAIR ORDER SYSTEM SCHEMA
-- ============================================
-- This migration adds missing fields and creates
-- the structure for appointment-to-repair-order conversion

-- Add missing fields to crm_customers table
ALTER TABLE public.crm_customers 
ADD COLUMN IF NOT EXISTS insurance_claim_number TEXT,
ADD COLUMN IF NOT EXISTS insurance_adjuster_name TEXT,
ADD COLUMN IF NOT EXISTS insurance_adjuster_phone TEXT,
ADD COLUMN IF NOT EXISTS insurance_adjuster_email TEXT;

-- Add full address fields to crm_customers
ALTER TABLE public.crm_customers 
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS apt_unit TEXT;

-- Update crm_repair_orders with comprehensive fields
ALTER TABLE public.crm_repair_orders
ADD COLUMN IF NOT EXISTS source_appointment_id UUID REFERENCES public.appointments(id),
ADD COLUMN IF NOT EXISTS source_repair_case_id UUID REFERENCES public.repair_cases(id),
ADD COLUMN IF NOT EXISTS estimated_total_cost DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS final_total_cost DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS estimated_duration_days INTEGER,
ADD COLUMN IF NOT EXISTS planned_start_date DATE,
ADD COLUMN IF NOT EXISTS planned_completion_date DATE,
ADD COLUMN IF NOT EXISTS insurance_carrier TEXT,
ADD COLUMN IF NOT EXISTS insurance_claim_number TEXT,
ADD COLUMN IF NOT EXISTS insurance_contact_name TEXT,
ADD COLUMN IF NOT EXISTS insurance_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS insurance_contact_email TEXT,
ADD COLUMN IF NOT EXISTS customer_first_name TEXT,
ADD COLUMN IF NOT EXISTS customer_last_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS vehicle_year TEXT,
ADD COLUMN IF NOT EXISTS vehicle_make TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS vehicle_vin TEXT;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_source_appointment 
ON public.crm_repair_orders(source_appointment_id);

CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_source_repair_case 
ON public.crm_repair_orders(source_repair_case_id);

CREATE INDEX IF NOT EXISTS idx_crm_repair_orders_planned_start 
ON public.crm_repair_orders(planned_start_date);

-- Create Parts List table for required parts per repair order
CREATE TABLE IF NOT EXISTS public.crm_repair_order_parts_list (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    repair_order_id UUID REFERENCES public.crm_repair_orders(id) ON DELETE CASCADE NOT NULL,
    part_name TEXT NOT NULL,
    part_number TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    estimated_cost DECIMAL(10, 2),
    notes TEXT,
    status TEXT DEFAULT 'required' CHECK (status IN ('required', 'ordered', 'received', 'installed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for parts list
ALTER TABLE public.crm_repair_order_parts_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all repair order parts lists"
    ON public.crm_repair_order_parts_list FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE POLICY "Staff can manage repair order parts lists"
    ON public.crm_repair_order_parts_list FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE INDEX idx_crm_repair_order_parts_list_ro_id 
ON public.crm_repair_order_parts_list(repair_order_id);

-- Function to generate next RO number
CREATE OR REPLACE FUNCTION generate_ro_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    ro_number TEXT;
BEGIN
    -- Get the highest RO number
    SELECT COALESCE(MAX(CAST(SUBSTRING(ro_number FROM 'RO-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.crm_repair_orders
    WHERE ro_number ~ '^RO-\d+$';
    
    -- Format as RO-00001, RO-00002, etc.
    ro_number := 'RO-' || LPAD(next_number::TEXT, 5, '0');
    
    RETURN ro_number;
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining the schema
COMMENT ON TABLE public.crm_repair_order_parts_list IS 
'Required parts list for each repair order - separate from parts inventory tracking';

COMMENT ON COLUMN public.crm_repair_orders.source_appointment_id IS 
'Link to original appointment if repair order was created from completed appointment';

COMMENT ON COLUMN public.crm_repair_orders.source_repair_case_id IS 
'Link to original repair case if repair order was created from damage report';
