import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseService } from '@/services/supabaseService';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface PickupRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  time: string;
  additionalNotes?: string;
  location?: {
    lat: number;
    lng: number;
  };
  submittedAt: string;
  status: 'Pending' | 'Overdue' | 'Picked Up' | 'Cancelled';
  assignedDriver?: string;
  adminNotes?: string;
  // Email tracking fields
  confirmationSent?: boolean;
  confirmationSentAt?: string;
  reminderSent?: boolean;
  reminderSentAt?: string;
  completionEmailSent?: boolean;
  completionEmailSentAt?: string;
  emailPreferences?: {
    sendConfirmation?: boolean;
    sendReminder?: boolean;
    sendCompletion?: boolean;
  };
}

interface PickupRequestsContextType {
  pickupRequests: PickupRequest[];
  addPickupRequest: (request: Omit<PickupRequest, 'id'>) => Promise<void>;
  updatePickupRequest: (id: string, updates: Partial<PickupRequest>) => Promise<void>;
  deletePickupRequest: (id: string) => Promise<void>;
  getPickupRequestById: (id: string) => PickupRequest | undefined;
  refreshPickupRequests: () => Promise<void>;
}

const PickupRequestsContext = createContext<PickupRequestsContextType | undefined>(undefined);

// Check if Supabase is configured
const USE_SUPABASE = isSupabaseConfigured;

// Simplified helper functions - direct mapping after column rename
const convertFromDatabase = (dbRequest: any): PickupRequest => {
  return {
    id: dbRequest.id,
    name: dbRequest.name,
    email: dbRequest.email,
    phone: dbRequest.phone,
    address: dbRequest.address,
    date: dbRequest.date,
    time: dbRequest.time,
    // Map item_description back to additionalNotes
    additionalNotes: dbRequest.item_description || dbRequest.additionalNotes || undefined,
    // Use location JSONB if available, otherwise reconstruct from lat/lng
    location: dbRequest.location || (dbRequest.lat && dbRequest.lng ? { lat: dbRequest.lat, lng: dbRequest.lng } : undefined),
    submittedAt: dbRequest.submittedAt || dbRequest.created_at,
    status: dbRequest.status as 'Pending' | 'Picked Up' | 'Cancelled',
    assignedDriver: dbRequest.assignedDriver || undefined,
    adminNotes: dbRequest.adminNotes || undefined,
    // Email tracking fields - handle booleans correctly (don't use || for booleans)
    confirmationSent: dbRequest.confirmationSent === true,
    confirmationSentAt: dbRequest.confirmationSentAt || undefined,
    reminderSent: dbRequest.reminderSent === true,
    reminderSentAt: dbRequest.reminderSentAt || undefined,
    completionEmailSent: dbRequest.completionEmailSent === true,
    completionEmailSentAt: dbRequest.completionEmailSentAt || undefined,
    emailPreferences: dbRequest.emailPreferences || undefined
  };
};

const convertToDatabase = (request: Partial<PickupRequest>): any => {
  // Map frontend fields to database column names
  const dbRequest: any = {};
  
  // Direct mappings
  if (request.id !== undefined) dbRequest.id = request.id;
  if (request.name !== undefined) dbRequest.name = request.name;
  if (request.email !== undefined) dbRequest.email = request.email;
  if (request.phone !== undefined) dbRequest.phone = request.phone;
  if (request.address !== undefined) dbRequest.address = request.address;
  if (request.date !== undefined) dbRequest.date = request.date;
  if (request.time !== undefined) dbRequest.time = request.time;
  if (request.status !== undefined) dbRequest.status = request.status;
  if (request.assignedDriver !== undefined) dbRequest.assignedDriver = request.assignedDriver;
  if (request.adminNotes !== undefined) dbRequest.adminNotes = request.adminNotes;
  if (request.submittedAt !== undefined) dbRequest.submittedAt = request.submittedAt;
  
  // Field mapping: additionalNotes -> item_description
  if (request.additionalNotes !== undefined) {
    dbRequest.item_description = request.additionalNotes;
  }
  
  // Location handling: extract lat/lng AND store location JSONB
  if (request.location && typeof request.location === 'object') {
    dbRequest.lat = request.location.lat;
    dbRequest.lng = request.location.lng;
    dbRequest.location = request.location; // Also store as JSONB
  }
  
  // Email tracking fields
  if (request.confirmationSent !== undefined) dbRequest.confirmationSent = request.confirmationSent;
  if (request.confirmationSentAt !== undefined) dbRequest.confirmationSentAt = request.confirmationSentAt;
  if (request.reminderSent !== undefined) dbRequest.reminderSent = request.reminderSent;
  if (request.reminderSentAt !== undefined) dbRequest.reminderSentAt = request.reminderSentAt;
  if (request.completionEmailSent !== undefined) dbRequest.completionEmailSent = request.completionEmailSent;
  if (request.completionEmailSentAt !== undefined) dbRequest.completionEmailSentAt = request.completionEmailSentAt;
  if (request.emailPreferences !== undefined) dbRequest.emailPreferences = request.emailPreferences;
  
  return dbRequest;
};

export const PickupRequestsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Always start with empty array - data will be loaded from Supabase only
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);

  // Refresh function to load pickup requests from Supabase
  const refreshPickupRequests = async () => {
    if (USE_SUPABASE) {
      try {
        console.log('[PickupRequestsContext] Refreshing pickup requests...');
        const dbRequests = await SupabaseService.pickupRequests.getAllPickupRequests();
        // Always update with Supabase data when available (even if empty)
        if (dbRequests !== null && dbRequests !== undefined) {
          const convertedRequests = dbRequests.map(convertFromDatabase);
          // Log the most recent request to see email status
          const recentRequest = dbRequests.find((r: any) => r.email === 'hk11345@gmail.com');
          if (recentRequest) {
            console.log('[PickupRequestsContext] Recent request email status:', {
              raw: {
                confirmationSent: recentRequest.confirmationSent,
                confirmationSentAt: recentRequest.confirmationSentAt
              },
              converted: convertedRequests.find(r => r.email === 'hk11345@gmail.com')
            });
          }
          setPickupRequests(convertedRequests);
          console.log('[PickupRequestsContext] Refreshed with', convertedRequests.length, 'requests from Supabase');
        } else {
          console.log('[PickupRequestsContext] No data received from Supabase');
        }
      } catch (error) {
        console.error('[PickupRequestsContext] Failed to refresh from Supabase:', error);
        // Continue with current data
      }
    } else {
      console.log('[PickupRequestsContext] Supabase not configured');
    }
  };

  // Load pickup requests from Supabase on mount if configured
  useEffect(() => {
    // Load data initially from Supabase only
    refreshPickupRequests();

    // Set up real-time subscription for pickup request updates
    let subscription: any;
    let intervalId: NodeJS.Timeout;
    
    if (USE_SUPABASE) {
      const { supabase } = require('@/lib/supabase');
      subscription = supabase
        .channel('pickup-requests-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'pickup_requests' 
          }, 
          (payload: any) => {
            console.log('[PickupRequestsContext] Real-time update received:', payload);
            
            if (payload.eventType === 'INSERT') {
              const newRequest = convertFromDatabase(payload.new);
              setPickupRequests(prev => [...prev, newRequest]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedRequest = convertFromDatabase(payload.new);
              setPickupRequests(prev => prev.map(req => 
                req.id === updatedRequest.id ? updatedRequest : req
              ));
            } else if (payload.eventType === 'DELETE') {
              setPickupRequests(prev => prev.filter(req => req.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      // Also set up periodic refresh every 30 seconds as a backup
      intervalId = setInterval(() => {
        refreshPickupRequests();
      }, 30000);
    }

    // Cleanup subscription and interval on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // No localStorage saving - Supabase is the single source of truth

  // Generate a proper UUID for Supabase
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const addPickupRequest = async (request: Omit<PickupRequest, 'id'>) => {
    // Check for default driver if request doesn't have one assigned
    const defaultDriver = localStorage.getItem('defaultPickupDriver');
    
    const newRequest: PickupRequest = {
      ...request,
      id: generateUUID(), // Generate proper UUID for Supabase
      // Auto-assign default driver if available and request is pending without a driver
      assignedDriver: (request.status === 'Pending' && !request.assignedDriver && defaultDriver) 
        ? defaultDriver 
        : request.assignedDriver,
    };
    
    // Add to Supabase if configured
    if (USE_SUPABASE) {
      try {
        console.log('[PickupRequestsContext] Adding pickup request to Supabase:', newRequest);
        const dbRequest = convertToDatabase(newRequest);
        console.log('[PickupRequestsContext] Converted request for database:', dbRequest);
        
        const addedRequest = await SupabaseService.pickupRequests.createPickupRequest(dbRequest);
        console.log('[PickupRequestsContext] Supabase response:', addedRequest);
        
        if (addedRequest) {
          newRequest.id = addedRequest.id; // Use the database-generated ID
        }
      } catch (error) {
        console.error('[PickupRequestsContext] Failed to add to Supabase:', error);
        console.error('[PickupRequestsContext] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace',
          fullError: error
        });
        // Re-throw the error so the form can handle it
        throw error;
      }
    }
    
    setPickupRequests(prev => [...prev, newRequest]);
  };

  const updatePickupRequest = async (id: string, updates: Partial<PickupRequest>) => {
    // Update in Supabase if configured
    if (USE_SUPABASE) {
      try {
        const dbUpdates = convertToDatabase(updates);
        await SupabaseService.pickupRequests.updatePickupRequest(id, dbUpdates);
      } catch (error) {
        console.error('[PickupRequestsContext] Failed to update in Supabase:', error);
      }
    }
    
    setPickupRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, ...updates } : request
      )
    );
  };

  const deletePickupRequest = async (id: string) => {
    // Delete from Supabase if configured
    if (USE_SUPABASE) {
      try {
        await SupabaseService.pickupRequests.deletePickupRequest(id);
      } catch (error) {
        console.error('[PickupRequestsContext] Failed to delete from Supabase:', error);
      }
    }
    
    setPickupRequests(prev => prev.filter(request => request.id !== id));
  };

  const getPickupRequestById = (id: string): PickupRequest | undefined => {
    return pickupRequests.find(request => request.id === id);
  };

  const value: PickupRequestsContextType = {
    pickupRequests,
    addPickupRequest,
    updatePickupRequest,
    deletePickupRequest,
    getPickupRequestById,
    refreshPickupRequests
  };

  return (
    <PickupRequestsContext.Provider value={value}>
      {children}
    </PickupRequestsContext.Provider>
  );
};

export const usePickupRequests = (): PickupRequestsContextType => {
  const context = useContext(PickupRequestsContext);
  if (!context) {
    throw new Error('usePickupRequests must be used within a PickupRequestsProvider');
  }
  return context;
};