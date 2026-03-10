-- INCREMENTAL MIGRATION - Section 3
-- Only run this AFTER Section 2 succeeds

-- =====================================================
-- SECTION 3: Create repair_order_notes table
-- =====================================================

DROP TABLE IF EXISTS repair_order_notes CASCADE;

CREATE TABLE repair_order_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_order_id UUID NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  customer_visible BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_repair_order_notes_repair_order_id ON repair_order_notes(repair_order_id);
CREATE INDEX idx_repair_order_notes_customer_visible ON repair_order_notes(customer_visible);

SELECT 'Section 3 complete: repair_order_notes table created' as status;

-- STOP HERE - Tell me if this works
-- If it works, continue to Section 4 in a NEW query
