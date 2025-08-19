import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseService } from '@/services/supabaseService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { SafeStorage } from '@/utils/safeStorage';

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedBins: string[];
  status: 'Active' | 'Inactive';
  totalPickups: number;
  licenseNumber?: string;
  hireDate?: string;
  vehicleType?: string;
  notes?: string;
}

interface DriversContextType {
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  addDriver: (driver: Driver) => Promise<void>;
  updateDriver: (id: string, updates: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  getActiveDrivers: () => Driver[];
  refreshDrivers: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const DriversContext = createContext<DriversContextType | undefined>(undefined);

const STORAGE_KEY = 'driversData';

// Check if Supabase is configured
const USE_SUPABASE = isSupabaseConfigured;

// Generate a proper UUID for Supabase
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const DriversProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load drivers from Supabase or localStorage
  const loadDrivers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (USE_SUPABASE) {
        console.log('[DriversProvider] Using Supabase for data persistence');
        const supabaseDrivers = await SupabaseService.drivers.getAllDrivers();
        
        // Direct mapping from database format after column rename
        const formattedDrivers: Driver[] = supabaseDrivers.map(d => ({
          id: d.id,
          name: d.name,
          email: d.email || '',
          phone: d.phone,
          assignedBins: d.assignedBins || [], // Direct mapping after column rename
          status: (d.status === 'On Leave' ? 'Inactive' : d.status) as 'Active' | 'Inactive',
          totalPickups: d.totalPickups || 0, // Now available in database
          licenseNumber: d.licenseNumber, // Direct mapping after column rename
          hireDate: d.hireDate, // Direct mapping after column rename
          vehicleType: d.vehicleType, // Direct mapping after column rename
          notes: d.notes
        }));
        
        setDrivers(formattedDrivers);
        console.log(`[DriversProvider] Loaded ${formattedDrivers.length} drivers from Supabase`);
        
        // Sync to localStorage for offline access
        SafeStorage.setItem(STORAGE_KEY, JSON.stringify(formattedDrivers));
      } else {
        console.log('[DriversProvider] Using localStorage (Supabase not configured)');
        const stored = SafeStorage.getLatestValue(STORAGE_KEY);
        
        if (stored && stored !== 'undefined' && stored !== 'null' && stored !== '[]') {
          const parsedDrivers = JSON.parse(stored);
          if (Array.isArray(parsedDrivers) && parsedDrivers.length > 0) {
            setDrivers(parsedDrivers);
          }
        }
      }
    } catch (err) {
      console.error('[DriversProvider] Error loading drivers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load drivers');
      
      // Fallback to localStorage if Supabase fails
      try {
        const stored = SafeStorage.getLatestValue(STORAGE_KEY);
        if (stored) {
          const parsedDrivers = JSON.parse(stored);
          setDrivers(parsedDrivers);
          console.log('[DriversProvider] Loaded from localStorage fallback');
        }
      } catch (fallbackErr) {
        console.error('[DriversProvider] Fallback also failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDrivers();
  }, []);

  const addDriver = async (driver: Driver) => {
    try {
      if (USE_SUPABASE) {
        // Direct mapping to database format after column rename
        const dbDriver = {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          email: driver.email || undefined,
          licenseNumber: driver.licenseNumber || `LIC-${driver.id}`, // Direct mapping
          hireDate: driver.hireDate || new Date().toISOString().split('T')[0], // Direct mapping
          status: driver.status,
          assignedBins: driver.assignedBins, // Direct mapping
          vehicleType: driver.vehicleType, // Direct mapping
          totalPickups: driver.totalPickups || 0,
          notes: driver.notes
        };
        
        await SupabaseService.drivers.createDriver(dbDriver);
        await loadDrivers(); // Reload to get the latest data
      } else {
        const newDrivers = [...drivers, driver];
        setDrivers(newDrivers);
        SafeStorage.setItem(STORAGE_KEY, JSON.stringify(newDrivers));
      }
    } catch (err) {
      console.error('[DriversProvider] Error adding driver:', err);
      throw err;
    }
  };

  const updateDriver = async (id: string, updates: Partial<Driver>) => {
    try {
      if (USE_SUPABASE) {
        // Direct mapping for updates after column rename
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.assignedBins !== undefined) dbUpdates.assignedBins = updates.assignedBins; // Direct mapping
        if (updates.licenseNumber !== undefined) dbUpdates.licenseNumber = updates.licenseNumber; // Direct mapping
        if (updates.hireDate !== undefined) dbUpdates.hireDate = updates.hireDate; // Direct mapping
        if (updates.vehicleType !== undefined) dbUpdates.vehicleType = updates.vehicleType; // Direct mapping
        if (updates.totalPickups !== undefined) dbUpdates.totalPickups = updates.totalPickups;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        
        await SupabaseService.drivers.updateDriver(id, dbUpdates);
        await loadDrivers(); // Reload to get the latest data
      } else {
        const newDrivers = drivers.map(d => 
          d.id === id ? { ...d, ...updates } : d
        );
        setDrivers(newDrivers);
        SafeStorage.setItem(STORAGE_KEY, JSON.stringify(newDrivers));
      }
    } catch (err) {
      console.error('[DriversProvider] Error updating driver:', err);
      throw err;
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      if (USE_SUPABASE) {
        await SupabaseService.drivers.deleteDriver(id);
        await loadDrivers(); // Reload to get the latest data
      } else {
        const newDrivers = drivers.filter(d => d.id !== id);
        setDrivers(newDrivers);
        SafeStorage.setItem(STORAGE_KEY, JSON.stringify(newDrivers));
      }
    } catch (err) {
      console.error('[DriversProvider] Error deleting driver:', err);
      throw err;
    }
  };

  const getActiveDrivers = () => {
    return drivers.filter(d => d.status === 'Active');
  };

  const refreshDrivers = async () => {
    await loadDrivers();
  };

  const value = {
    drivers,
    setDrivers,
    addDriver,
    updateDriver,
    deleteDriver,
    getActiveDrivers,
    refreshDrivers,
    isLoading,
    error
  };

  return (
    <DriversContext.Provider value={value}>
      {children}
    </DriversContext.Provider>
  );
};

export const useDrivers = () => {
  const context = useContext(DriversContext);
  if (context === undefined) {
    throw new Error('useDrivers must be used within a DriversProvider');
  }
  return context;
};