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
  status: 'Available' | 'Unavailable' | 'Full' | 'Almost Full';
  distance?: number;
  assignedDriver?: string;
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

// Use environment variable to determine if Supabase is enabled
const USE_SUPABASE = isSupabaseConfigured;

// Generate a proper UUID for Supabase
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const initialBins: BinLocation[] = [
  {
    id: '1',
    binNumber: 'BIN001',
    locationName: 'Community Center',
    address: '123 Main St, Toronto, ON',
    status: 'Available',
    lat: 43.6532,
    lng: -79.3832,
    createdDate: '2023-06-15',
    containerId: 1001, // Test Sensoneo container ID
    sensorEnabled: true
  },
  {
    id: '2',
    binNumber: 'BIN002',
    locationName: 'Shopping Mall',
    address: '456 Queen St W, Toronto, ON',
    status: 'Available',
    lat: 43.6489,
    lng: -79.3963,
    createdDate: '2023-07-22',
    containerId: 1002, // Test Sensoneo container ID
    sensorEnabled: true
  },
  {
    id: '3',
    binNumber: 'BIN003',
    locationName: 'Public Library',
    address: '789 King St E, Toronto, ON',
    status: 'Unavailable',
    lat: 43.6544,
    lng: -79.3607,
    createdDate: '2023-08-10'
  },
  {
    id: '4',
    binNumber: 'BIN004',
    locationName: 'Recreation Center',
    address: '321 Dundas St W, Toronto, ON',
    status: 'Available',
    lat: 43.6551,
    lng: -79.3865,
    createdDate: '2023-09-05'
  },
  {
    id: '5',
    binNumber: 'BIN005',
    locationName: 'School Campus',
    address: '654 College St, Toronto, ON',
    status: 'Full',
    lat: 43.6589,
    lng: -79.4057,
    createdDate: '2023-10-12',
    fullSince: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    containerId: 1005, // Test Sensoneo container ID
    sensorEnabled: true
  },
  {
    id: '6',
    binNumber: 'BIN006',
    locationName: 'Hospital Main Entrance',
    address: '890 University Ave, Toronto, ON',
    status: 'Available',
    lat: 43.6595,
    lng: -79.3889
  },
  {
    id: '7',
    binNumber: 'BIN007',
    locationName: 'Transit Station',
    address: '250 Bloor St W, Toronto, ON',
    status: 'Available',
    lat: 43.6673,
    lng: -79.3956
  },
  {
    id: '8',
    binNumber: 'BIN008',
    locationName: 'City Hall',
    address: '100 Queen St W, Toronto, ON',
    status: 'Unavailable',
    lat: 43.6534,
    lng: -79.3841
  },
  {
    id: '9',
    binNumber: 'BIN009',
    locationName: 'Sports Complex',
    address: '875 Morningside Ave, Toronto, ON',
    status: 'Available',
    lat: 43.7853,
    lng: -79.1939
  },
  {
    id: '10',
    binNumber: 'BIN010',
    locationName: 'Grocery Store Plaza',
    address: '1500 Royal York Rd, Toronto, ON',
    status: 'Full',
    lat: 43.6471,
    lng: -79.5157,
    fullSince: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: '11',
    binNumber: 'BIN011',
    locationName: 'Park Entrance',
    address: '1873 Bloor St W, Toronto, ON',
    status: 'Available',
    lat: 43.6515,
    lng: -79.4644
  },
  {
    id: '12',
    binNumber: 'BIN012',
    locationName: 'Church Parking Lot',
    address: '620 Spadina Ave, Toronto, ON',
    status: 'Available',
    lat: 43.6627,
    lng: -79.4036
  },
  {
    id: '13',
    binNumber: 'BIN013',
    locationName: 'Fire Station 24',
    address: '745 Broadview Ave, Toronto, ON',
    status: 'Unavailable',
    lat: 43.6778,
    lng: -79.3584
  },
  {
    id: '14',
    binNumber: 'BIN014',
    locationName: 'Community Garden',
    address: '200 Winchester St, Toronto, ON',
    status: 'Available',
    lat: 43.6674,
    lng: -79.3708
  },
  {
    id: '15',
    binNumber: 'BIN015',
    locationName: 'Seniors Center',
    address: '1700 Keele St, Toronto, ON',
    status: 'Full',
    lat: 43.6889,
    lng: -79.4747,
    fullSince: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
  },
  {
    id: '16',
    binNumber: 'BIN019',
    locationName: 'Bogza Plaza',
    address: '2500 Bogza Avenue, Toronto, ON',
    status: 'Available',
    lat: 43.6532,
    lng: -79.3832
  }
];

const STORAGE_KEY = 'binsData';

export const BinsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bins, setBins] = useState<BinLocation[]>([]);
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
            console.log('[BinsProvider] No bins in Supabase, initializing with default data');
            setBins(initialBins);
          }
        } else {
          console.log('[BinsProvider] Using localStorage for data persistence');
          // Fallback to localStorage
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            
            if (stored && stored !== 'undefined' && stored !== 'null') {
              const parsedBins = JSON.parse(stored);
              if (Array.isArray(parsedBins)) {
                setBins(parsedBins.length > 0 ? parsedBins : initialBins);
              } else {
                setBins(initialBins);
              }
            } else {
              // Initialize with default bins
              localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBins));
              setBins(initialBins);
            }
          } catch (error) {
            console.error('[BinsProvider] Error loading bins from localStorage:', error);
            setBins(initialBins);
          }
        }
      } catch (error) {
        console.error('[BinsProvider] Error initializing bins:', error);
        setError('Failed to load bins data');
        // Fallback to localStorage or initial data
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsedBins = JSON.parse(stored);
            setBins(Array.isArray(parsedBins) ? parsedBins : initialBins);
          } else {
            setBins(initialBins);
          }
        } catch {
          setBins(initialBins);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeBins();
  }, []);

  // Save to localStorage when not using Supabase (as backup)
  useEffect(() => {
    if (!USE_SUPABASE && bins.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bins));
      } catch (error) {
        console.error('[BinsProvider] Error saving bins to localStorage:', error);
      }
    }
  }, [bins]);

  const refreshBins = async () => {
    if (!USE_SUPABASE) return;

    setIsLoading(true);
    setError(null);

    try {
      const refreshedBins = await SupabaseService.bins.getAllBins();
      setBins(refreshedBins);
      console.log(`[BinsProvider] Refreshed ${refreshedBins.length} bins from Supabase`);
    } catch (error) {
      console.error('[BinsProvider] Error refreshing bins:', error);
      setError('Failed to refresh bins data');
    } finally {
      setIsLoading(false);
    }
  };

  const addBin = async (newBin: BinLocation) => {
    if (USE_SUPABASE) {
      try {
        console.log('[BinsProvider] Creating bin in Supabase:', newBin);
        const createdBin = await SupabaseService.bins.createBin(newBin);
        setBins(prevBins => [...prevBins, createdBin]);
        console.log(`[BinsProvider] Created bin ${createdBin.binNumber} in Supabase`);
      } catch (error) {
        console.error('[BinsProvider] Error creating bin:', error);
        console.error('[BinsProvider] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace',
          fullError: error
        });
        setError(`Failed to create bin: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    } else {
      setBins(prevBins => [...prevBins, newBin]);
    }
  };

  const updateBin = async (id: string, updates: Partial<BinLocation>) => {
    if (USE_SUPABASE) {
      try {
        const updatedBin = await SupabaseService.bins.updateBin(id, updates);
        setBins(prevBins => 
          prevBins.map(bin => {
            if (bin.id === id) {
              return updatedBin;
            }
            return bin;
          })
        );
        console.log(`[BinsProvider] Updated bin ${id} in Supabase`);
      } catch (error) {
        console.error('[BinsProvider] Error updating bin:', error);
        setError('Failed to update bin');
        throw error;
      }
    } else {
      setBins(prevBins => 
        prevBins.map(bin => {
          if (bin.id === id) {
            const updatedBin = { ...bin, ...updates };
            
            // Track when bin is marked as Full
            if (updates.status === 'Full' && bin.status !== 'Full') {
              updatedBin.fullSince = new Date().toISOString();
            }
            // Clear fullSince when status changes from Full to something else
            else if (updates.status && updates.status !== 'Full' && bin.status === 'Full') {
              updatedBin.fullSince = undefined;
            }
            
            return updatedBin;
          }
          return bin;
        })
      );
    }
  };

  const deleteBin = async (id: string) => {
    if (USE_SUPABASE) {
      try {
        await SupabaseService.bins.deleteBin(id);
        setBins(prevBins => prevBins.filter(bin => bin.id !== id));
        console.log(`[BinsProvider] Deleted bin ${id} from Supabase`);
      } catch (error) {
        console.error('[BinsProvider] Error deleting bin:', error);
        setError('Failed to delete bin');
        throw error;
      }
    } else {
      setBins(prevBins => prevBins.filter(bin => bin.id !== id));
    }
  };

  return (
    <BinsContext.Provider value={{ 
      bins, 
      setBins, 
      addBin, 
      updateBin, 
      deleteBin, 
      refreshBins,
      isLoading,
      error
    }}>
      {children}
    </BinsContext.Provider>
  );
};

export const useBins = () => {
  const context = useContext(BinsContext);
  if (context === undefined) {
    throw new Error('useBins must be used within a BinsProvider');
  }
  return context;
};