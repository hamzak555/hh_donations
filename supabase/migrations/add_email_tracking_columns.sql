-- Add email tracking columns to pickup_requests table
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