-- =====================================================
-- DIAGNOSTIC SCRIPT - Check Database Schema
-- =====================================================
-- Run this to see what we're working with
-- =====================================================

-- 1. Check if appointments table exists
SELECT 
    'appointments table' as check_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'appointments'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 2. List ALL columns in appointments table
SELECT 
    'Appointments Columns:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- 3. Check if service_inquiries table exists (might be the real table name)
SELECT 
    'service_inquiries table' as check_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'service_inquiries'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 4. List ALL columns in service_inquiries (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_inquiries') THEN
        RAISE NOTICE 'service_inquiries columns found - see next query';
    ELSE
        RAISE NOTICE 'service_inquiries table does not exist';
    END IF;
END $$;

SELECT 
    'Service Inquiries Columns:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'service_inquiries'
ORDER BY ordinal_position;

-- 5. List ALL tables in public schema
SELECT 
    'All tables in database:' as info,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
