-- Migration: Update drivers-bins relationship to be fully relational
-- Description: Since bins.driver_id already references drivers.id, we can derive assignedBins

-- Step 1: Create a function to get assigned bins for a driver
CREATE OR REPLACE FUNCTION get_driver_assigned_bins(driver_uuid UUID)
RETURNS TEXT[]
LANGUAGE sql
STABLE
AS $$
  SELECT ARRAY_AGG(DISTINCT "binNumber" ORDER BY "binNumber")
  FROM bins
  WHERE driver_id = driver_uuid
$$;

-- Step 2: Create an enhanced view for drivers with their assigned bins
CREATE OR REPLACE VIEW drivers_with_bins AS
SELECT 
  d.*,
  COALESCE(
    ARRAY_AGG(DISTINCT b."binNumber" ORDER BY b."binNumber") FILTER (WHERE b.id IS NOT NULL),
    ARRAY[]::text[]
  ) as assigned_bins_list,
  COUNT(DISTINCT b.id) as total_assigned_bins
FROM drivers d
LEFT JOIN bins b ON b.driver_id = d.id
GROUP BY d.id;

-- Step 3: Update the existing assignedBins column to sync with the relational data
-- This ensures backward compatibility
UPDATE drivers d
SET "assignedBins" = COALESCE(
  (SELECT ARRAY_AGG(DISTINCT "binNumber" ORDER BY "binNumber")
   FROM bins
   WHERE driver_id = d.id),
  ARRAY[]::text[]
);

-- Step 4: Create a trigger to automatically update drivers.assignedBins when bins change
CREATE OR REPLACE FUNCTION update_driver_assigned_bins()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old driver if bin was reassigned
  IF OLD IS NOT NULL AND OLD.driver_id IS DISTINCT FROM NEW.driver_id THEN
    UPDATE drivers
    SET "assignedBins" = COALESCE(
      (SELECT ARRAY_AGG(DISTINCT "binNumber" ORDER BY "binNumber")
       FROM bins
       WHERE driver_id = OLD.driver_id),
      ARRAY[]::text[]
    )
    WHERE id = OLD.driver_id;
  END IF;
  
  -- Update new driver
  IF NEW.driver_id IS NOT NULL THEN
    UPDATE drivers
    SET "assignedBins" = COALESCE(
      (SELECT ARRAY_AGG(DISTINCT "binNumber" ORDER BY "binNumber")
       FROM bins
       WHERE driver_id = NEW.driver_id),
      ARRAY[]::text[]
    )
    WHERE id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger for INSERT and UPDATE on bins
DROP TRIGGER IF EXISTS update_driver_bins_on_bin_change ON bins;
CREATE TRIGGER update_driver_bins_on_bin_change
AFTER INSERT OR UPDATE OF driver_id ON bins
FOR EACH ROW
EXECUTE FUNCTION update_driver_assigned_bins();

-- Step 6: Create trigger for DELETE on bins
CREATE OR REPLACE FUNCTION update_driver_bins_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.driver_id IS NOT NULL THEN
    UPDATE drivers
    SET "assignedBins" = COALESCE(
      (SELECT ARRAY_AGG(DISTINCT "binNumber" ORDER BY "binNumber")
       FROM bins
       WHERE driver_id = OLD.driver_id),
      ARRAY[]::text[]
    )
    WHERE id = OLD.driver_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_driver_bins_on_bin_delete ON bins;
CREATE TRIGGER update_driver_bins_on_bin_delete
AFTER DELETE ON bins
FOR EACH ROW
EXECUTE FUNCTION update_driver_bins_on_delete();

-- Step 7: Grant permissions
GRANT SELECT ON drivers_with_bins TO authenticated;
GRANT SELECT ON drivers_with_bins TO anon;
GRANT EXECUTE ON FUNCTION get_driver_assigned_bins(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_driver_assigned_bins(UUID) TO anon;

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bins_driver_id_binnumber ON bins(driver_id, "binNumber");