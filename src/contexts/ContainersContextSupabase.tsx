import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SupabaseService } from '@/services/supabaseService';
import { SafeStorage } from '@/utils/safeStorage';

export interface NoteEntry {
  id: string;
  text: string;
  timestamp: string;
}

export interface DocumentEntry {
  id: string;
  name: string;
  data: string; // base64 data
  uploadedAt: string;
}

export interface Container {
  id: string;
  containerNumber: string;
  assignedBales: string[];
  totalWeight: number;
  destination: string;
  status: 'Warehouse' | 'Shipped' | 'In Transit' | 'Delivered';
  createdDate: string;
  shipmentDate?: string;
  estimatedArrivalDate?: string;
  actualArrivalDate?: string;
  sealNumber?: string;
  shippingLine?: string;
  vesselName?: string;
  bookingNumber?: string;
  notes?: string;
}

interface ContainersContextType {
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  addContainer: (container: Container) => Promise<void>;
  updateContainer: (id: string, updates: Partial<Container>) => Promise<void>;
  deleteContainer: (id: string) => Promise<void>;
  getWarehouseContainers: () => Container[];
  getShippedContainers: () => Container[];
  assignBaleToContainer: (containerId: string, baleId: string, baleWeight: number) => Promise<void>;
  removeBaleFromContainer: (containerId: string, baleId: string, baleWeight: number) => Promise<void>;
  refreshContainers: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ContainersContext = createContext<ContainersContextType | undefined>(undefined);

const STORAGE_KEY = 'containers';

// Check if Supabase is configured
const USE_SUPABASE = process.env.REACT_APP_SUPABASE_URL && 
                    process.env.REACT_APP_SUPABASE_URL !== 'your_supabase_project_url';

export const ContainersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load containers from Supabase or localStorage
  const loadContainers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (USE_SUPABASE) {
        console.log('[ContainersProvider] Using Supabase for data persistence');
        const supabaseContainers = await SupabaseService.containers.getAllContainers();
        
        // Convert from database format to app format
        const formattedContainers: Container[] = supabaseContainers.map(c => ({
          id: c.id,
          containerNumber: c.container_number,
          assignedBales: [], // This would need to be loaded from a junction table or stored as JSON
          totalWeight: c.current_weight || 0,
          destination: c.location,
          status: mapDbStatusToAppStatus(c.status),
          createdDate: c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          shipmentDate: c.last_pickup,
          estimatedArrivalDate: undefined,
          actualArrivalDate: undefined,
          sealNumber: undefined,
          shippingLine: undefined,
          vesselName: undefined,
          bookingNumber: undefined,
          notes: undefined
        }));
        
        setContainers(formattedContainers);
        console.log(`[ContainersProvider] Loaded ${formattedContainers.length} containers from Supabase`);
        
        // Sync to localStorage for offline access
        SafeStorage.setItem(STORAGE_KEY, JSON.stringify(formattedContainers));
      } else {
        console.log('[ContainersProvider] Using localStorage (Supabase not configured)');
        const stored = SafeStorage.getLatestValue(STORAGE_KEY);
        
        if (stored && stored !== 'undefined' && stored !== 'null' && stored !== '[]') {
          const parsedContainers = JSON.parse(stored);
          if (Array.isArray(parsedContainers) && parsedContainers.length > 0) {
            setContainers(parsedContainers);
          }
        }
      }
    } catch (err) {
      console.error('[ContainersProvider] Error loading containers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load containers');
      
      // Fallback to localStorage if Supabase fails
      try {
        const stored = SafeStorage.getLatestValue(STORAGE_KEY);
        if (stored) {
          const parsedContainers = JSON.parse(stored);
          setContainers(parsedContainers);
          console.log('[ContainersProvider] Loaded from localStorage fallback');
        }
      } catch (fallbackErr) {
        console.error('[ContainersProvider] Fallback also failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper function to map database status to app status
  const mapDbStatusToAppStatus = (dbStatus: string): Container['status'] => {
    switch (dbStatus) {
      case 'Empty':
      case 'Partial':
        return 'Warehouse';
      case 'Full':
        return 'Warehouse';
      case 'In Transit':
        return 'In Transit';
      default:
        return 'Warehouse';
    }
  };

  // Helper function to map app status to database status
  const mapAppStatusToDbStatus = (appStatus: Container['status']): 'Empty' | 'Partial' | 'Full' | 'In Transit' => {
    switch (appStatus) {
      case 'Warehouse':
        return 'Partial';
      case 'Shipped':
      case 'In Transit':
        return 'In Transit';
      case 'Delivered':
        return 'In Transit'; // No delivered status in DB, use In Transit
      default:
        return 'Empty';
    }
  };

  // Initial load
  useEffect(() => {
    loadContainers();
  }, [loadContainers]);

  const addContainer = async (container: Container) => {
    try {
      if (USE_SUPABASE) {
        // Convert to database format
        const dbContainer = {
          id: container.id,
          container_number: container.containerNumber,
          type: 'Steel' as const, // Default type
          capacity: 1000, // Default capacity
          current_weight: container.totalWeight,
          location: container.destination,
          status: mapAppStatusToDbStatus(container.status),
          last_pickup: container.shipmentDate
        };
        
        await SupabaseService.containers.createContainer(dbContainer);
        await loadContainers(); // Reload to get the latest data
      } else {
        const newContainers = [...containers, container];
        setContainers(newContainers);
        SafeStorage.setItem(STORAGE_KEY, JSON.stringify(newContainers));
      }
    } catch (err) {
      console.error('[ContainersProvider] Error adding container:', err);
      throw err;
    }
  };

  const updateContainer = async (id: string, updates: Partial<Container>) => {
    try {
      if (USE_SUPABASE) {
        // Convert updates to database format
        const dbUpdates: any = {};
        if (updates.containerNumber !== undefined) dbUpdates.container_number = updates.containerNumber;
        if (updates.totalWeight !== undefined) dbUpdates.current_weight = updates.totalWeight;
        if (updates.destination !== undefined) dbUpdates.location = updates.destination;
        if (updates.status !== undefined) dbUpdates.status = mapAppStatusToDbStatus(updates.status);
        if (updates.shipmentDate !== undefined) dbUpdates.last_pickup = updates.shipmentDate;
        
        await SupabaseService.containers.updateContainer(id, dbUpdates);
        await loadContainers(); // Reload to get the latest data
      } else {
        const newContainers = containers.map(c => 
          c.id === id ? { ...c, ...updates } : c
        );
        setContainers(newContainers);
        SafeStorage.setItem(STORAGE_KEY, JSON.stringify(newContainers));
      }
    } catch (err) {
      console.error('[ContainersProvider] Error updating container:', err);
      throw err;
    }
  };

  const deleteContainer = async (id: string) => {
    try {
      if (USE_SUPABASE) {
        await SupabaseService.containers.deleteContainer(id);
        await loadContainers(); // Reload to get the latest data
      } else {
        const newContainers = containers.filter(c => c.id !== id);
        setContainers(newContainers);
        SafeStorage.setItem(STORAGE_KEY, JSON.stringify(newContainers));
      }
    } catch (err) {
      console.error('[ContainersProvider] Error deleting container:', err);
      throw err;
    }
  };

  const getWarehouseContainers = () => {
    return containers.filter(c => c.status === 'Warehouse');
  };

  const getShippedContainers = () => {
    return containers.filter(c => c.status === 'Shipped' || c.status === 'In Transit' || c.status === 'Delivered');
  };

  const assignBaleToContainer = async (containerId: string, baleId: string, baleWeight: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) throw new Error('Container not found');

    await updateContainer(containerId, {
      assignedBales: [...container.assignedBales, baleId],
      totalWeight: container.totalWeight + baleWeight
    });
  };

  const removeBaleFromContainer = async (containerId: string, baleId: string, baleWeight: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) throw new Error('Container not found');

    await updateContainer(containerId, {
      assignedBales: container.assignedBales.filter(id => id !== baleId),
      totalWeight: Math.max(0, container.totalWeight - baleWeight)
    });
  };

  const refreshContainers = async () => {
    await loadContainers();
  };

  const value = {
    containers,
    setContainers,
    addContainer,
    updateContainer,
    deleteContainer,
    getWarehouseContainers,
    getShippedContainers,
    assignBaleToContainer,
    removeBaleFromContainer,
    refreshContainers,
    isLoading,
    error
  };

  return (
    <ContainersContext.Provider value={value}>
      {children}
    </ContainersContext.Provider>
  );
};

export const useContainers = () => {
  const context = useContext(ContainersContext);
  if (context === undefined) {
    throw new Error('useContainers must be used within a ContainersProvider');
  }
  return context;
};