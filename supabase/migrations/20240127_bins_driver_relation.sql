-- Migration: Create relational connection between bins and drivers
-- Description: Convert bins.assigned_driver from text to UUID foreign key referencing drivers.id

-- Step 1: Add a new column for driver_id (foreign key)
ALTER TABLE bins 
ADD COLUMN driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL;

-- Step 2: Create an index for better query performance
CREATE INDEX idx_bins_driver_id ON bins(driver_id);

-- Step 3: Migrate existing data by matching driver names to driver IDs
-- This will attempt to match assigned_driver text with driver names
UPDATE bins b
SET driver_id = d.id
FROM drivers d
WHERE b.assigned_driver = d.name
  AND b.assigned_driver IS NOT NULL;

-- Step 4: Add comment for documentation
COMMENT ON COLUMN bins.driver_id IS 'Foreign key reference to drivers table';

-- Note: The old assigned_driver column is kept for backward compatibility
-- It can be removed in a future migration once the application is updated

-- Step 5: Create a view to easily get bins with driver details
CREATE OR REPLACE VIEW bins_with_drivers AS
SELECT 
  b.*,
  d.name as driver_name,
  d.email as driver_email,
  d.phone as driver_phone,
  d.status as driver_status
FROM bins b
LEFT JOIN drivers d ON b.driver_id = d.id;

-- Step 6: Grant permissions on the new view
GRANT SELECT ON bins_with_drivers TO authenticated;
GRANT SELECT ON bins_with_drivers TO anon;