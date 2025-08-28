#!/bin/bash

# Run Supabase migration to create bins-drivers relation
# This script should be run after setting up your Supabase CLI

echo "Running migration to create bins-drivers relation..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed. Please install it first."
    echo "Visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Run the migration
supabase db push --file supabase/migrations/20240127_bins_driver_relation.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "The following changes have been applied to your database:"
    echo "1. Added driver_id column to bins table (foreign key to drivers.id)"
    echo "2. Created index on bins.driver_id for better query performance"
    echo "3. Migrated existing driver assignments to use the new relation"
    echo "4. Created bins_with_drivers view for easy querying"
    echo ""
    echo "Next steps:"
    echo "1. Test the application to ensure driver assignments work correctly"
    echo "2. Monitor for any issues with the new relational structure"
    echo "3. Consider removing the old assignedDriver column in a future migration"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi