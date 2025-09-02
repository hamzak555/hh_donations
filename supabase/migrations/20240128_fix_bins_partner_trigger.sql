-- Migration: Fix bins partner trigger to avoid DISTINCT/ORDER BY error
-- Description: Fixes the SQL error "in an aggregate with DISTINCT, ORDER BY expressions must appear in argument list"

-- Drop the existing problematic triggers and functions
DROP TRIGGER IF EXISTS update_partner_bins_on_bin_change ON bins;
DROP TRIGGER IF EXISTS update_partner_bins_on_bin_delete ON bins;
DROP FUNCTION IF EXISTS update_partner_assigned_bins();
DROP FUNCTION IF EXISTS update_partner_bins_on_delete();

-- Step 1: Recreate the function for bin insert/update with fixed SQL
CREATE OR REPLACE FUNCTION update_partner_assigned_bins()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old partner if bin was reassigned
  IF OLD IS NOT NULL AND OLD.partner_id IS DISTINCT FROM NEW.partner_id THEN
    UPDATE partners
    SET assigned_bins = COALESCE(
      (SELECT ARRAY_AGG(id::text ORDER BY id)
       FROM bins
       WHERE partner_id = OLD.partner_id),
      ARRAY[]::text[]
    )
    WHERE id = OLD.partner_id;
  END IF;
  
  -- Update new partner
  IF NEW.partner_id IS NOT NULL THEN
    UPDATE partners
    SET assigned_bins = COALESCE(
      (SELECT ARRAY_AGG(id::text ORDER BY id)
       FROM bins
       WHERE partner_id = NEW.partner_id),
      ARRAY[]::text[]
    )
    WHERE id = NEW.partner_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Recreate the function for bin deletion with fixed SQL
CREATE OR REPLACE FUNCTION update_partner_bins_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.partner_id IS NOT NULL THEN
    UPDATE partners
    SET assigned_bins = COALESCE(
      (SELECT ARRAY_AGG(id::text ORDER BY id)
       FROM bins
       WHERE partner_id = OLD.partner_id),
      ARRAY[]::text[]
    )
    WHERE id = OLD.partner_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Recreate the triggers
CREATE TRIGGER update_partner_bins_on_bin_change
AFTER INSERT OR UPDATE OF partner_id ON bins
FOR EACH ROW
EXECUTE FUNCTION update_partner_assigned_bins();

CREATE TRIGGER update_partner_bins_on_bin_delete
AFTER DELETE ON bins
FOR EACH ROW
EXECUTE FUNCTION update_partner_bins_on_delete();

-- Step 4: Also fix the partners_with_bins view to remove problematic DISTINCT with ORDER BY
DROP VIEW IF EXISTS partners_with_bins CASCADE;

CREATE OR REPLACE VIEW partners_with_bins AS
SELECT 
  p.*,
  COALESCE(
    ARRAY_AGG(b."binNumber" ORDER BY b."binNumber") FILTER (WHERE b.id IS NOT NULL),
    ARRAY[]::text[]
  ) as assigned_bin_numbers,
  COALESCE(
    ARRAY_AGG(b.id::text ORDER BY b.id) FILTER (WHERE b.id IS NOT NULL),
    ARRAY[]::text[]
  ) as assigned_bin_ids,
  COUNT(b.id) as total_assigned_bins
FROM partners p
LEFT JOIN bins b ON b.partner_id = p.id
GROUP BY p.id;

-- Grant permissions on the recreated view
GRANT SELECT ON partners_with_bins TO authenticated;
GRANT SELECT ON partners_with_bins TO anon;

-- Step 5: Also check and fix the drivers trigger if it exists
DROP TRIGGER IF EXISTS update_driver_bins_on_bin_change ON bins;
DROP FUNCTION IF EXISTS update_driver_assigned_bins();

-- Create fixed driver trigger function if needed
CREATE OR REPLACE FUNCTION update_driver_assigned_bins()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old driver if bin was reassigned
  IF OLD IS NOT NULL AND OLD.driver_id IS DISTINCT FROM NEW.driver_id THEN
    UPDATE drivers
    SET assigned_bins = COALESCE(
      (SELECT ARRAY_AGG("binNumber" ORDER BY "binNumber")
       FROM bins
       WHERE driver_id = OLD.driver_id),
      ARRAY[]::text[]
    )
    WHERE id = OLD.driver_id;
  END IF;
  
  -- Update new driver
  IF NEW.driver_id IS NOT NULL THEN
    UPDATE drivers
    SET assigned_bins = COALESCE(
      (SELECT ARRAY_AGG("binNumber" ORDER BY "binNumber")
       FROM bins
       WHERE driver_id = NEW.driver_id),
      ARRAY[]::text[]
    )
    WHERE id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_driver_bins_on_bin_change
AFTER INSERT OR UPDATE OF driver_id ON bins
FOR EACH ROW
EXECUTE FUNCTION update_driver_assigned_bins();

-- Verify the fix
SELECT 'Bin trigger fix applied successfully' as status;