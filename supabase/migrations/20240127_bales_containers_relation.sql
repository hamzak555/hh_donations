-- Migration: Create relational connection between bales and containers
-- Description: Add foreign key relationship between bales and containers

-- Step 1: Add container_id column to bales table (foreign key)
ALTER TABLE bales 
ADD COLUMN IF NOT EXISTS container_id UUID REFERENCES containers(id) ON DELETE SET NULL;

-- Step 2: Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_bales_container_id ON bales(container_id);

-- Step 3: Migrate existing data by matching containerNumber to container IDs
UPDATE bales 
SET container_id = (
    SELECT c.id 
    FROM containers c 
    WHERE c."containerNumber" = bales."containerNumber"
    LIMIT 1
)
WHERE bales."containerNumber" IS NOT NULL
  AND bales.container_id IS NULL;

-- Step 4: Add comment for documentation
COMMENT ON COLUMN bales.container_id IS 'Foreign key reference to containers table';

-- Step 5: Create a view to easily get bales with container details
CREATE OR REPLACE VIEW bales_with_containers AS
SELECT 
  b.*,
  c."containerNumber" as container_number,
  c.destination as container_destination,
  c.status as container_status,
  c."shipmentDate" as container_shipment_date,
  c."sealNumber" as container_seal_number,
  c."shippingLine" as container_shipping_line
FROM bales b
LEFT JOIN containers c ON b.container_id = c.id;

-- Step 6: Create a view for containers with their bales
CREATE OR REPLACE VIEW containers_with_bales AS
SELECT 
  c.*,
  COALESCE(
    ARRAY_AGG(DISTINCT b."baleNumber" ORDER BY b."baleNumber") FILTER (WHERE b.id IS NOT NULL),
    ARRAY[]::text[]
  ) as assigned_bale_numbers,
  COALESCE(
    ARRAY_AGG(DISTINCT b.id::text) FILTER (WHERE b.id IS NOT NULL),
    ARRAY[]::text[]
  ) as assigned_bale_ids,
  COUNT(DISTINCT b.id) as total_assigned_bales,
  COALESCE(SUM(b.weight) FILTER (WHERE b.id IS NOT NULL), 0) as total_bales_weight
FROM containers c
LEFT JOIN bales b ON b.container_id = c.id
GROUP BY c.id;

-- Step 7: Migrate existing assignedBales arrays to relational structure
DO $$
DECLARE
  container_rec RECORD;
  bale_id_text TEXT;
BEGIN
  -- Loop through each container that has assigned bales
  FOR container_rec IN 
    SELECT id, "assignedBales" 
    FROM containers 
    WHERE "assignedBales" IS NOT NULL 
      AND array_length("assignedBales", 1) > 0
  LOOP
    -- Loop through each bale ID in the text array
    FOREACH bale_id_text IN ARRAY container_rec."assignedBales"
    LOOP
      -- Update the bale if it exists and hasn't been assigned yet
      UPDATE bales 
      SET container_id = container_rec.id
      WHERE id::text = bale_id_text
        AND container_id IS NULL;
    END LOOP;
  END LOOP;
END $$;

-- Step 8: Create trigger to automatically update containers.assignedBales
CREATE OR REPLACE FUNCTION update_container_assigned_bales()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old container if bale was reassigned
  IF OLD IS NOT NULL AND OLD.container_id IS DISTINCT FROM NEW.container_id THEN
    UPDATE containers
    SET "assignedBales" = COALESCE(
      (SELECT ARRAY_AGG(DISTINCT id::text ORDER BY "baleNumber")
       FROM bales WHERE container_id = OLD.container_id),
      ARRAY[]::text[]
    ),
    "currentWeight" = COALESCE(
      (SELECT SUM(weight) FROM bales WHERE container_id = OLD.container_id),
      0
    )
    WHERE id = OLD.container_id;
  END IF;
  
  -- Update new container
  IF NEW.container_id IS NOT NULL THEN
    UPDATE containers
    SET "assignedBales" = COALESCE(
      (SELECT ARRAY_AGG(DISTINCT id::text ORDER BY "baleNumber")
       FROM bales WHERE container_id = NEW.container_id),
      ARRAY[]::text[]
    ),
    "currentWeight" = COALESCE(
      (SELECT SUM(weight) FROM bales WHERE container_id = NEW.container_id),
      0
    )
    WHERE id = NEW.container_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create triggers for bale changes
DROP TRIGGER IF EXISTS update_container_bales_on_bale_change ON bales;
CREATE TRIGGER update_container_bales_on_bale_change
AFTER INSERT OR UPDATE OF container_id ON bales
FOR EACH ROW
EXECUTE FUNCTION update_container_assigned_bales();

-- Step 10: Create trigger for bale deletion
CREATE OR REPLACE FUNCTION update_container_bales_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.container_id IS NOT NULL THEN
    UPDATE containers
    SET "assignedBales" = COALESCE(
      (SELECT ARRAY_AGG(DISTINCT id::text ORDER BY "baleNumber")
       FROM bales WHERE container_id = OLD.container_id),
      ARRAY[]::text[]
    ),
    "currentWeight" = COALESCE(
      (SELECT SUM(weight) FROM bales WHERE container_id = OLD.container_id),
      0
    )
    WHERE id = OLD.container_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_container_bales_on_bale_delete ON bales;
CREATE TRIGGER update_container_bales_on_bale_delete
AFTER DELETE ON bales
FOR EACH ROW
EXECUTE FUNCTION update_container_bales_on_delete();

-- Step 11: Create trigger for bale weight updates
CREATE OR REPLACE FUNCTION update_container_weight_on_bale_weight_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.container_id IS NOT NULL AND (OLD.weight IS DISTINCT FROM NEW.weight) THEN
    UPDATE containers
    SET "currentWeight" = COALESCE(
      (SELECT SUM(weight) FROM bales WHERE container_id = NEW.container_id),
      0
    )
    WHERE id = NEW.container_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_container_weight_on_bale_weight_change ON bales;
CREATE TRIGGER update_container_weight_on_bale_weight_change
AFTER UPDATE OF weight ON bales
FOR EACH ROW
EXECUTE FUNCTION update_container_weight_on_bale_weight_change();

-- Step 12: Grant permissions
GRANT SELECT ON bales_with_containers TO authenticated;
GRANT SELECT ON bales_with_containers TO anon;
GRANT SELECT ON containers_with_bales TO authenticated;
GRANT SELECT ON containers_with_bales TO anon;

-- Step 13: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bales_container_balenumber ON bales(container_id, "baleNumber");
CREATE INDEX IF NOT EXISTS idx_bales_container_weight ON bales(container_id, weight);

-- Verify the migration
SELECT 
  'Containers with bales:' as info,
  COUNT(DISTINCT c.id) as containers_with_bales,
  COUNT(DISTINCT b.id) as total_bales_assigned,
  SUM(b.weight) as total_weight_kg
FROM containers c
JOIN bales b ON b.container_id = c.id;