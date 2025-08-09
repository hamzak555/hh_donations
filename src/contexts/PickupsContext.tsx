import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Pickup {
  id: string;
  binNumber: string;
  locationName: string;
  driverName: string;
  pickupDate: string;
  pickupTime: string;
  loadType: 'A - Excellent' | 'B - Good' | 'C - Fair';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  estimatedWeight: number;
  actualWeight?: number;
  notes?: string;
}

interface PickupsContextType {
  pickups: Pickup[];
  addPickup: (pickup: Pickup) => void;
  updatePickup: (id: string, updates: Partial<Pickup>) => void;
  deletePickup: (id: string) => void;
  getUpcomingPickups: () => Pickup[];
  getCompletedPickups: () => Pickup[];
}

const PickupsContext = createContext<PickupsContextType | undefined>(undefined);

const initialPickups: Pickup[] = [
  {
    id: '1',
    binNumber: 'BIN001',
    locationName: 'Community Center',
    driverName: 'John Smith',
    pickupDate: '2024-01-20',
    pickupTime: '10:00 AM',
    loadType: 'A - Excellent',
    status: 'Scheduled',
    estimatedWeight: 150,
    notes: 'Full bin, priority pickup'
  },
  {
    id: '2',
    binNumber: 'BIN003',
    locationName: 'Public Library',
    driverName: 'Sarah Johnson',
    pickupDate: '2024-01-21',
    pickupTime: '2:00 PM',
    loadType: 'B - Good',
    status: 'Scheduled',
    estimatedWeight: 120
  },
  {
    id: '3',
    binNumber: 'BIN002',
    locationName: 'Shopping Mall',
    driverName: 'Michael Brown',
    pickupDate: '2024-01-19',
    pickupTime: '11:30 AM',
    loadType: 'A - Excellent',
    status: 'In Progress',
    estimatedWeight: 180
  },
  {
    id: '4',
    binNumber: 'BIN004',
    locationName: 'Recreation Center',
    driverName: 'John Smith',
    pickupDate: '2024-01-15',
    pickupTime: '9:00 AM',
    loadType: 'B - Good',
    status: 'Completed',
    estimatedWeight: 100,
    actualWeight: 95
  },
  {
    id: '5',
    binNumber: 'BIN001',
    locationName: 'Community Center',
    driverName: 'Sarah Johnson',
    pickupDate: '2024-01-10',
    pickupTime: '3:00 PM',
    loadType: 'A - Excellent',
    status: 'Completed',
    estimatedWeight: 140,
    actualWeight: 145
  },
  {
    id: '6',
    binNumber: 'BIN005',
    locationName: 'School Campus',
    driverName: 'Michael Brown',
    pickupDate: '2024-01-08',
    pickupTime: '10:30 AM',
    loadType: 'C - Fair',
    status: 'Completed',
    estimatedWeight: 80,
    actualWeight: 75
  },
  {
    id: '7',
    binNumber: 'BIN007',
    locationName: 'Transit Station',
    driverName: 'Emily Davis',
    pickupDate: '2024-01-22',
    pickupTime: '1:00 PM',
    loadType: 'B - Good',
    status: 'Scheduled',
    estimatedWeight: 110
  },
  {
    id: '8',
    binNumber: 'BIN008',
    locationName: 'City Hall',
    driverName: 'John Smith',
    pickupDate: '2024-01-23',
    pickupTime: '9:30 AM',
    loadType: 'A - Excellent',
    status: 'Scheduled',
    estimatedWeight: 130
  },
  {
    id: '9',
    binNumber: 'BIN013',
    locationName: 'Fire Station 24',
    driverName: 'Sarah Johnson',
    pickupDate: '2024-01-24',
    pickupTime: '11:00 AM',
    loadType: 'B - Good',
    status: 'Scheduled',
    estimatedWeight: 95
  }
];

const STORAGE_KEY = 'pickupsData';

export const PickupsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pickups, setPickups] = useState<Pickup[]>([]);

  // Load pickups from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedPickups = JSON.parse(stored);
        setPickups(Array.isArray(parsedPickups) ? parsedPickups : initialPickups);
      } else {
        // Initialize with default pickups if nothing in localStorage
        setPickups(initialPickups);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPickups));
      }
    } catch (error) {
      console.error('Error loading pickups:', error);
      setPickups(initialPickups);
    }
  }, []);

  // Save to localStorage whenever pickups change
  useEffect(() => {
    if (pickups.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pickups));
      } catch (error) {
        console.error('Error saving pickups:', error);
      }
    }
  }, [pickups]);

  const addPickup = (newPickup: Pickup) => {
    setPickups(prevPickups => [...prevPickups, newPickup]);
  };

  const updatePickup = (id: string, updates: Partial<Pickup>) => {
    setPickups(prevPickups => 
      prevPickups.map(pickup => 
        pickup.id === id ? { ...pickup, ...updates } : pickup
      )
    );
  };

  const deletePickup = (id: string) => {
    setPickups(prevPickups => prevPickups.filter(pickup => pickup.id !== id));
  };

  const getUpcomingPickups = () => {
    return pickups.filter(pickup => pickup.status === 'Scheduled' || pickup.status === 'In Progress');
  };

  const getCompletedPickups = () => {
    return pickups.filter(pickup => pickup.status === 'Completed');
  };

  return (
    <PickupsContext.Provider value={{ 
      pickups, 
      addPickup, 
      updatePickup, 
      deletePickup,
      getUpcomingPickups,
      getCompletedPickups
    }}>
      {children}
    </PickupsContext.Provider>
  );
};

export const usePickups = () => {
  const context = useContext(PickupsContext);
  if (context === undefined) {
    throw new Error('usePickups must be used within a PickupsProvider');
  }
  return context;
};