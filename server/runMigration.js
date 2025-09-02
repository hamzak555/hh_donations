const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Running migration to add email tracking columns...');
  
  try {
    // Execute the SQL to add columns
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add email tracking columns to pickup_requests table
        ALTER TABLE pickup_requests 
        ADD COLUMN IF NOT EXISTS "confirmationSent" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "confirmationSentAt" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "reminderSent" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "reminderSentAt" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "completionEmailSent" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "completionEmailSentAt" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "emailPreferences" JSONB DEFAULT '{"sendConfirmation": true, "sendReminder": true, "sendCompletion": true}'::jsonb;
      `
    });

    if (error) {
      // If RPC doesn't work, try a different approach
      console.log('RPC method failed, trying direct approach...');
      
      // Check if columns exist by trying to select them
      const { data: testData, error: testError } = await supabase
        .from('pickup_requests')
        .select('id, confirmationSent')
        .limit(1);
      
      if (testError && testError.message.includes('does not exist')) {
        console.error('❌ Columns do not exist and cannot be added programmatically.');
        console.log('\n📝 Please run this SQL in your Supabase SQL Editor:');
        console.log('-------------------------------------------');
        console.log(`
ALTER TABLE pickup_requests 
ADD COLUMN IF NOT EXISTS "confirmationSent" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "confirmationSentAt" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "reminderSent" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "reminderSentAt" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "completionEmailSent" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "completionEmailSentAt" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "emailPreferences" JSONB DEFAULT '{"sendConfirmation": true, "sendReminder": true, "sendCompletion": true}'::jsonb;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pickup_requests_email ON pickup_requests(email);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_confirmation_sent ON pickup_requests("confirmationSent");
CREATE INDEX IF NOT EXISTS idx_pickup_requests_submitted_at ON pickup_requests("submittedAt");
        `);
        console.log('-------------------------------------------');
        console.log('\n🔗 Go to: https://supabase.com/dashboard/project/kbdhzmlcomthrhxkifbf/sql/new');
      } else if (!testError) {
        console.log('✅ Columns already exist!');
      } else {
        console.error('Unknown error:', testError);
      }
    } else {
      console.log('✅ Migration completed successfully!');
    }
  } catch (err) {
    console.error('Error running migration:', err);
  }
}

runMigration();