const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixPartnerColumn() {
  try {
    console.log('Checking bins table structure...');
    
    // Try to query the bins table to see which column exists
    const { data: testBin, error: testError } = await supabase
      .from('bins')
      .select('id, partner_id')
      .limit(1);
    
    if (testError) {
      if (testError.message.includes('partner_id')) {
        console.log('❌ Column partner_id does not exist in bins table');
        console.log('\nThe migrations need to be run. Please run these SQL commands in your Supabase SQL editor:\n');
        
        console.log('--- SQL to run ---');
        console.log(`
-- Check if partner_application_id exists and rename it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bins' AND column_name = 'partner_application_id'
  ) THEN
    ALTER TABLE bins RENAME COLUMN partner_application_id TO partner_id;
    RAISE NOTICE 'Renamed partner_application_id to partner_id';
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bins' AND column_name = 'partner_id'
  ) THEN
    ALTER TABLE bins ADD COLUMN partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added partner_id column';
  ELSE
    RAISE NOTICE 'partner_id column already exists';
  END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_bins_partner_id ON bins(partner_id);
        `);
        console.log('--- End SQL ---\n');
        
        console.log('After running this SQL, try the partner assignment again.');
      } else {
        console.error('Error checking bins table:', testError);
      }
    } else {
      console.log('✅ Column partner_id exists in bins table');
      
      // Check if we can update it
      const { data: updateTest, error: updateError } = await supabase
        .from('bins')
        .update({ partner_id: null })
        .eq('id', 'test-id-that-does-not-exist');
      
      if (updateError && !updateError.message.includes('0 rows')) {
        console.log('❌ Error updating partner_id:', updateError.message);
      } else {
        console.log('✅ Can update partner_id column successfully');
      }
    }
    
    // Also check if partners table exists
    const { data: partnersTest, error: partnersError } = await supabase
      .from('partners')
      .select('id')
      .limit(1);
    
    if (partnersError) {
      console.log('❌ Partners table issue:', partnersError.message);
      if (partnersError.message.includes('partners')) {
        console.log('The partners table might not exist or might still be named partner_applications');
      }
    } else {
      console.log('✅ Partners table exists and is accessible');
    }
    
  } catch (error) {
    console.error('Error checking database structure:', error);
  }
}

checkAndFixPartnerColumn();