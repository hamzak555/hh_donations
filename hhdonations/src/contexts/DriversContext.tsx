import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { hybridDataService } from '../services/dataSync';

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

const initialDrivers: Driver[] = [];

const STORAGE_KEY = 'driversData';

export const DriversProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    // Initialize state directly from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsedDrivers = JSON.parse(stored);
        if (Array.isArray(parsedDrivers)) {
          return parsedDrivers;
        }
      }
      
      // Only use initial drivers if localStorage is truly empty (not set)
      if (!stored && initialDrivers.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDrivers));
      }
      return initialDrivers;
    } catch (error) {
      console.error('[DriversContext] Error loading drivers:', error);
      return initialDrivers;
    }
  });

  // Save to hybrid storage whenever drivers change
  useEffect(() => {
    try {
      // Save to localStorage for immediate access
      const dataToSave = JSON.stringify(drivers);
      localStorage.setItem(STORAGE_KEY, dataToSave);
      
      // Also sync with server if available
      hybridDataService.saveDrivers(drivers);
      
      // Verify save was successful
      const verified = localStorage.getItem(STORAGE_KEY);
      if (verified !== dataToSave) {
        console.error('[DriversContext] Data verification failed after save');
      }
    } catch (error) {
      console.error('[DriversContext] Error saving drivers:', error);
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