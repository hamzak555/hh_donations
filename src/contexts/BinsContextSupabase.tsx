import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BinLocation } from '../types';
import { SupabaseService } from '../services/supabaseService';

// Use Supabase as primary data source, with localStorage as fallback
const USE_SUPABASE = true;

interface BinsContextType {
  bins: BinLocation[];
  isLoading: boolean;
  error: string | null;
  addBin: (bin: Omit<BinLocation, 'id' | 'createdDate'>) => Promise<void>;
  updateBin: (id: string, updates: Partial<BinLocation>) => Promise<void>;
  deleteBin: (id: string) => Promise<void>;
  refreshBins: () => Promise<void>;
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
          console.log('[BinsProvider] Using Supabase for data persistence');
          // Try to fetch from Supabase
          const supabaseBins = await SupabaseService.bins.getAllBins();
          
          if (supabaseBins.length > 0) {
            console.log(`[BinsProvider] Loaded ${supabaseBins.length} bins from Supabase`);
            setBins(supabaseBins);
          } else {
            console.log('[BinsProvider] No bins in Supabase, starting with empty array');
            setBins([]);
          }
        } else {
          console.log('[BinsProvider] Using localStorage for data persistence');
          // Fallback to localStorage
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && stored !== 'undefined' && stored !== 'null') {
              const parsedBins = JSON.parse(stored);
              if (Array.isArray(parsedBins)) {
                setBins(parsedBins);
              } else {
                setBins([]);
              }
            } else {
              setBins([]);
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

  const addBin = async (binData: Omit<BinLocation, 'id' | 'createdDate'>) => {
    setError(null);
    try {
      const newBin: BinLocation = {
        ...binData,
        id: generateUUID(),
        createdDate: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
      };

      if (USE_SUPABASE) {
        const supabaseBin = await SupabaseService.bins.createBin(newBin);
        setBins(prev => [...prev, supabaseBin]);
      } else {
        setBins(prev => {
          const updated = [...prev, newBin];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('[BinsProvider] Failed to add bin:', error);
      setError(error instanceof Error ? error.message : 'Failed to add bin');
      throw error;
    }
  };

  const updateBin = async (id: string, updates: Partial<BinLocation>) => {
    setError(null);
    try {
      if (USE_SUPABASE) {
        const updatedBin = await SupabaseService.bins.updateBin(id, updates);
        setBins(prev => prev.map(bin => bin.id === id ? updatedBin : bin));
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