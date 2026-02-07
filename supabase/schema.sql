-- ===========================================
-- Domestic and Foreign Auto Body Inc.
-- Supabase Database Schema
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- PROFILES TABLE (extends auth.users)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- ===========================================
-- REPAIR CASES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.repair_cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    case_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'pending_info', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    
    -- Vehicle Information
    vehicle_year INTEGER,
    vehicle_make TEXT,
    vehicle_model TEXT,
    vehicle_vin TEXT,
    vehicle_license_plate TEXT,
    vehicle_mileage INTEGER,
    
    -- Incident Information
    incident_date DATE,
    incident_description TEXT,
    damage_areas TEXT[], -- Array of damage locations
    
    -- Insurance Information
    insurance_carrier TEXT,
    insurance_policy_number TEXT,
    insurance_claim_number TEXT,
    insurance_adjuster_name TEXT,
    insurance_adjuster_phone TEXT,
    insurance_adjuster_email TEXT,
    
    -- Contact Information
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    preferred_contact_method TEXT DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'email', 'sms')),
    
    -- Additional Notes
    notes TEXT,
    staff_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for repair_cases
ALTER TABLE public.repair_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own cases"
    ON public.repair_cases FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create own cases"
    ON public.repair_cases FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own cases"
    ON public.repair_cases FOR UPDATE
    USING (auth.uid() = customer_id);

CREATE POLICY "Staff can view all cases"
    ON public.repair_cases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Staff can update all cases"
    ON public.repair_cases FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- Create index for case number lookups
CREATE INDEX idx_repair_cases_case_number ON public.repair_cases(case_number);
CREATE INDEX idx_repair_cases_customer_id ON public.repair_cases(customer_id);
CREATE INDEX idx_repair_cases_status ON public.repair_cases(status);

-- ===========================================
-- CASE UPLOADS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.case_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id UUID REFERENCES public.repair_cases(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Storage path in Supabase Storage
    file_type TEXT NOT NULL CHECK (file_type IN ('photo', 'document', 'insurance_card', 'estimate')),
    file_size INTEGER,
    mime_type TEXT,
    description TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for case_uploads
ALTER TABLE public.case_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view uploads for own cases"
    ON public.case_uploads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.repair_cases
            WHERE id = case_uploads.case_id AND customer_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload to own cases"
    ON public.case_uploads FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.repair_cases
            WHERE id = case_uploads.case_id AND customer_id = auth.uid()
        )
    );

CREATE POLICY "Staff can view all uploads"
    ON public.case_uploads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

CREATE INDEX idx_case_uploads_case_id ON public.case_uploads(case_id);

-- ===========================================
-- APPOINTMENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id UUID REFERENCES public.repair_cases(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Appointment Details
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    service_type TEXT NOT NULL CHECK (service_type IN ('estimate', 'inspection', 'consultation', 'drop_off', 'pick_up')),
    status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'cancelled', 'completed', 'no_show')),
    
    -- Contact Information
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    
    -- Additional Information
    notes TEXT,
    staff_notes TEXT,
    cancellation_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own appointments"
    ON public.appointments FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own appointments"
    ON public.appointments FOR UPDATE
    USING (auth.uid() = customer_id);

CREATE POLICY "Staff can view all appointments"
    ON public.appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Staff can update all appointments"
    ON public.appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

CREATE INDEX idx_appointments_customer_id ON public.appointments(customer_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- ===========================================
-- TOW REQUESTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.tow_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id UUID REFERENCES public.repair_cases(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Pickup Details
    pickup_address TEXT NOT NULL,
    pickup_city TEXT NOT NULL,
    pickup_state TEXT NOT NULL,
    pickup_zip TEXT NOT NULL,
    pickup_location_notes TEXT,
    
    -- Vehicle Details
    vehicle_year INTEGER,
    vehicle_make TEXT,
    vehicle_model TEXT,
    vehicle_color TEXT,
    vehicle_condition TEXT CHECK (vehicle_condition IN ('drivable', 'not_drivable', 'partially_drivable')),
    
    -- Contact Information
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    preferred_contact_method TEXT DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'sms')),
    
    -- Status
    status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'dispatched', 'in_transit', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
    
    -- Additional Information
    notes TEXT,
    staff_notes TEXT,
    dispatch_partner TEXT,
    dispatch_time TIMESTAMPTZ,
    completion_time TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for tow_requests
ALTER TABLE public.tow_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own tow requests"
    ON public.tow_requests FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create tow requests"
    ON public.tow_requests FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff can view all tow requests"
    ON public.tow_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Staff can update all tow requests"
    ON public.tow_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

CREATE INDEX idx_tow_requests_customer_id ON public.tow_requests(customer_id);
CREATE INDEX idx_tow_requests_status ON public.tow_requests(status);

-- ===========================================
-- NOTIFICATION SETTINGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for notification_settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view notification settings"
    ON public.notification_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Admins can update notification settings"
    ON public.notification_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert default notification settings
INSERT INTO public.notification_settings (setting_key, setting_value, description) VALUES
('sms_recipients', '{"recipients": ["+12162880668", "+14405300810", "+14407491081"]}', 'Staff SMS notification recipients'),
('email_recipients', '{"recipients": ["domesticandforeignab@gmail.com"]}', 'Email notification recipients'),
('notification_events', '{
    "new_repair_case": {"sms": true, "email": true},
    "new_appointment": {"sms": true, "email": true},
    "new_tow_request": {"sms": true, "email": true},
    "case_updated": {"sms": false, "email": true},
    "appointment_confirmed": {"sms": true, "email": true},
    "appointment_cancelled": {"sms": true, "email": true},
    "new_upload": {"sms": false, "email": true}
}', 'Notification event configuration')
ON CONFLICT (setting_key) DO NOTHING;

-- ===========================================
-- PAYMENTS TABLE (prepared for future use)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id UUID REFERENCES public.repair_cases(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    payment_type TEXT CHECK (payment_type IN ('deposit', 'full', 'partial')),
    payment_method TEXT CHECK (payment_method IN ('stripe', 'cash', 'check', 'zelle', 'venmo', 'paypal', 'cash_app')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    
    -- Stripe Integration (future)
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    
    -- Reference Information
    payment_reference TEXT,
    receipt_url TEXT,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Staff can view all payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

CREATE INDEX idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX idx_payments_case_id ON public.payments(case_id);

-- ===========================================
-- ACTIVITY LOG TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('repair_case', 'appointment', 'tow_request', 'payment', 'upload')),
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view activity log"
    ON public.activity_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- ===========================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repair_cases_updated_at BEFORE UPDATE ON public.repair_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tow_requests_updated_at BEFORE UPDATE ON public.tow_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate case number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    year_prefix TEXT;
BEGIN
    year_prefix := TO_CHAR(NOW(), 'YY');
    SELECT 'CASE-' || year_prefix || '-' || LPAD((COUNT(*) + 1)::TEXT, 4, '0')
    INTO new_number
    FROM public.repair_cases
    WHERE case_number LIKE 'CASE-' || year_prefix || '-%';
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate case number
CREATE OR REPLACE FUNCTION set_case_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.case_number IS NULL THEN
        NEW.case_number := generate_case_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_case_number_trigger BEFORE INSERT ON public.repair_cases
    FOR EACH ROW EXECUTE FUNCTION set_case_number();

-- ===========================================
-- STORAGE BUCKETS (Run these in Supabase Dashboard -> Storage)
-- ===========================================
-- Create storage bucket for case uploads
-- INSERT INTO storage.buckets (id, name, public) VALUES ('case-uploads', 'case-uploads', false);

-- Storage RLS Policies (Run these in Supabase Dashboard -> Storage -> case-uploads -> Policies)
-- CREATE POLICY "Users can upload to own cases"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'case-uploads' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );
--
-- CREATE POLICY "Users can view own uploads"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'case-uploads' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );
--
-- CREATE POLICY "Staff can view all uploads"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'case-uploads' AND
--   EXISTS (
--     SELECT 1 FROM public.profiles
--     WHERE id = auth.uid() AND role IN ('admin', 'staff')
--   )
-- );
