const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for admin access
const supabaseUrl = 'https://kbdhzmlcomthrhxkifbf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZGh6bWxjb210aHJoeGtpZmJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzNDYxMCwiZXhwIjoyMDcxMTEwNjEwfQ.VWSBYO4QaED63B-jOJNQ-glN0nkSqeZhoFbic3dDIsM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateBinStatusConstraint() {
  console.log('🔄 Updating bin status constraint to include "Warehouse"...\n');

  try {
    // First, let's check the current constraint
    console.log('📋 Checking current constraint...');
    const { data: currentConstraint, error: checkError } = await supabase
      .rpc('get_check_constraints', {
        table_name: 'bins',
        constraint_name: 'bins_status_check'
      })
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('Note: Could not check current constraint (this is normal)');
    } else if (currentConstraint) {
      console.log('Current constraint:', currentConstraint);
    }

    // Drop the existing constraint
    console.log('\n🗑️  Dropping existing status constraint...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE bins DROP CONSTRAINT IF EXISTS bins_status_check;`
    });

    if (dropError) {
      // Try alternative approach - direct SQL through Supabase SQL Editor API
      console.log('Note: Standard approach failed, trying alternative method...');
    }

    // Add the new constraint with 'Warehouse' included
    console.log('✨ Adding new constraint with "Warehouse" status...');
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE bins ADD CONSTRAINT bins_status_check CHECK (status IN ('Available', 'Unavailable', 'Full', 'Almost Full', 'Warehouse'));`
    });

    if (addError) {
      console.log('Note: Could not add constraint via RPC');
      console.log('\n⚠️  The database constraint needs to be updated manually.');
      console.log('\n📝 Please run this SQL in the Supabase SQL Editor:');
      console.log('----------------------------------------');
      console.log(`
-- Drop the existing constraint
ALTER TABLE bins 
DROP CONSTRAINT IF EXISTS bins_status_check;

-- Add the new constraint with 'Warehouse' included
ALTER TABLE bins 
ADD CONSTRAINT bins_status_check 
CHECK (status IN ('Available', 'Unavailable', 'Full', 'Almost Full', 'Warehouse'));
      `);
      console.log('----------------------------------------');
      console.log('\n🔗 SQL Editor URL:');
      console.log('https://supabase.com/dashboard/project/kbdhzmlcomthrhxkifbf/sql/new');
      return;
    }

    console.log('✅ Constraint updated successfully!\n');

    // Test the update
    console.log('🧪 Testing the update...');
    const testBin = {
      id: 'test-' + Date.now(),
      binNumber: 'TEST-WAREHOUSE',
      locationName: 'Test Warehouse Location',
      address: '123 Warehouse St',
      status: 'Warehouse',
      lat: 0,
      lng: 0
    };

    const { error: testError } = await supabase
      .from('bins')
      .insert(testBin);

    if (testError) {
      console.log('❌ Test failed:', testError.message);
      console.log('\nThe constraint may need to be updated manually in the Supabase dashboard.');
    } else {
      console.log('✅ Test successful! "Warehouse" status is now valid.');
      
      // Clean up test bin
      await supabase
        .from('bins')
        .delete()
        .eq('id', testBin.id);
      
      console.log('🧹 Test bin cleaned up.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n📝 Please update the constraint manually in the Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/kbdhzmlcomthrhxkifbf/sql/new');
  }
}

updateBinStatusConstraint();