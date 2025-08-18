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
  addContainer: (container: Omit<Container, 'id' | 'containerNumber' | 'createdDate' | 'totalWeight'>) => Promise<void>;
  updateContainer: (id: string, updates: Partial<Container>) => Promise<void>;
  deleteContainer: (id: string) => Promise<void>;
  generateContainerNumber: () => string;
  getWarehouseContainers: () => Container[];
  getShippedContainers: () => Container[];
  assignBaleToContainer: (containerId: string, baleId: string, baleWeight: number) => Promise<void>;
  removeBaleFromContainer: (containerId: string, baleId: string, baleWeight: number) => Promise<void>;
  addNoteToTimeline: (containerId: string, noteText: string) => void;
  addDocuments: (containerId: string, documents: DocumentEntry[]) => void;
  deleteDocument: (containerId: string, documentId: string) => void;
  markAsShipped: (id: string) => void;
  unmarkAsShipped: (id: string) => void;
  getContainerByBaleId: (baleId: string) => Container | undefined;
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

  const addContainer = async (containerData: Omit<Container, 'id' | 'containerNumber' | 'createdDate' | 'totalWeight'>) => {
    try {
      const createdDate = new Date().toISOString().split('T')[0];
      const newContainer: Container = {
        ...containerData,
        id: String(Date.now()),
        containerNumber: generateContainerNumber(),
        createdDate,
        totalWeight: 0, // Will be calculated from bales
        assignedBales: containerData.assignedBales || []
      };

      if (USE_SUPABASE) {
        // Convert to database format
        const dbContainer = {
          id: newContainer.id,
          container_number: newContainer.containerNumber,
          type: 'Steel' as const, // Default type
          capacity: 1000, // Default capacity
          current_weight: newContainer.totalWeight,
          location: newContainer.destination,
          status: mapAppStatusToDbStatus(newContainer.status),
          last_pickup: newContainer.shipmentDate
        };
        
        await SupabaseService.containers.createContainer(dbContainer);
        await loadContainers(); // Reload to get the latest data
      } else {
        const newContainers = [...containers, newContainer];
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

  const generateContainerNumber = () => {
    const existingNumbers = containers
      .map(container => {
        const match = container.containerNumber.match(/CNT(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num));
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `CNT${String(nextNumber).padStart(4, '0')}`;
  };

  const addNoteToTimeline = (containerId: string, noteText: string) => {
    if (!noteText.trim()) return;
    
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // This would typically update the container with a new note
    // For now, we'll implement a basic version
    console.log(`Adding note to container ${containerId}: ${noteText}`);
  };

  const addDocuments = (containerId: string, documents: DocumentEntry[]) => {
    // Implementation for adding documents
    console.log(`Adding ${documents.length} documents to container ${containerId}`);
  };

  const deleteDocument = (containerId: string, documentId: string) => {
    // Implementation for deleting a document
    console.log(`Deleting document ${documentId} from container ${containerId}`);
  };

  const markAsShipped = (id: string) => {
    updateContainer(id, { status: 'Shipped', shipmentDate: new Date().toISOString().split('T')[0] });
  };

  const unmarkAsShipped = (id: string) => {
    updateContainer(id, { status: 'Warehouse', shipmentDate: undefined });
  };

  const getContainerByBaleId = (baleId: string): Container | undefined => {
    return containers.find(container => container.assignedBales.includes(baleId));
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
    generateContainerNumber,
    getWarehouseContainers,
    getShippedContainers,
    assignBaleToContainer,
    removeBaleFromContainer,
    addNoteToTimeline,
    addDocuments,
    deleteDocument,
    markAsShipped,
    unmarkAsShipped,
    getContainerByBaleId,
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