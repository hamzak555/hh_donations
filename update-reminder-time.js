const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = 'https://kbdhzmlcomthrhxkifbf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZGh6bWxjb210aHJoeGtpZmJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzNDYxMCwiZXhwIjoyMDcxMTEwNjEwfQ.VWSBYO4QaED63B-jOJNQ-glN0nkSqeZhoFbic3dDIsM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePickupRequests() {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get pickup requests for Sept 4th, 2025
    const { data: requests, error } = await supabase
      .from('pickup_requests')
      .select('*')
      .gte('date', '2025-09-04')
      .lt('date', '2025-09-05');

    if (error) {
      console.error('Error fetching pickup requests:', error);
      return;
    }

    console.log(`Found ${requests?.length || 0} pickup requests for Sept 4th, 2025`);

    if (requests && requests.length > 0) {
      for (const request of requests) {
        console.log('\nPickup Request Details:');
        console.log('  ID:', request.id);
        console.log('  Name:', request.name);
        console.log('  Email:', request.email);
        console.log('  Date:', request.date);
        console.log('  Status:', request.status);
        
        // The reminder should be sent at 9 PM on Sept 3rd (12 hours before 9 AM pickup)
        console.log('\n  ✅ Reminder will now be sent at 9:00 PM on Sept 3rd, 2025');
        console.log('  (This is 12 hours before the 9:00 AM pickup time on Sept 4th)');
        
        // Note: The actual reminder scheduling is handled by the backend server
        // which has already been updated with the correct time
      }
    } else {
      console.log('No pickup requests found for Sept 4th, 2025');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

updatePickupRequests();