import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseService } from '@/services/supabaseService';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface BinLocation {
  id: string;
  binNumber: string;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  status: 'Available' | 'Unavailable' | 'Full' | 'Almost Full' | 'Warehouse';
  distance?: number;
  assignedDriver?: string; // Keep for backward compatibility (driver name)
  driverId?: string; // Foreign key to drivers table
  partnerId?: string; // Foreign key to partners table (renamed from partnerApplicationId)
  createdDate?: string;
  fullSince?: string; // ISO timestamp of when bin was marked as Full
  // Sensor integration fields
  sensorId?: string; // Sensoneo sensor identifier
  containerId?: number; // Sensoneo container ID
  fillLevel?: number; // Current fill percentage (0-100)
  lastSensorUpdate?: string; // Timestamp of last sensor reading
  batteryLevel?: number; // Sensor battery voltage
  temperature?: number; // Current temperature reading
  sensorEnabled?: boolean; // Whether sensor tracking is enabled for this bin
}

// Use environment variable to determine if Supabase is enabled
const USE_SUPABASE = isSupabaseConfigured;

interface BinsContextType {
  bins: BinLocation[];
  setBins: React.Dispatch<React.SetStateAction<BinLocation[]>>;
  addBin: (bin: BinLocation) => Promise<void>;
  updateBin: (id: string, updates: Partial<BinLocation>) => Promise<void>;
  deleteBin: (id: string) => Promise<void>;
  refreshBins: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const BinsContext = createContext<BinsContextType | undefined>(undefined);

export const useBins = () => {
  const context = useContext(BinsContext);
  if (context === undefined) {
    throw new Error('useBins must be used within a BinsProvider');
  }
  return context;
};

// Generate a proper UUID for Supabase
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const STORAGE_KEY = 'binsData';

export const BinsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bins, setBins] = useState<BinLocation[]>([]); // Start with empty array
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize bins data
  useEffect(() => {
    const initializeBins = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (USE_SUPABASE) {
          // Try to fetch from Supabase
          const supabaseBins = await SupabaseService.bins.getAllBins();
          
          if (supabaseBins.length > 0) {
            setBins(supabaseBins);
          } else {
            setBins([]);
          }
        } else {
          // Fallback to localStorage
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && stored !== 'undefined' && stored !== 'null') {
              const parsedBins = JSON.parse(stored);
              if (Array.isArray(parsedBins)) {
                setBins(parsedBins);
              } else {
                setBins([]);
                localStorage.setItem(STORAGE_KEY, '[]'); // Initialize empty array
              }
            } else {
              setBins([]);
              localStorage.setItem(STORAGE_KEY, '[]'); // Initialize empty array
            }
          } catch (error) {
            console.error('[BinsProvider] Error loading bins from localStorage:', error);
            setBins([]);
          }
        }
      } catch (error) {
        console.error('[BinsProvider] Failed to initialize bins:', error);
        setError(error instanceof Error ? error.message : 'Failed to load bins');
        // Fallback to localStorage in case of Supabase failure
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsedBins = JSON.parse(stored);
            setBins(Array.isArray(parsedBins) ? parsedBins : []);
          } else {
            setBins([]);
          }
        } catch {
          setBins([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeBins();
  }, []);

  const addBin = async (newBin: BinLocation) => {
    if (USE_SUPABASE) {
      try {
        const createdBin = await SupabaseService.bins.createBin(newBin);
        setBins(prevBins => [...prevBins, createdBin]);
      } catch (error) {
        console.error('Error creating bin:', error);
        setError(`Failed to create bin: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    } else {
      const newBinWithId = { ...newBin, id: newBin.id || generateUUID() };
      setBins(prevBins => {
        const updated = [...prevBins, newBinWithId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateBin = async (id: string, updates: Partial<BinLocation>) => {
    setError(null);
    try {
      if (USE_SUPABASE) {
        try {
          // Call the service to update in database
          const updatedBin = await SupabaseService.bins.updateBin(id, updates);
          
          // Update local state with the response
          setBins(prev => prev.map(bin => {
            if (bin.id === id) {
              // If we got a full response, use it
              if (updatedBin && Object.keys(updatedBin).length > 2) {
                console.log('[BinsProvider] Using full response from database');
                return updatedBin;
              }
              // Otherwise merge the updates
              console.log('[BinsProvider] Merging updates with existing bin');
              return { ...bin, ...updates };
            }
            return bin;
          }));
        } catch (dbError) {
          console.error('[BinsProvider] Database update failed:', dbError);
          throw dbError;
        }
      } else {
        setBins(prev => {
          const updated = prev.map(bin => bin.id === id ? { ...bin, ...updates } : bin);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('[BinsProvider] Failed to update bin:', error);
      setError(error instanceof Error ? error.message : 'Failed to update bin');
      throw error;
    }
  };

  const deleteBin = async (id: string) => {
    setError(null);
    try {
      if (USE_SUPABASE) {
        await SupabaseService.bins.deleteBin(id);
      }
      
      setBins(prev => {
        const updated = prev.filter(bin => bin.id !== id);
        if (!USE_SUPABASE) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });
    } catch (error) {
      console.error('[BinsProvider] Failed to delete bin:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete bin');
      throw error;
    }
  };

  const refreshBins = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (USE_SUPABASE) {
        const supabaseBins = await SupabaseService.bins.getAllBins();
        setBins(supabaseBins);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedBins = JSON.parse(stored);
          setBins(Array.isArray(parsedBins) ? parsedBins : []);
        }
      }
    } catch (error) {
      console.error('[BinsProvider] Failed to refresh bins:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh bins');
    } finally {
      setIsLoading(false);
    }
  };

  const value: BinsContextType = {
    bins,
    setBins,
    isLoading,
    error,
    addBin,
    updateBin,
    deleteBin,
    refreshBins,
  };

  return <BinsContext.Provider value={value}>{children}</BinsContext.Provider>;
};

export default BinsProvider;