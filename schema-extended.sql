-- ===========================================
-- Extended Database Schema for Cleveland Auto Body
-- Includes Staff Users + BodyShopCRM Tables
-- ===========================================

-- ===========================================
-- STAFF USERS TABLE (for staff authentication)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.staff_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('staff', 'admin', 'manager')),
    is_active BOOLEAN DEFAULT true,
    can_access_appointments BOOLEAN DEFAULT true,
    can_access_crm BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for staff_users
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff users can view own record"
    ON public.staff_users FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all staff users"
    ON public.staff_users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage staff users"
    ON public.staff_users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE INDEX idx_staff_users_auth_user_id ON public.staff_users(auth_user_id);
CREATE INDEX idx_staff_users_email ON public.staff_users(email);

-- ===========================================
-- BODYSHOP CRM: CUSTOMERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.crm_customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    insurance_company TEXT,
    policy_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for crm_customers
ALTER TABLE public.crm_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all CRM customers"
    ON public.crm_customers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE POLICY "Staff can manage CRM customers"
    ON public.crm_customers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE INDEX idx_crm_customers_email ON public.crm_customers(email);
CREATE INDEX idx_crm_customers_phone ON public.crm_customers(phone);
CREATE INDEX idx_crm_customers_name ON public.crm_customers(last_name, first_name);

-- ===========================================
-- BODYSHOP CRM: VEHICLES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.crm_vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE NOT NULL,
    year TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    color TEXT,
    vin TEXT UNIQUE NOT NULL,
    license_plate TEXT,
    mileage INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for crm_vehicles
ALTER TABLE public.crm_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all CRM vehicles"
    ON public.crm_vehicles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE POLICY "Staff can manage CRM vehicles"
    ON public.crm_vehicles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE INDEX idx_crm_vehicles_customer_id ON public.crm_vehicles(customer_id);
CREATE INDEX idx_crm_vehicles_vin ON public.crm_vehicles(vin);

-- ===========================================
-- BODYSHOP CRM: REPAIR ORDERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.crm_repair_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ro_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES public.crm_vehicles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'intake' CHECK (status IN ('intake', 'insurance', 'estimate_approval', 'blueprinting', 'parts_ordered', 'in_repair', 'painting', 'quality_control', 'ready_pickup', 'completed')),
    date_received TIMESTAMPTZ NOT NULL,
    estimated_completion TIMESTAMPTZ,
    actual_completion TIMESTAMPTZ,
    damage_description TEXT NOT NULL,
    estimate_amount DECIMAL(10, 2),
    approved_amount DECIMAL(10, 2),
    adjuster_name TEXT,
    adjuster_contact TEXT,
    deductible DECIMAL(10, 2),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to TEXT,
    notes TEXT,
    last_reminder TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for crm_repair_orders
ALTER TABLE public.crm_repair_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all CRM repair orders"
    ON public.crm_repair_orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE POLICY "Staff can manage CRM repair orders"
    ON public.crm_repair_orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE INDEX idx_crm_repair_orders_ro_number ON public.crm_repair_orders(ro_number);
CREATE INDEX idx_crm_repair_orders_customer_id ON public.crm_repair_orders(customer_id);
CREATE INDEX idx_crm_repair_orders_vehicle_id ON public.crm_repair_orders(vehicle_id);
CREATE INDEX idx_crm_repair_orders_status ON public.crm_repair_orders(status);
CREATE INDEX idx_crm_repair_orders_date_received ON public.crm_repair_orders(date_received DESC);

-- ===========================================
-- BODYSHOP CRM: PARTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.crm_parts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    repair_order_id UUID REFERENCES public.crm_repair_orders(id) ON DELETE CASCADE NOT NULL,
    part_name TEXT NOT NULL,
    part_number TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10, 2),
    supplier TEXT,
    order_date TIMESTAMPTZ,
    expected_delivery TIMESTAMPTZ,
    actual_delivery TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'backordered', 'in_transit', 'received', 'installed')),
    tracking_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for crm_parts
ALTER TABLE public.crm_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all CRM parts"
    ON public.crm_parts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE POLICY "Staff can manage CRM parts"
    ON public.crm_parts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE INDEX idx_crm_parts_repair_order_id ON public.crm_parts(repair_order_id);
CREATE INDEX idx_crm_parts_status ON public.crm_parts(status);

-- ===========================================
-- BODYSHOP CRM: TIME TRACKING TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.crm_time_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    repair_order_id UUID REFERENCES public.crm_repair_orders(id) ON DELETE CASCADE NOT NULL,
    technician_name TEXT NOT NULL,
    task_description TEXT NOT NULL,
    hours DECIMAL(5, 2) NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    labor_rate DECIMAL(10, 2) DEFAULT 75.00,
    category TEXT DEFAULT 'other' CHECK (category IN ('disassembly', 'repair', 'painting', 'reassembly', 'quality_check', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for crm_time_tracking
ALTER TABLE public.crm_time_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all CRM time tracking"
    ON public.crm_time_tracking FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE POLICY "Staff can manage CRM time tracking"
    ON public.crm_time_tracking FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE INDEX idx_crm_time_tracking_repair_order_id ON public.crm_time_tracking(repair_order_id);
CREATE INDEX idx_crm_time_tracking_date ON public.crm_time_tracking(date DESC);

-- ===========================================
-- BODYSHOP CRM: DOCUMENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.crm_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    repair_order_id UUID REFERENCES public.crm_repair_orders(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('photo', 'estimate', 'insurance_form', 'invoice', 'approval', 'other')),
    document_name TEXT NOT NULL,
    document_url TEXT NOT NULL,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for crm_documents
ALTER TABLE public.crm_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all CRM documents"
    ON public.crm_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE POLICY "Staff can manage CRM documents"
    ON public.crm_documents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_users
            WHERE auth_user_id = auth.uid() AND is_active = true AND can_access_crm = true
        )
    );

CREATE INDEX idx_crm_documents_repair_order_id ON public.crm_documents(repair_order_id);

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================
CREATE TRIGGER update_staff_users_updated_at BEFORE UPDATE ON public.staff_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_customers_updated_at BEFORE UPDATE ON public.crm_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_vehicles_updated_at BEFORE UPDATE ON public.crm_vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_repair_orders_updated_at BEFORE UPDATE ON public.crm_repair_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_parts_updated_at BEFORE UPDATE ON public.crm_parts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_time_tracking_updated_at BEFORE UPDATE ON public.crm_time_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- SAMPLE DATA (Optional - for testing)
-- ===========================================
-- You can add sample staff user after creating an auth user in Supabase Auth
-- INSERT INTO public.staff_users (auth_user_id, email, full_name, phone, role)
-- VALUES ('your-auth-user-id-here', 'staff@clevelandbody.com', 'Staff User', '+12162880668', 'admin');
