import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  status: 'Pending' | 'Picked Up' | 'Cancelled';
  assignedDriver?: string;
  adminNotes?: string;
}

interface PickupRequestsContextType {
  pickupRequests: PickupRequest[];
  addPickupRequest: (request: Omit<PickupRequest, 'id'>) => void;
  updatePickupRequest: (id: string, updates: Partial<PickupRequest>) => void;
  deletePickupRequest: (id: string) => void;
  getPickupRequestById: (id: string) => PickupRequest | undefined;
}

const PickupRequestsContext = createContext<PickupRequestsContextType | undefined>(undefined);

const STORAGE_KEY = 'pickupRequests';

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

  // Save to localStorage whenever pickupRequests change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pickupRequests));
    } catch (error) {
      console.error('[PickupRequestsContext] Error saving pickup requests:', error);
    }
  }, [pickupRequests]);

  const addPickupRequest = (request: Omit<PickupRequest, 'id'>) => {
    // Check for default driver if request doesn't have one assigned
    const defaultDriver = localStorage.getItem('defaultPickupDriver');
    
    const newRequest: PickupRequest = {
      ...request,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      // Auto-assign default driver if available and request is pending without a driver
      assignedDriver: (request.status === 'Pending' && !request.assignedDriver && defaultDriver) 
        ? defaultDriver 
        : request.assignedDriver,
    };
    
    setPickupRequests(prev => [...prev, newRequest]);
  };

  const updatePickupRequest = (id: string, updates: Partial<PickupRequest>) => {
    setPickupRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, ...updates } : request
      )
    );
  };

  const deletePickupRequest = (id: string) => {
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