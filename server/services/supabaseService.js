const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for full access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not configured. Email status updates will not be saved.');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Update pickup request email status
async function updatePickupRequestEmailStatus(requestId, emailStatus) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping email status update');
    return null;
  }

  try {
    // First, try to find the pickup request by matching on multiple fields
    // Since requestId might be a timestamp or other identifier
    const { data: existingRequests, error: fetchError } = await supabase
      .from('pickup_requests')  // Fixed table name
      .select('*')
      .or(`id.eq.${requestId},submittedAt.eq.${requestId}`)
      .limit(1);

    if (fetchError) {
      console.error('Error fetching pickup request:', fetchError);
      return null;
    }

    if (!existingRequests || existingRequests.length === 0) {
      console.log(`No pickup request found with ID: ${requestId}`);
      // Try to find by date/time if requestId is a timestamp
      const timestamp = new Date(parseInt(requestId)).toISOString();
      const { data: timeBasedRequests, error: timeError } = await supabase
        .from('pickup_requests')
        .select('*')
        .gte('submittedAt', new Date(Date.now() - 60000).toISOString()) // Within last minute
        .order('submittedAt', { ascending: false })
        .limit(1);
      
      if (!timeError && timeBasedRequests && timeBasedRequests.length > 0) {
        const request = timeBasedRequests[0];
        const { data, error } = await supabase
          .from('pickup_requests')
          .update(emailStatus)
          .eq('id', request.id)
          .select();
        
        if (error) {
          console.error('Error updating pickup request:', error);
          return null;
        }
        
        console.log('Email status updated for pickup request:', request.id);
        return data;
      }
      return null;
    }

    // Update the first matching request
    const request = existingRequests[0];
    const { data, error } = await supabase
      .from('pickup_requests')
      .update(emailStatus)
      .eq('id', request.id)
      .select();

    if (error) {
      console.error('Error updating pickup request:', error);
      return null;
    }

    console.log('Email status updated for pickup request:', request.id);
    return data;
  } catch (error) {
    console.error('Error in updatePickupRequestEmailStatus:', error);
    return null;
  }
}

// Update pickup request by email (fallback method)
async function updatePickupRequestByEmail(email, emailStatus) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping email status update');
    return null;
  }

  try {
    // Find the most recent pickup request for this email
    console.log(`[SupabaseService] Looking for pickup request with email: ${email}`);
    const { data: requests, error: fetchError } = await supabase
      .from('pickup_requests')
      .select('*')
      .eq('email', email)
      .order('submittedAt', { ascending: false })
      .limit(1);
    
    console.log(`[SupabaseService] Query result:`, { requests: requests?.length, error: fetchError });

    if (fetchError) {
      console.error('Error fetching pickup request by email:', fetchError);
      // Try without the confirmationSent filter
      const { data: allRequests, error: allError } = await supabase
        .from('pickup_requests')
        .select('*')
        .eq('email', email)
        .order('submittedAt', { ascending: false })
        .limit(1);
      
      if (!allError && allRequests && allRequests.length > 0) {
        const request = allRequests[0];
        const { data, error } = await supabase
          .from('pickup_requests')
          .update(emailStatus)
          .eq('id', request.id)
          .select();
        
        if (!error) {
          console.log('Email status updated for pickup request:', request.id);
          return data;
        }
      }
      return null;
    }

    if (!requests || requests.length === 0) {
      console.log(`No unsent pickup request found for email: ${email}`);
      // Try to find any request for this email
      const { data: anyRequests, error: anyError } = await supabase
        .from('pickup_requests')
        .select('*')
        .eq('email', email)
        .order('submittedAt', { ascending: false })
        .limit(1);
      
      if (!anyError && anyRequests && anyRequests.length > 0) {
        const request = anyRequests[0];
        const { data, error } = await supabase
          .from('pickup_requests')
          .update(emailStatus)
          .eq('id', request.id)
          .select();
        
        if (!error) {
          console.log('Email status updated for pickup request:', request.id);
          return data;
        }
      }
      return null;
    }

    const request = requests[0];
    console.log(`[SupabaseService] Updating request ${request.id} with:`, emailStatus);
    console.log(`[SupabaseService] Current request data:`, {
      confirmationSent: request.confirmationSent,
      confirmationSentAt: request.confirmationSentAt,
      reminderSent: request.reminderSent,
      reminderSentAt: request.reminderSentAt
    });
    
    const { data, error } = await supabase
      .from('pickup_requests')
      .update(emailStatus)
      .eq('id', request.id)
      .select();

    if (error) {
      console.error('Error updating pickup request:', error);
      return null;
    }

    console.log('Email status updated for pickup request:', request.id);
    console.log('Updated data:', data);
    return data;
  } catch (error) {
    console.error('Error in updatePickupRequestByEmail:', error);
    return null;
  }
}

module.exports = {
  updatePickupRequestEmailStatus,
  updatePickupRequestByEmail
};