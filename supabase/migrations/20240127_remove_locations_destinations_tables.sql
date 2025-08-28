-- Migration: Remove unnecessary locations and destinations tables
-- Description: Simplify database by removing over-engineered location/destination tables

-- Step 1: Drop views that depend on these tables
DROP VIEW IF EXISTS bales_with_location_details CASCADE;
DROP VIEW IF EXISTS containers_with_destination_details CASCADE;

-- Step 2: Drop triggers related to locations and destinations
DROP TRIGGER IF EXISTS sync_bale_location_text_trigger ON bales;
DROP TRIGGER IF EXISTS auto_create_location_trigger ON bales;
DROP TRIGGER IF EXISTS sync_container_destination_text_trigger ON containers;
DROP TRIGGER IF EXISTS auto_create_destination_trigger ON containers;

-- Step 3: Drop trigger functions
DROP FUNCTION IF EXISTS sync_bale_location_text();
DROP FUNCTION IF EXISTS auto_create_location();
DROP FUNCTION IF EXISTS sync_container_destination_text();
DROP FUNCTION IF EXISTS auto_create_destination();

-- Step 4: Drop foreign key constraints and columns from bales
ALTER TABLE bales DROP CONSTRAINT IF EXISTS bales_location_id_fkey;
ALTER TABLE bales DROP COLUMN IF EXISTS location_id;

-- Step 5: Drop foreign key constraints and columns from containers
ALTER TABLE containers DROP CONSTRAINT IF EXISTS containers_destination_id_fkey;
ALTER TABLE containers DROP COLUMN IF EXISTS destination_id;

-- Step 6: Drop indexes
DROP INDEX IF EXISTS idx_bales_location_id;
DROP INDEX IF EXISTS idx_containers_destination_id;
DROP INDEX IF EXISTS idx_locations_name;
DROP INDEX IF EXISTS idx_destinations_name;

-- Step 7: Drop the tables
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;

-- Step 8: Verify the cleanup
SELECT 
  'Cleanup completed' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('locations', 'destinations')) as remaining_tables,
  (SELECT COUNT(*) FROM information_schema.columns WHERE column_name IN ('location_id', 'destination_id') AND table_name IN ('bales', 'containers')) as remaining_columns;

-- The bales.location and containers.destination text fields remain unchanged
-- Your application continues to work exactly as before, just without the unnecessary relational complexity