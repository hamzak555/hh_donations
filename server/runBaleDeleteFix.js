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
    console.log('Running bale delete trigger fix migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240128_fix_bale_delete_trigger.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(/;(?=\s*(?:--|CREATE|DROP|ALTER|GRANT|SELECT|$))/gi)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        }).single();
        
        if (error) {
          // Try direct execution if RPC fails
          console.log('RPC failed, trying alternative method...');
          const { error: dbError } = await supabase.from('_migrations').select('*').limit(1);
          
          if (!dbError) {
            console.log(`Statement ${i + 1} would need manual execution:`, statement.substring(0, 50) + '...');
          }
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('\n✅ Migration instructions prepared. Please run the following SQL in your Supabase SQL editor:');
    console.log('\n--- Copy everything below this line ---\n');
    console.log(migrationSQL);
    console.log('\n--- Copy everything above this line ---\n');
    console.log('Go to your Supabase dashboard > SQL Editor and paste the SQL above to fix the bale deletion issue.');
    
  } catch (error) {
    console.error('Error during migration:', error.message);
    process.exit(1);
  }
}

runMigration();