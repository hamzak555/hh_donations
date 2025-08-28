-- Migration: Create relational connection between pickup requests and drivers
-- Description: Add foreign key relationship between pickup_requests and drivers tables

-- Step 1: Add driver_id column to pickup_requests table (foreign key)
ALTER TABLE pickup_requests 
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL;

-- Step 2: Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_pickup_requests_driver_id ON pickup_requests(driver_id);

-- Step 3: Migrate existing data by matching assignedDriver names to driver IDs
UPDATE pickup_requests
SET driver_id = (
    SELECT d.id 
    FROM drivers d 
    WHERE d.name = pickup_requests."assignedDriver"
    LIMIT 1
)
WHERE pickup_requests."assignedDriver" IS NOT NULL
  AND pickup_requests.driver_id IS NULL;

-- Step 4: Add comment for documentation
COMMENT ON COLUMN pickup_requests.driver_id IS 'Foreign key reference to drivers table';

-- Step 5: Create a view to easily get pickup requests with driver details
CREATE OR REPLACE VIEW pickup_requests_with_drivers AS
SELECT 
  pr.*,
  d.name as driver_name,
  d.phone as driver_phone,
  d.email as driver_email,
  d.status as driver_status,
  d."vehicleType" as driver_vehicle_type
FROM pickup_requests pr
LEFT JOIN drivers d ON pr.driver_id = d.id;

-- Step 6: Create a view for drivers with their pickup statistics
CREATE OR REPLACE VIEW drivers_with_pickup_stats AS
SELECT 
  d.*,
  COUNT(DISTINCT pr.id) FILTER (WHERE pr.status = 'Picked Up') as completed_pickups,
  COUNT(DISTINCT pr.id) FILTER (WHERE pr.status = 'Pending') as pending_pickups,
  COUNT(DISTINCT pr.id) as total_assigned_pickups,
  ARRAY_AGG(DISTINCT pr.id::text ORDER BY pr.date DESC) FILTER (WHERE pr.id IS NOT NULL) as pickup_request_ids
FROM drivers d
LEFT JOIN pickup_requests pr ON pr.driver_id = d.id
GROUP BY d.id;

-- Step 7: Create trigger to sync assignedDriver text field when driver_id changes
CREATE OR REPLACE FUNCTION sync_pickup_request_driver_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.driver_id IS NOT NULL THEN
    NEW."assignedDriver" = (SELECT name FROM drivers WHERE id = NEW.driver_id);
  ELSIF NEW.driver_id IS NULL THEN
    NEW."assignedDriver" = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_pickup_request_driver_name_trigger ON pickup_requests;
CREATE TRIGGER sync_pickup_request_driver_name_trigger
BEFORE INSERT OR UPDATE OF driver_id ON pickup_requests
FOR EACH ROW
EXECUTE FUNCTION sync_pickup_request_driver_name();

-- Step 8: Create trigger to auto-assign driver_id when assignedDriver name is set
CREATE OR REPLACE FUNCTION auto_assign_driver_id()
RETURNS TRIGGER AS $$
DECLARE
  new_driver_id UUID;
BEGIN
  -- If assignedDriver text is provided but driver_id is not
  IF NEW."assignedDriver" IS NOT NULL AND NEW."assignedDriver" != '' AND NEW.driver_id IS NULL THEN
    -- Try to find driver by name
    SELECT id INTO new_driver_id
    FROM drivers
    WHERE name = NEW."assignedDriver"
    LIMIT 1;
    
    IF new_driver_id IS NOT NULL THEN
      NEW.driver_id = new_driver_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_assign_driver_id_trigger ON pickup_requests;
CREATE TRIGGER auto_assign_driver_id_trigger
BEFORE INSERT OR UPDATE OF "assignedDriver" ON pickup_requests
FOR EACH ROW
EXECUTE FUNCTION auto_assign_driver_id();

-- Step 9: Update drivers table to track pickup routes (if not already exists)
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS assigned_pickup_routes TEXT[];

-- Step 10: Create trigger to update driver's totalPickups count
CREATE OR REPLACE FUNCTION update_driver_total_pickups()
RETURNS TRIGGER AS $$
BEGIN
  -- Update driver's total pickups when a pickup request status changes to 'Picked Up'
  IF NEW.status = 'Picked Up' AND (OLD IS NULL OR OLD.status != 'Picked Up') AND NEW.driver_id IS NOT NULL THEN
    UPDATE drivers
    SET "totalPickups" = COALESCE("totalPickups", 0) + 1
    WHERE id = NEW.driver_id;
  ELSIF OLD IS NOT NULL AND OLD.status = 'Picked Up' AND NEW.status != 'Picked Up' AND OLD.driver_id IS NOT NULL THEN
    UPDATE drivers
    SET "totalPickups" = GREATEST(COALESCE("totalPickups", 0) - 1, 0)
    WHERE id = OLD.driver_id;
  END IF;
  
  -- Handle driver reassignment
  IF OLD IS NOT NULL AND OLD.driver_id IS DISTINCT FROM NEW.driver_id THEN
    -- Decrement old driver's count if the pickup was completed
    IF NEW.status = 'Picked Up' AND OLD.driver_id IS NOT NULL THEN
      UPDATE drivers
      SET "totalPickups" = GREATEST(COALESCE("totalPickups", 0) - 1, 0)
      WHERE id = OLD.driver_id;
    END IF;
    
    -- Increment new driver's count if the pickup is completed
    IF NEW.status = 'Picked Up' AND NEW.driver_id IS NOT NULL THEN
      UPDATE drivers
      SET "totalPickups" = COALESCE("totalPickups", 0) + 1
      WHERE id = NEW.driver_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_driver_total_pickups_trigger ON pickup_requests;
CREATE TRIGGER update_driver_total_pickups_trigger
AFTER INSERT OR UPDATE OF status, driver_id ON pickup_requests
FOR EACH ROW
EXECUTE FUNCTION update_driver_total_pickups();

-- Step 11: Grant permissions
GRANT SELECT ON pickup_requests_with_drivers TO authenticated;
GRANT SELECT ON pickup_requests_with_drivers TO anon;
GRANT SELECT ON drivers_with_pickup_stats TO authenticated;
GRANT SELECT ON drivers_with_pickup_stats TO anon;

-- Step 12: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pickup_requests_driver_status ON pickup_requests(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_date ON pickup_requests(date);

-- Verify the migration
SELECT 
  'Pickup requests with drivers:' as info,
  COUNT(DISTINCT pr.id) as pickup_requests_with_drivers,
  COUNT(DISTINCT d.id) as unique_drivers_assigned
FROM pickup_requests pr
JOIN drivers d ON pr.driver_id = d.id;