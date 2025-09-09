-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to send reminder emails for tomorrow's pickups (simplified version)
CREATE OR REPLACE FUNCTION send_daily_reminder_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pickup_record RECORD;
    function_response TEXT;
    sent_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    -- Log the function execution
    RAISE NOTICE 'Starting daily reminder email check at %', NOW();
    
    -- Find ALL pickup requests scheduled for tomorrow (no filtering by status or reminderSent)
    -- This matches the working "Send Reminders" button behavior
    FOR pickup_record IN
        SELECT 
            id, name, email, phone, address, date, time, 
            item_description as "additionalNotes"
        FROM pickup_requests 
        WHERE 
            -- Pickup is scheduled for tomorrow
            date = (CURRENT_DATE + INTERVAL '1 day')::date
            -- Email exists (only requirement)
            AND email IS NOT NULL 
            AND email != ''
    LOOP
        -- Log each pickup we're processing
        RAISE NOTICE 'Processing reminder for pickup ID: %, Email: %', pickup_record.id, pickup_record.email;
        
        BEGIN
            -- Call the Supabase Edge Function to send reminder email
            SELECT content INTO function_response
            FROM http((
                'POST',
                current_setting('app.supabase_url') || '/functions/v1/send-pickup-reminder',
                ARRAY[
                    http_header('Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')),
                    http_header('Content-Type', 'application/json')
                ],
                jsonb_build_object(
                    'email', pickup_record.email,
                    'name', pickup_record.name,
                    'address', pickup_record.address,
                    'pickupDate', pickup_record.date::text,
                    'specialInstructions', pickup_record."additionalNotes"
                )::text
            ));
            
            -- Mark reminder as sent (for tracking)
            UPDATE pickup_requests 
            SET 
                "reminderSent" = true,
                "reminderSentAt" = NOW()
            WHERE id = pickup_record.id;
            
            sent_count := sent_count + 1;
            RAISE NOTICE 'Successfully sent reminder for pickup ID: %', pickup_record.id;
            
            -- Small delay between emails to avoid overwhelming the service
            PERFORM pg_sleep(0.5);
            
        EXCEPTION WHEN OTHERS THEN
            -- Log errors but continue processing other pickups
            error_count := error_count + 1;
            RAISE NOTICE 'Failed to send reminder for pickup ID: %. Error: %', pickup_record.id, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Completed daily reminder email check at %. Sent: %, Errors: %', NOW(), sent_count, error_count;
END;
$$;

-- Grant execute permission to the service role
GRANT EXECUTE ON FUNCTION send_daily_reminder_emails() TO service_role;

-- Schedule the function to run every day at 9:00 PM (21:00)
-- This gives users ~12 hours notice before the 9 AM pickup window
SELECT cron.schedule(
    'daily-pickup-reminders',
    '0 21 * * *',  -- Every day at 9:00 PM
    'SELECT send_daily_reminder_emails();'
);

-- Create a function to manually test the cron job
CREATE OR REPLACE FUNCTION test_daily_reminders()
RETURNS TABLE(
    pickup_id TEXT,
    email_address TEXT,
    status TEXT,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pickup_record RECORD;
    function_response TEXT;
BEGIN
    RAISE NOTICE 'Testing daily reminder function manually...';
    
    -- Find pickup requests scheduled for tomorrow
    FOR pickup_record IN
        SELECT 
            id, name, email, phone, address, date, time, 
            item_description as "additionalNotes"
        FROM pickup_requests 
        WHERE 
            date = (CURRENT_DATE + INTERVAL '1 day')::date
            AND email IS NOT NULL 
            AND email != ''
    LOOP
        BEGIN
            -- Call the Edge Function
            SELECT content INTO function_response
            FROM http((
                'POST',
                current_setting('app.supabase_url') || '/functions/v1/send-pickup-reminder',
                ARRAY[
                    http_header('Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')),
                    http_header('Content-Type', 'application/json')
                ],
                jsonb_build_object(
                    'email', pickup_record.email,
                    'name', pickup_record.name,
                    'address', pickup_record.address,
                    'pickupDate', pickup_record.date::text,
                    'specialInstructions', pickup_record."additionalNotes"
                )::text
            ));
            
            -- Mark as sent
            UPDATE pickup_requests 
            SET 
                "reminderSent" = true,
                "reminderSentAt" = NOW()
            WHERE id = pickup_record.id;
            
            -- Return success result
            RETURN QUERY SELECT 
                pickup_record.id::TEXT,
                pickup_record.email::TEXT,
                'SUCCESS'::TEXT,
                'Reminder sent successfully'::TEXT;
            
        EXCEPTION WHEN OTHERS THEN
            -- Return error result
            RETURN QUERY SELECT 
                pickup_record.id::TEXT,
                pickup_record.email::TEXT,
                'ERROR'::TEXT,
                SQLERRM::TEXT;
        END;
    END LOOP;
    
    RETURN;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION test_daily_reminders() TO authenticated, anon;

-- Show current cron jobs (for verification)
SELECT * FROM cron.job;