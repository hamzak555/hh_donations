#!/bin/bash

# Supabase Database Migration Script
# This script will execute the column rename migration on your Supabase database

echo "🚀 Starting Supabase database migration..."

# Check if .env file exists for Supabase credentials
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your Supabase credentials:"
    echo ""
    echo "REACT_APP_SUPABASE_URL=your_supabase_project_url"
    echo "REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo ""
    exit 1
fi

# Load environment variables
source .env

# Check if required variables are set
if [ -z "$REACT_APP_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Missing required environment variables!"
    echo "Please ensure these variables are set in your .env file:"
    echo "- REACT_APP_SUPABASE_URL"
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "📋 Environment variables loaded successfully"
echo "🔗 Supabase URL: $REACT_APP_SUPABASE_URL"

# Extract project reference from URL
PROJECT_REF=$(echo $REACT_APP_SUPABASE_URL | sed 's/.*https:\/\/\([^.]*\)\.supabase\.co.*/\1/')
echo "🏷️  Project Reference: $PROJECT_REF"

echo ""
echo "⚠️  WARNING: This will modify your database schema!"
echo "📊 The following changes will be made:"
echo "   • Rename snake_case columns to camelCase"
echo "   • Add missing columns for dashboard compatibility"
echo "   • Update enum values to match dashboard"
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "🔄 Executing database migration..."

# Execute the SQL script using Supabase CLI
echo "🔄 Connecting to database..."

# Option 1: Using psql directly (if available)
if command -v psql &> /dev/null; then
    echo "📝 Executing SQL script via psql..."
    psql "postgresql://postgres:$SUPABASE_SERVICE_ROLE_KEY@db.$PROJECT_REF.supabase.co:5432/postgres" -f supabase_column_rename_script.sql
else
    # Option 2: Using supabase CLI with temporary connection
    echo "📝 Executing SQL script via Supabase CLI..."
    
    # Create temporary connection file
    echo "postgresql://postgres:$SUPABASE_SERVICE_ROLE_KEY@db.$PROJECT_REF.supabase.co:5432/postgres" > temp_db_url.txt
    
    # Use supabase CLI to execute SQL
    cat supabase_column_rename_script.sql | supabase db reset --db-url "$(cat temp_db_url.txt)" --linked
    
    # Clean up
    rm -f temp_db_url.txt
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database migration completed successfully!"
    echo "🎉 All columns have been renamed to match dashboard field names"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Refresh your application"
    echo "   2. Test all admin sections"
    echo "   3. Verify data loads correctly"
else
    echo ""
    echo "❌ Migration failed!"
    echo "Please check the error messages above and try again"
    exit 1
fi