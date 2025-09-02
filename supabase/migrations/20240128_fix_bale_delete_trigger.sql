-- Migration: Fix bale deletion trigger to avoid DISTINCT/ORDER BY error
-- Description: Fixes the SQL error "in an aggregate with DISTINCT, ORDER BY expressions must appear in argument list"

-- Drop the existing problematic triggers and functions
DROP TRIGGER IF EXISTS update_container_bales_on_bale_change ON bales;
DROP TRIGGER IF EXISTS update_container_bales_on_bale_delete ON bales;
DROP FUNCTION IF EXISTS update_container_assigned_bales();
DROP FUNCTION IF EXISTS update_container_bales_on_delete();

-- Step 1: Recreate the function for bale insert/update with fixed SQL
CREATE OR REPLACE FUNCTION update_container_assigned_bales()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old container if bale was reassigned
  IF OLD IS NOT NULL AND OLD.container_id IS DISTINCT FROM NEW.container_id THEN
    UPDATE containers
    SET "assignedBales" = COALESCE(
      (SELECT ARRAY_AGG(id::text ORDER BY id)
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
      (SELECT ARRAY_AGG(id::text ORDER BY id)
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

-- Step 2: Recreate the function for bale deletion with fixed SQL
CREATE OR REPLACE FUNCTION update_container_bales_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.container_id IS NOT NULL THEN
    UPDATE containers
    SET "assignedBales" = COALESCE(
      (SELECT ARRAY_AGG(id::text ORDER BY id)
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

-- Step 3: Recreate the triggers
CREATE TRIGGER update_container_bales_on_bale_change
AFTER INSERT OR UPDATE OF container_id ON bales
FOR EACH ROW
EXECUTE FUNCTION update_container_assigned_bales();

CREATE TRIGGER update_container_bales_on_bale_delete
AFTER DELETE ON bales
FOR EACH ROW
EXECUTE FUNCTION update_container_bales_on_delete();

-- Step 4: Also update the containers_with_bales view to remove the problematic DISTINCT with ORDER BY
DROP VIEW IF EXISTS containers_with_bales CASCADE;

CREATE OR REPLACE VIEW containers_with_bales AS
SELECT 
  c.*,
  COALESCE(
    ARRAY_AGG(b."baleNumber" ORDER BY b."baleNumber") FILTER (WHERE b.id IS NOT NULL),
    ARRAY[]::text[]
  ) as assigned_bale_numbers,
  COALESCE(
    ARRAY_AGG(b.id::text ORDER BY b.id) FILTER (WHERE b.id IS NOT NULL),
    ARRAY[]::text[]
  ) as assigned_bale_ids,
  COUNT(b.id) as total_assigned_bales,
  COALESCE(SUM(b.weight) FILTER (WHERE b.id IS NOT NULL), 0) as total_bales_weight
FROM containers c
LEFT JOIN bales b ON b.container_id = c.id
GROUP BY c.id;

-- Grant permissions on the recreated view
GRANT SELECT ON containers_with_bales TO authenticated;
GRANT SELECT ON containers_with_bales TO anon;

-- Verify the fix
SELECT 'Trigger fix applied successfully' as status;