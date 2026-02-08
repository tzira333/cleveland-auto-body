-- First, drop the function if it exists with wrong signature
DROP FUNCTION IF EXISTS generate_ro_number();

-- Create the function with proper error handling
CREATE OR REPLACE FUNCTION generate_ro_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    ro_number TEXT;
BEGIN
    -- Get the highest RO number, default to 0 if no records exist
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN ro_number ~ '^RO-\d+$' 
                THEN CAST(SUBSTRING(ro_number FROM 'RO-(\d+)') AS INTEGER)
                ELSE 0
            END
        ), 
        0
    ) + 1
    INTO next_number
    FROM public.crm_repair_orders;
    
    -- Format as RO-00001, RO-00002, etc.
    ro_number := 'RO-' || LPAD(next_number::TEXT, 5, '0');
    
    RETURN ro_number;
EXCEPTION
    WHEN OTHERS THEN
        -- If anything fails, return a timestamp-based RO number
        RETURN 'RO-' || LPAD(EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT, 10, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_ro_number() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_ro_number() TO service_role;

-- Test the function
SELECT generate_ro_number();
