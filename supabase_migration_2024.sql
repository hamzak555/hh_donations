-- Supabase Migration Script
-- Date: 2024
-- Description: Add new columns for partner applications bin assignments and documents

-- 1. Add assigned_bins column to partner_applications table
-- This stores an array of bin IDs assigned to each partner
ALTER TABLE partner_applications 
ADD COLUMN IF NOT EXISTS assigned_bins JSONB DEFAULT '[]';

-- 2. Add documents column to partner_applications table  
-- This stores an array of document objects with base64 data
ALTER TABLE partner_applications 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]';

-- 3. Update the status constraint to include 'archived' status
-- First drop the existing constraint
ALTER TABLE partner_applications 
DROP CONSTRAINT IF EXISTS partner_applications_status_check;

-- Then add the new constraint with all status values
ALTER TABLE partner_applications 
ADD CONSTRAINT partner_applications_status_check 
CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'archived'));

-- 4. Create indexes for better query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_partner_applications_status 
ON partner_applications(status);

CREATE INDEX IF NOT EXISTS idx_partner_applications_assigned_bins 
ON partner_applications USING GIN(assigned_bins);

-- 5. Add comment descriptions for new columns
COMMENT ON COLUMN partner_applications.assigned_bins IS 'Array of bin IDs assigned to this partner';
COMMENT ON COLUMN partner_applications.documents IS 'Array of document objects containing base64 encoded files';

-- Verify the changes
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'partner_applications'
    AND column_name IN ('assigned_bins', 'documents')
ORDER BY 
    ordinal_position;