-- Migration to add 'Warehouse' as a valid bin status

-- First, drop the existing check constraint
ALTER TABLE bins 
DROP CONSTRAINT IF EXISTS bins_status_check;

-- Add the new check constraint with 'Warehouse' included
ALTER TABLE bins 
ADD CONSTRAINT bins_status_check 
CHECK (status IN ('Available', 'Unavailable', 'Full', 'Almost Full', 'Warehouse'));

-- Verify the constraint was added
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conrelid = 'bins'::regclass
    AND contype = 'c';