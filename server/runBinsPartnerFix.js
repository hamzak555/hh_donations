const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running bins partner trigger fix migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240128_fix_bins_partner_trigger.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('\n✅ Migration SQL prepared. Please run the following SQL in your Supabase SQL editor:');
    console.log('\n--- Copy everything below this line ---\n');
    console.log(migrationSQL);
    console.log('\n--- Copy everything above this line ---\n');
    console.log('Go to your Supabase dashboard > SQL Editor and paste the SQL above to fix the bins partner assignment issue.');
    
  } catch (error) {
    console.error('Error during migration:', error.message);
    process.exit(1);
  }
}

runMigration();