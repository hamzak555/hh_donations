-- Migration: Create relational connection between bins and partner applications
-- Description: Add foreign key relationship between bins and partner applications

-- Step 1: Add partner_application_id column to bins table (foreign key)
ALTER TABLE bins 
ADD COLUMN IF NOT EXISTS partner_application_id UUID REFERENCES partner_applications(id) ON DELETE SET NULL;

-- Step 2: Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_bins_partner_application_id ON bins(partner_application_id);

-- Step 3: Migrate existing data by matching assigned_bins arrays
-- For each partner application with assigned bins, update those bins to reference the partner
DO $$
DECLARE
  partner_record RECORD;
  bin_id TEXT;
BEGIN
  FOR partner_record IN 
    SELECT id, assigned_bins 
    FROM partner_applications 
    WHERE assigned_bins IS NOT NULL AND array_length(assigned_bins, 1) > 0
  LOOP
    FOREACH bin_id IN ARRAY partner_record.assigned_bins
    LOOP
      UPDATE bins 
      SET partner_application_id = partner_record.id
      WHERE id = bin_id::UUID
        AND partner_application_id IS NULL;
    END LOOP;
  END LOOP;
END $$;

-- Step 4: Add comment for documentation
COMMENT ON COLUMN bins.partner_application_id IS 'Foreign key reference to partner_applications table';

-- Step 5: Create a view to easily get bins with partner details
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
LEFT JOIN partner_applications p ON b.partner_application_id = p.id;

-- Step 6: Create a view for partners with their bins
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
FROM partner_applications p
LEFT JOIN bins b ON b.partner_application_id = p.id
GROUP BY p.id;

-- Step 7: Create trigger to automatically update partner_applications.assigned_bins
CREATE OR REPLACE FUNCTION update_partner_assigned_bins()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old partner if bin was reassigned
  IF OLD IS NOT NULL AND OLD.partner_application_id IS DISTINCT FROM NEW.partner_application_id THEN
    UPDATE partner_applications
    SET assigned_bins = COALESCE(
      (SELECT ARRAY_AGG(DISTINCT id::text ORDER BY "binNumber")
       FROM bins
       WHERE partner_application_id = OLD.partner_application_id),
      ARRAY[]::text[]
    )
    WHERE id = OLD.partner_application_id;
  END IF;
  
  -- Update new partner
  IF NEW.partner_application_id IS NOT NULL THEN
    UPDATE partner_applications
    SET assigned_bins = COALESCE(
      (SELECT ARRAY_AGG(DISTINCT id::text ORDER BY "binNumber")
       FROM bins
       WHERE partner_application_id = NEW.partner_application_id),
      ARRAY[]::text[]
    )
    WHERE id = NEW.partner_application_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create triggers for bin changes
DROP TRIGGER IF EXISTS update_partner_bins_on_bin_change ON bins;
CREATE TRIGGER update_partner_bins_on_bin_change
AFTER INSERT OR UPDATE OF partner_application_id ON bins
FOR EACH ROW
EXECUTE FUNCTION update_partner_assigned_bins();

-- Step 9: Create trigger for bin deletion
CREATE OR REPLACE FUNCTION update_partner_bins_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.partner_application_id IS NOT NULL THEN
    UPDATE partner_applications
    SET assigned_bins = COALESCE(
      (SELECT ARRAY_AGG(DISTINCT id::text ORDER BY "binNumber")
       FROM bins
       WHERE partner_application_id = OLD.partner_application_id),
      ARRAY[]::text[]
    )
    WHERE id = OLD.partner_application_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_partner_bins_on_bin_delete ON bins;
CREATE TRIGGER update_partner_bins_on_bin_delete
AFTER DELETE ON bins
FOR EACH ROW
EXECUTE FUNCTION update_partner_bins_on_delete();

-- Step 10: Grant permissions
GRANT SELECT ON bins_with_partners TO authenticated;
GRANT SELECT ON bins_with_partners TO anon;
GRANT SELECT ON partners_with_bins TO authenticated;
GRANT SELECT ON partners_with_bins TO anon;

-- Step 11: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bins_partner_binnumber ON bins(partner_application_id, "binNumber");

-- Verify the migration
SELECT 
  'Partners with bins:' as info,
  COUNT(DISTINCT p.id) as partners_with_bins,
  COUNT(DISTINCT b.id) as total_bins_assigned
FROM partner_applications p
JOIN bins b ON b.partner_application_id = p.id;