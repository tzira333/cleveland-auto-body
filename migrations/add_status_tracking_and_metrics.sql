-- Migration: Add Status Tracking and Countdown Metrics
-- Date: 2026-03-03
-- Purpose: Track how long repair orders stay in each status and display countdown to absolute_end_date

-- ============================================================================
-- 1. Create status_history table to track all status changes
-- ============================================================================

CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_order_id UUID NOT NULL REFERENCES crm_repair_orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by TEXT,
  duration_in_previous_status INTERVAL, -- Calculated: time spent in old_status
  notes TEXT,
  
  -- Indexes for performance
  CONSTRAINT fk_repair_order FOREIGN KEY (repair_order_id) REFERENCES crm_repair_orders(id)
);

CREATE INDEX IF NOT EXISTS idx_status_history_repair_order_id ON status_history(repair_order_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON status_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_new_status ON status_history(new_status);

-- ============================================================================
-- 2. Create status_metrics table for aggregated time-in-status data
-- ============================================================================

CREATE TABLE IF NOT EXISTS status_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_order_id UUID NOT NULL REFERENCES crm_repair_orders(id) ON DELETE CASCADE,
  
  -- Time spent in each status (in seconds)
  time_in_pending INTEGER DEFAULT 0,
  time_in_parts_ordered INTEGER DEFAULT 0,
  time_in_waiting_parts INTEGER DEFAULT 0,
  time_in_in_progress INTEGER DEFAULT 0,
  time_in_waiting_customer INTEGER DEFAULT 0,
  time_in_waiting_insurance INTEGER DEFAULT 0,
  time_in_quality_check INTEGER DEFAULT 0,
  time_in_completed INTEGER DEFAULT 0,
  time_in_ready_pickup INTEGER DEFAULT 0,
  time_in_delivered INTEGER DEFAULT 0,
  time_in_cancelled INTEGER DEFAULT 0,
  
  -- Current status tracking
  current_status TEXT,
  current_status_started_at TIMESTAMPTZ,
  
  -- Total time
  total_time_seconds INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_repair_order_metrics UNIQUE(repair_order_id)
);

CREATE INDEX IF NOT EXISTS idx_status_metrics_repair_order_id ON status_metrics(repair_order_id);
CREATE INDEX IF NOT EXISTS idx_status_metrics_current_status ON status_metrics(current_status);

-- ============================================================================
-- 3. Create function to automatically log status changes
-- ============================================================================

CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
DECLARE
  previous_status TEXT;
  previous_status_start TIMESTAMPTZ;
  duration_seconds INTEGER;
  status_column TEXT;
BEGIN
  -- Only proceed if status has changed
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR TG_OP = 'INSERT' THEN
    
    -- Get previous status info from status_metrics
    IF TG_OP = 'UPDATE' THEN
      SELECT current_status, current_status_started_at
      INTO previous_status, previous_status_start
      FROM status_metrics
      WHERE repair_order_id = NEW.id;
      
      -- Calculate duration in previous status
      IF previous_status_start IS NOT NULL THEN
        duration_seconds := EXTRACT(EPOCH FROM (NOW() - previous_status_start))::INTEGER;
        
        -- Map status to column name
        status_column := CASE previous_status
          WHEN 'Pending' THEN 'time_in_pending'
          WHEN 'Parts Ordered' THEN 'time_in_parts_ordered'
          WHEN 'Waiting for Parts' THEN 'time_in_waiting_parts'
          WHEN 'In Progress' THEN 'time_in_in_progress'
          WHEN 'Waiting for Customer' THEN 'time_in_waiting_customer'
          WHEN 'Waiting for Insurance' THEN 'time_in_waiting_insurance'
          WHEN 'Quality Check' THEN 'time_in_quality_check'
          WHEN 'Completed' THEN 'time_in_completed'
          WHEN 'Ready for Pickup' THEN 'time_in_ready_pickup'
          WHEN 'Delivered' THEN 'time_in_delivered'
          WHEN 'Cancelled' THEN 'time_in_cancelled'
          ELSE NULL
        END;
        
        -- Update status_metrics with duration
        IF status_column IS NOT NULL THEN
          EXECUTE format('
            UPDATE status_metrics 
            SET %I = %I + $1,
                total_time_seconds = total_time_seconds + $1,
                updated_at = NOW()
            WHERE repair_order_id = $2
          ', status_column, status_column)
          USING duration_seconds, NEW.id;
        END IF;
      END IF;
      
      -- Insert into status_history
      INSERT INTO status_history (
        repair_order_id,
        old_status,
        new_status,
        changed_at,
        changed_by,
        duration_in_previous_status
      ) VALUES (
        NEW.id,
        OLD.status,
        NEW.status,
        NOW(),
        CURRENT_USER,
        CASE WHEN previous_status_start IS NOT NULL 
          THEN MAKE_INTERVAL(secs => duration_seconds)
          ELSE NULL 
        END
      );
    END IF;
    
    -- Update or insert into status_metrics
    INSERT INTO status_metrics (
      repair_order_id,
      current_status,
      current_status_started_at,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.status,
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT (repair_order_id) 
    DO UPDATE SET
      current_status = NEW.status,
      current_status_started_at = NOW(),
      updated_at = NOW();
      
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Create trigger to automatically track status changes
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_log_status_change ON crm_repair_orders;

CREATE TRIGGER trigger_log_status_change
  AFTER INSERT OR UPDATE OF status ON crm_repair_orders
  FOR EACH ROW
  EXECUTE FUNCTION log_status_change();

-- ============================================================================
-- 5. Create view for easy querying of status durations
-- ============================================================================

CREATE OR REPLACE VIEW vw_repair_order_status_durations AS
SELECT 
  ro.id,
  ro.ro_number,
  CONCAT(ro.customer_first_name, ' ', ro.customer_last_name) as customer_name,
  CONCAT(ro.vehicle_year, ' ', ro.vehicle_make, ' ', ro.vehicle_model) as vehicle_info,
  ro.status as current_status,
  ro.absolute_end_date,
  ro.created_at,
  
  -- Time in each status (formatted)
  COALESCE(sm.time_in_pending, 0) as seconds_in_pending,
  COALESCE(sm.time_in_parts_ordered, 0) as seconds_in_parts_ordered,
  COALESCE(sm.time_in_waiting_parts, 0) as seconds_in_waiting_parts,
  COALESCE(sm.time_in_in_progress, 0) as seconds_in_in_progress,
  COALESCE(sm.time_in_waiting_customer, 0) as seconds_in_waiting_customer,
  COALESCE(sm.time_in_waiting_insurance, 0) as seconds_in_waiting_insurance,
  COALESCE(sm.time_in_quality_check, 0) as seconds_in_quality_check,
  COALESCE(sm.time_in_completed, 0) as seconds_in_completed,
  COALESCE(sm.time_in_ready_pickup, 0) as seconds_in_ready_pickup,
  COALESCE(sm.time_in_delivered, 0) as seconds_in_delivered,
  COALESCE(sm.time_in_cancelled, 0) as seconds_in_cancelled,
  
  -- Total time
  COALESCE(sm.total_time_seconds, 0) as total_seconds,
  
  -- Current status duration (ongoing)
  CASE 
    WHEN sm.current_status_started_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (NOW() - sm.current_status_started_at))::INTEGER
    ELSE 0
  END as current_status_duration_seconds,
  
  -- Countdown to absolute_end_date (in days)
  CASE 
    WHEN ro.absolute_end_date IS NOT NULL THEN
      EXTRACT(DAY FROM (ro.absolute_end_date - NOW()::DATE))::INTEGER
    ELSE NULL
  END as days_until_deadline,
  
  -- 20-day warning countdown (starts at RO creation + absolute_end_date - 20 days)
  CASE 
    WHEN ro.absolute_end_date IS NOT NULL THEN
      EXTRACT(DAY FROM (ro.absolute_end_date - NOW()::DATE))::INTEGER
    ELSE NULL
  END as countdown_days,
  
  sm.current_status_started_at,
  sm.updated_at as metrics_updated_at

FROM crm_repair_orders ro
LEFT JOIN status_metrics sm ON ro.id = sm.repair_order_id
WHERE ro.deleted_at IS NULL;

-- ============================================================================
-- 6. Create function to get formatted status duration report
-- ============================================================================

CREATE OR REPLACE FUNCTION get_status_duration_report(p_repair_order_id UUID)
RETURNS TABLE (
  status_name TEXT,
  duration_seconds INTEGER,
  duration_formatted TEXT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH durations AS (
    SELECT 
      repair_order_id,
      UNNEST(ARRAY[
        'Pending', 'Parts Ordered', 'Waiting for Parts', 'In Progress',
        'Waiting for Customer', 'Waiting for Insurance', 'Quality Check',
        'Completed', 'Ready for Pickup', 'Delivered', 'Cancelled'
      ]) as status,
      UNNEST(ARRAY[
        time_in_pending, time_in_parts_ordered, time_in_waiting_parts,
        time_in_in_progress, time_in_waiting_customer, time_in_waiting_insurance,
        time_in_quality_check, time_in_completed, time_in_ready_pickup,
        time_in_delivered, time_in_cancelled
      ]) as seconds,
      total_time_seconds
    FROM status_metrics
    WHERE repair_order_id = p_repair_order_id
  )
  SELECT 
    d.status::TEXT,
    d.seconds::INTEGER,
    CASE 
      WHEN d.seconds >= 86400 THEN 
        FLOOR(d.seconds / 86400) || 'd ' || 
        FLOOR((d.seconds % 86400) / 3600) || 'h'
      WHEN d.seconds >= 3600 THEN
        FLOOR(d.seconds / 3600) || 'h ' ||
        FLOOR((d.seconds % 3600) / 60) || 'm'
      WHEN d.seconds >= 60 THEN
        FLOOR(d.seconds / 60) || 'm'
      ELSE
        d.seconds || 's'
    END::TEXT as duration_formatted,
    CASE 
      WHEN d.total_time_seconds > 0 THEN
        ROUND((d.seconds::NUMERIC / d.total_time_seconds::NUMERIC) * 100, 2)
      ELSE 0
    END::NUMERIC as percentage
  FROM durations d
  WHERE d.seconds > 0
  ORDER BY d.seconds DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. Initialize status_metrics for existing repair orders
-- ============================================================================

INSERT INTO status_metrics (repair_order_id, current_status, current_status_started_at)
SELECT 
  id,
  status,
  created_at
FROM crm_repair_orders
WHERE deleted_at IS NULL
ON CONFLICT (repair_order_id) DO NOTHING;

-- ============================================================================
-- 8. Add comments for documentation
-- ============================================================================

COMMENT ON TABLE status_history IS 'Tracks every status change for repair orders with timestamps';
COMMENT ON TABLE status_metrics IS 'Aggregates time spent in each status for performance metrics';
COMMENT ON COLUMN status_metrics.time_in_pending IS 'Total time (seconds) spent in Pending status';
COMMENT ON FUNCTION log_status_change() IS 'Automatically logs status changes and updates metrics';
COMMENT ON VIEW vw_repair_order_status_durations IS 'Convenient view for querying status durations and countdowns';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Status tracking migration completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - status_history table (logs all status changes)';
  RAISE NOTICE '  - status_metrics table (aggregates time in each status)';
  RAISE NOTICE '  - log_status_change() function (automatic tracking)';
  RAISE NOTICE '  - trigger_log_status_change trigger (auto-executes on status change)';
  RAISE NOTICE '  - vw_repair_order_status_durations view (easy querying)';
  RAISE NOTICE '  - get_status_duration_report() function (formatted reports)';
  RAISE NOTICE '';
  RAISE NOTICE 'All existing repair orders have been initialized in status_metrics.';
  RAISE NOTICE 'Future status changes will be automatically tracked.';
END $$;
