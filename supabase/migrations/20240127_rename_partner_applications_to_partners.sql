-- Migration: Rename partner_applications table to partners
-- Description: Rename partner_applications table and all related objects to use "partners" terminology

-- Step 1: Rename the table
ALTER TABLE partner_applications RENAME TO partners;

-- Step 2: Rename the sequence (if exists)
ALTER SEQUENCE IF EXISTS partner_applications_id_seq RENAME TO partners_id_seq;

-- Step 3: Update column comments
COMMENT ON TABLE partners IS 'Partners table (formerly partner_applications)';
COMMENT ON COLUMN bins.partner_application_id IS 'Foreign key reference to partners table (formerly partner_applications)';

-- Step 4: Rename the foreign key column in bins table
ALTER TABLE bins RENAME COLUMN partner_application_id TO partner_id;

-- Step 5: Rename the constraint
ALTER TABLE bins 
DROP CONSTRAINT IF EXISTS bins_partner_application_id_fkey;

ALTER TABLE bins
ADD CONSTRAINT bins_partner_id_fkey 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;

-- Step 6: Drop and recreate views with new names
DROP VIEW IF EXISTS bins_with_partners CASCADE;
DROP VIEW IF EXISTS partners_with_bins CASCADE;

CREATE OR REPLACE VIEW bins_with_partners AS
SELECT 
  b.*,
  p.organization_name as partner_name,
  p.contact_person as partner_contact,
  p.email as partner_email,
  p.phone as partner_phone,
  p.status as partner_status,
  p.city as partner_city,
  p.state as partner_state
FROM bins b
LEFT JOIN partners p ON b.partner_id = p.id;

CREATE OR REPLACE VIEW partners_with_bins AS
SELECT 
  p.*,
  COALESCE(
    ARRAY_AGG(DISTINCT b."binNumber" ORDER BY b."binNumber") FILTER (WHERE b.id IS NOT NULL),
    ARRAY[]::text[]
  ) as assigned_bin_numbers,
  COALESCE(
    ARRAY_AGG(DISTINCT b.id::text ORDER BY b."binNumber") FILTER (WHERE b.id IS NOT NULL),
    ARRAY[]::text[]
  ) as assigned_bin_ids,
  COUNT(DISTINCT b.id) as total_assigned_bins
FROM partners p
LEFT JOIN bins b ON b.partner_id = p.id
GROUP BY p.id;

-- Step 7: Update trigger function to use new column name
CREATE OR REPLACE FUNCTION update_partner_assigned_bins()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old partner if bin was reassigned
  IF OLD IS NOT NULL AND OLD.partner_id IS DISTINCT FROM NEW.partner_id THEN
    UPDATE partners
    SET assigned_bins = COALESCE(
      (SELECT ARRAY_AGG(DISTINCT id::text ORDER BY "binNumber")
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
      (SELECT ARRAY_AGG(DISTINCT id::text ORDER BY "binNumber")
       FROM bins
       WHERE partner_id = NEW.partner_id),
      ARRAY[]::text[]
    )
    WHERE id = NEW.partner_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Recreate trigger with new column name
DROP TRIGGER IF EXISTS update_partner_bins_on_bin_change ON bins;
CREATE TRIGGER update_partner_bins_on_bin_change
AFTER INSERT OR UPDATE OF partner_id ON bins
FOR EACH ROW
EXECUTE FUNCTION update_partner_assigned_bins();

-- Step 9: Update delete trigger function
CREATE OR REPLACE FUNCTION update_partner_bins_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.partner_id IS NOT NULL THEN
    UPDATE partners
    SET assigned_bins = COALESCE(
      (SELECT ARRAY_AGG(DISTINCT id::text ORDER BY "binNumber")
       FROM bins
       WHERE partner_id = OLD.partner_id),
      ARRAY[]::text[]
    )
    WHERE id = OLD.partner_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Recreate delete trigger
DROP TRIGGER IF EXISTS update_partner_bins_on_bin_delete ON bins;
CREATE TRIGGER update_partner_bins_on_bin_delete
AFTER DELETE ON bins
FOR EACH ROW
EXECUTE FUNCTION update_partner_bins_on_delete();

-- Step 11: Update indexes with new names
DROP INDEX IF EXISTS idx_bins_partner_application_id;
CREATE INDEX IF NOT EXISTS idx_bins_partner_id ON bins(partner_id);

DROP INDEX IF EXISTS idx_bins_partner_binnumber;
CREATE INDEX IF NOT EXISTS idx_bins_partner_binnumber ON bins(partner_id, "binNumber");

-- Step 12: Update RLS policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON partner_applications;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON partner_applications;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON partner_applications;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON partner_applications;

-- Create new policies on partners table
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON partners
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON partners
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON partners
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON partners
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 13: Grant permissions with new table name
REVOKE ALL ON partner_applications FROM authenticated;
REVOKE ALL ON partner_applications FROM anon;

GRANT ALL ON partners TO authenticated;
GRANT SELECT ON partners TO anon;
GRANT SELECT ON bins_with_partners TO authenticated;
GRANT SELECT ON bins_with_partners TO anon;
GRANT SELECT ON partners_with_bins TO authenticated;
GRANT SELECT ON partners_with_bins TO anon;

-- Step 14: Add useful columns to partners table
ALTER TABLE partners
ADD COLUMN IF NOT EXISTS partner_since TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS bin_collection_frequency TEXT,
ADD COLUMN IF NOT EXISTS last_collection_date DATE,
ADD COLUMN IF NOT EXISTS total_collections INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Verify the migration
SELECT 
  'Partners table renamed successfully' as status,
  COUNT(*) as total_partners,
  COUNT(DISTINCT b.partner_id) as partners_with_bins
FROM partners p
LEFT JOIN bins b ON b.partner_id = p.id;