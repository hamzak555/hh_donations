import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedBins: string[];
  status: 'Active' | 'Inactive';
  totalPickups: number;
}

interface DriversContextType {
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  addDriver: (driver: Driver) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  getActiveDrivers: () => Driver[];
}

const DriversContext = createContext<DriversContextType | undefined>(undefined);

const initialDrivers: Driver[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(416) 555-0123',
    assignedBins: ['BIN001', 'BIN002'],
    status: 'Active',
    totalPickups: 45
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(416) 555-0124',
    assignedBins: ['BIN003'],
    status: 'Active',
    totalPickups: 38
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'mbrown@example.com',
    phone: '(416) 555-0125',
    assignedBins: ['BIN004', 'BIN005'],
    status: 'Active',
    totalPickups: 52
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    phone: '(416) 555-0126',
    assignedBins: [],
    status: 'Inactive',
    totalPickups: 15
  }
];

const STORAGE_KEY = 'driversData';

export const DriversProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Load drivers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedDrivers = JSON.parse(stored);
        setDrivers(Array.isArray(parsedDrivers) ? parsedDrivers : initialDrivers);
      } else {
        // Initialize with default drivers if nothing in localStorage
        setDrivers(initialDrivers);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDrivers));
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
      setDrivers(initialDrivers);
    }
  }, []);

  // Save to localStorage whenever drivers change
  useEffect(() => {
    if (drivers.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drivers));
      } catch (error) {
        console.error('Error saving drivers:', error);
      }
    }
  }, [drivers]);

  const addDriver = (newDriver: Driver) => {
    setDrivers(prevDrivers => [...prevDrivers, newDriver]);
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers(prevDrivers => 
      prevDrivers.map(driver => 
        driver.id === id ? { ...driver, ...updates } : driver
      )
    );
  };

  const deleteDriver = (id: string) => {
    setDrivers(prevDrivers => prevDrivers.filter(driver => driver.id !== id));
  };

  const getActiveDrivers = () => {
    return drivers.filter(driver => driver.status === 'Active');
  };

  return (
    <DriversContext.Provider value={{ 
      drivers, 
      setDrivers, 
      addDriver, 
      updateDriver, 
      deleteDriver,
      getActiveDrivers 
    }}>
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