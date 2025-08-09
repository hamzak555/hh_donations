import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BinLocation {
  id: string;
  binNumber: string;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  status: 'Available' | 'Unavailable' | 'Full';
  pickupStatus: 'Scheduled' | 'Not Scheduled' | 'Completed';
  lastPickup?: string;
  contractFile?: string;
  contractFileName?: string;
  contractUploadDate?: string;
  distance?: number;
}

interface BinsContextType {
  bins: BinLocation[];
  setBins: React.Dispatch<React.SetStateAction<BinLocation[]>>;
  addBin: (bin: BinLocation) => void;
  updateBin: (id: string, updates: Partial<BinLocation>) => void;
  deleteBin: (id: string) => void;
}

const BinsContext = createContext<BinsContextType | undefined>(undefined);

const initialBins: BinLocation[] = [
  {
    id: '1',
    binNumber: 'BIN001',
    locationName: 'Community Center',
    address: '123 Main St, Toronto, ON',
    status: 'Available',
    pickupStatus: 'Not Scheduled',
    lastPickup: '2024-01-10',
    lat: 43.6532,
    lng: -79.3832
  },
  {
    id: '2',
    binNumber: 'BIN002',
    locationName: 'Shopping Mall',
    address: '456 Queen St W, Toronto, ON',
    status: 'Available',
    pickupStatus: 'Scheduled',
    lastPickup: '2024-01-12',
    lat: 43.6489,
    lng: -79.3963
  },
  {
    id: '3',
    binNumber: 'BIN003',
    locationName: 'Public Library',
    address: '789 King St E, Toronto, ON',
    status: 'Unavailable',
    pickupStatus: 'Scheduled',
    lastPickup: '2024-01-05',
    lat: 43.6544,
    lng: -79.3607
  },
  {
    id: '4',
    binNumber: 'BIN004',
    locationName: 'Recreation Center',
    address: '321 Dundas St W, Toronto, ON',
    status: 'Available',
    pickupStatus: 'Completed',
    lastPickup: '2024-01-15',
    lat: 43.6551,
    lng: -79.3865
  },
  {
    id: '5',
    binNumber: 'BIN005',
    locationName: 'School Campus',
    address: '654 College St, Toronto, ON',
    status: 'Full',
    pickupStatus: 'Not Scheduled',
    lastPickup: '2024-01-08',
    lat: 43.6589,
    lng: -79.4057
  },
  {
    id: '6',
    binNumber: 'BIN006',
    locationName: 'Hospital Main Entrance',
    address: '890 University Ave, Toronto, ON',
    status: 'Available',
    pickupStatus: 'Not Scheduled',
    lastPickup: '2024-01-14',
    lat: 43.6595,
    lng: -79.3889
  },
  {
    id: '7',
    binNumber: 'BIN007',
    locationName: 'Transit Station',
    address: '250 Bloor St W, Toronto, ON',
    status: 'Available',
    pickupStatus: 'Scheduled',
    lastPickup: '2024-01-11',
    lat: 43.6673,
    lng: -79.3956
  },
  {
    id: '8',
    binNumber: 'BIN008',
    locationName: 'City Hall',
    address: '100 Queen St W, Toronto, ON',
    status: 'Unavailable',
    pickupStatus: 'Scheduled',
    lastPickup: '2024-01-09',
    lat: 43.6534,
    lng: -79.3841
  },
  {
    id: '9',
    binNumber: 'BIN009',
    locationName: 'Sports Complex',
    address: '875 Morningside Ave, Toronto, ON',
    status: 'Available',
    pickupStatus: 'Not Scheduled',
    lastPickup: '2024-01-13',
    lat: 43.7853,
    lng: -79.1939
  },
  {
    id: '10',
    binNumber: 'BIN010',
    locationName: 'Grocery Store Plaza',
    address: '1500 Royal York Rd, Toronto, ON',
    status: 'Full',
    pickupStatus: 'Not Scheduled',
    lastPickup: '2024-01-07',
    lat: 43.6471,
    lng: -79.5157
  },
  {
    id: '11',
    binNumber: 'BIN011',
    locationName: 'Park Entrance',
    address: '1873 Bloor St W, Toronto, ON',
    status: 'Available',
    pickupStatus: 'Completed',
    lastPickup: '2024-01-16',
    lat: 43.6515,
    lng: -79.4644
  },
  {
    id: '12',
    binNumber: 'BIN012',
    locationName: 'Church Parking Lot',
    address: '620 Spadina Ave, Toronto, ON',
    status: 'Available',
    pickupStatus: 'Not Scheduled',
    lastPickup: '2024-01-12',
    lat: 43.6627,
    lng: -79.4036
  },
  {
    id: '13',
    binNumber: 'BIN013',
    locationName: 'Fire Station 24',
    address: '745 Broadview Ave, Toronto, ON',
    status: 'Unavailable',
    pickupStatus: 'Scheduled',
    lastPickup: '2024-01-06',
    lat: 43.6778,
    lng: -79.3584
  },
  {
    id: '14',
    binNumber: 'BIN014',
    locationName: 'Community Garden',
    address: '200 Winchester St, Toronto, ON',
    status: 'Available',
    pickupStatus: 'Not Scheduled',
    lastPickup: '2024-01-17',
    lat: 43.6674,
    lng: -79.3708
  },
  {
    id: '15',
    binNumber: 'BIN015',
    locationName: 'Seniors Center',
    address: '1700 Keele St, Toronto, ON',
    status: 'Full',
    pickupStatus: 'Not Scheduled',
    lastPickup: '2024-01-04',
    lat: 43.6889,
    lng: -79.4747
  },
  {
    id: '16',
    binNumber: 'BIN019',
    locationName: 'Bogza Plaza',
    address: '2500 Bogza Avenue, Toronto, ON',
    status: 'Available',
    pickupStatus: 'Not Scheduled',
    lastPickup: '2024-01-03',
    lat: 43.6532,
    lng: -79.3832
  }
];

const STORAGE_KEY = 'binsData';

export const BinsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bins, setBins] = useState<BinLocation[]>([]);

  // Load bins from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedBins = JSON.parse(stored);
        setBins(Array.isArray(parsedBins) ? parsedBins : initialBins);
      } else {
        // Initialize with default bins if nothing in localStorage
        setBins(initialBins);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBins));
      }
    } catch (error) {
      console.error('Error loading bins:', error);
      setBins(initialBins);
    }
  }, []);

  // Save to localStorage whenever bins change
  useEffect(() => {
    if (bins.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bins));
      } catch (error) {
        console.error('Error saving bins:', error);
      }
    }
  }, [bins]);

  const addBin = (newBin: BinLocation) => {
    setBins(prevBins => [...prevBins, newBin]);
  };

  const updateBin = (id: string, updates: Partial<BinLocation>) => {
    setBins(prevBins => 
      prevBins.map(bin => 
        bin.id === id ? { ...bin, ...updates } : bin
      )
    );
  };

  const deleteBin = (id: string) => {
    setBins(prevBins => prevBins.filter(bin => bin.id !== id));
  };

  return (
    <BinsContext.Provider value={{ bins, setBins, addBin, updateBin, deleteBin }}>
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

export type { BinLocation };