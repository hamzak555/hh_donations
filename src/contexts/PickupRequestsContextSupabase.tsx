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
}

interface PickupRequestsContextType {
  pickupRequests: PickupRequest[];
  addPickupRequest: (request: Omit<PickupRequest, 'id'>) => Promise<void>;
  updatePickupRequest: (id: string, updates: Partial<PickupRequest>) => Promise<void>;
  deletePickupRequest: (id: string) => Promise<void>;
  getPickupRequestById: (id: string) => PickupRequest | undefined;
}

const PickupRequestsContext = createContext<PickupRequestsContextType | undefined>(undefined);

const STORAGE_KEY = 'pickupRequests';

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
    adminNotes: dbRequest.adminNotes || undefined
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
  
  return dbRequest;
};

export const PickupRequestsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>(() => {
    // Initialize state directly from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsedRequests = JSON.parse(stored);
        if (Array.isArray(parsedRequests)) {
          return parsedRequests;
        }
      }
      
      return [];
        // Optionally add sample data only for development
        // Commenting out to prevent overwriting user submissions
        /*
        const sampleRequests: PickupRequest[] = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@email.com',
            phone: '(416) 555-0123',
            address: '123 Main Street, Toronto, ON M5V 3A8',
            date: '2024-01-15',
            time: '10:00 AM - 2:00 PM',
            additionalNotes: 'Large furniture items, please bring extra help',
            location: { lat: 43.6426, lng: -79.3871 },
            submittedAt: '2024-01-10T09:00:00.000Z',
            status: 'Pending'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '(647) 555-0456',
            address: '456 Oak Avenue, Toronto, ON M4E 2B7',
            date: '2024-01-18',
            time: '9:00 AM - 12:00 PM',
            additionalNotes: 'Mostly clothing and household items',
            location: { lat: 43.6532, lng: -79.3832 },
            submittedAt: '2024-01-12T14:30:00.000Z',
            status: 'Confirmed',
            assignedDriver: 'Michael Brown'
          },
          {
            id: '3',
            name: 'David Wilson',
            email: 'david.wilson@email.com',
            phone: '(416) 555-0789',
            address: '789 Pine Street, Mississauga, ON L5M 1G4',
            date: '2024-01-20',
            time: '1:00 PM - 5:00 PM',
            location: { lat: 43.5890, lng: -79.6441 },
            submittedAt: '2024-01-13T16:45:00.000Z',
            status: 'In Progress',
            assignedDriver: 'Emily Davis'
          }
        ];
        setPickupRequests(sampleRequests);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleRequests));
        */
    } catch (error) {
      console.error('[PickupRequestsContext] Error loading pickup requests:', error);
      return [];
    }
  });

  // Load pickup requests from Supabase on mount if configured
  useEffect(() => {
    const loadPickupRequests = async () => {
      if (USE_SUPABASE) {
        try {
          const dbRequests = await SupabaseService.pickupRequests.getAllPickupRequests();
          // Always update with Supabase data when available (even if empty)
          // This ensures we don't show stale localStorage data
          if (dbRequests !== null && dbRequests !== undefined) {
            const convertedRequests = dbRequests.map(convertFromDatabase);
            setPickupRequests(convertedRequests);
            // Also save to localStorage as backup
            localStorage.setItem(STORAGE_KEY, JSON.stringify(convertedRequests));
          }
        } catch (error) {
          console.error('[PickupRequestsContext] Failed to load from Supabase:', error);
          // Continue with localStorage data
        }
      }
    };
    loadPickupRequests();
  }, []);

  // Save to localStorage whenever pickupRequests change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pickupRequests));
    } catch (error) {
      console.error('[PickupRequestsContext] Error saving pickup requests:', error);
    }
  }, [pickupRequests]);

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
    getPickupRequestById
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