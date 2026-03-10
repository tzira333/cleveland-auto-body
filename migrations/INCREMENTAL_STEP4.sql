-- INCREMENTAL MIGRATION - Section 4
-- Only run this AFTER Section 3 succeeds

-- =====================================================
-- SECTION 4: Add columns to appointments table
-- =====================================================

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS last_edited_by TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;

SELECT 'Section 4 complete: columns added to appointments' as status;

-- STOP HERE - Tell me if this works
-- If it works, continue to Section 5 in a NEW query
