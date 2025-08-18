-- Fix pickup_requests table to use TEXT for pickup_time
-- Run this in Supabase SQL editor if you already created the table with TIME type

-- Option 1: If table has no data yet
ALTER TABLE pickup_requests 
ALTER COLUMN pickup_time TYPE TEXT;

-- Option 2: If table has data (this will preserve existing data)
-- ALTER TABLE pickup_requests 
-- ALTER COLUMN pickup_time TYPE TEXT USING pickup_time::TEXT;

-- Option 3: If you want to drop and recreate the table
-- WARNING: This will delete all existing data in the table!
-- DROP TABLE IF EXISTS pickup_requests CASCADE;
-- Then run the CREATE TABLE statement from schema.sql