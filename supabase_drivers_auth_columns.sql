-- Add authentication columns to drivers table
-- This script adds columns for storing driver login credentials

-- Add hasCredentials column to track if login credentials have been generated
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS "hasCredentials" BOOLEAN DEFAULT FALSE;

-- Add password_hash column to store the hashed password
-- In production, we should hash passwords, but for demo we'll store them encrypted
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS "password_hash" TEXT;

-- Add last_login column to track when driver last logged in
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP WITH TIME ZONE;

-- Add password_changed_at column to track password changes
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS "password_changed_at" TIMESTAMP WITH TIME ZONE;

-- Add assignedPickupRoutes column to store assigned pickup route IDs
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS "assignedPickupRoutes" TEXT[] DEFAULT '{}';

-- Create an index on email for faster login lookups
CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email);

-- Create an index on hasCredentials for filtering
CREATE INDEX IF NOT EXISTS idx_drivers_has_credentials ON drivers("hasCredentials");

-- Add comment to explain the columns
COMMENT ON COLUMN drivers."hasCredentials" IS 'Indicates if login credentials have been generated for this driver';
COMMENT ON COLUMN drivers.password_hash IS 'Stores the driver password (should be hashed in production)';
COMMENT ON COLUMN drivers.last_login IS 'Timestamp of the last successful login';
COMMENT ON COLUMN drivers.password_changed_at IS 'Timestamp of the last password change';
COMMENT ON COLUMN drivers."assignedPickupRoutes" IS 'Array of pickup route IDs assigned to this driver';