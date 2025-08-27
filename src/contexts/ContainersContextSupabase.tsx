import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SupabaseService } from '@/services/supabaseService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { SafeStorage } from '@/utils/safeStorage';

export interface NoteEntry {
  id: string;
  text: string;
  timestamp: string;
  author?: string; // User who created the note
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
  status: 'Warehouse' | 'Shipped';
  createdDate: string;
  shipmentDate?: string;
  estimatedArrivalDate?: string;
  actualArrivalDate?: string;
  sealNumber?: string;
  shippingLine?: string;
  vesselName?: string;
  bookingNumber?: string;
  notes?: string;
  notesTimeline?: NoteEntry[]; // Add timeline notes field
  documents?: string[] | DocumentEntry[];
}

interface ContainersContextType {
  containers: Container[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  addContainer: (container: Omit<Container, 'id' | 'containerNumber' | 'createdDate' | 'totalWeight'>) => Promise<void>;
  updateContainer: (id: string, updates: Partial<Container>) => void;
  deleteContainer: (id: string) => void;
  generateContainerNumber: () => string;
  assignBaleToContainer: (containerId: string, baleId: string) => void;
  removeBaleFromContainer: (containerId: string, baleId: string) => void;
  addNoteToTimeline: (containerId: string, noteText: string) => void;
  addDocuments: (containerId: string, documents: DocumentEntry[]) => void;
  deleteDocument: (containerId: string, documentId: string) => void;
  markAsShipped: (id: string) => void;
  unmarkAsShipped: (id: string) => void;
  getContainerByBaleId: (baleId: string) => Container | undefined;
}

const ContainersContext = createContext<ContainersContextType | undefined>(undefined);

const STORAGE_KEY = 'containers';

// Check if Supabase is configured
const USE_SUPABASE = isSupabaseConfigured;

export const ContainersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Don't initialize with stale localStorage data - start fresh
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load containers from Supabase or localStorage
  const loadContainers = useCallback(async () => {
    // Only set loading to true if we're not already loading
    // This prevents flickering
    setIsLoading(true);
    setError(null);
    
    // Track when we started loading
    const startTime = Date.now();
    
    try {
      if (USE_SUPABASE) {
        console.log('[ContainersProvider] Using Supabase for data persistence');
        const supabaseContainers = await SupabaseService.containers.getAllContainers();
        
        console.log('[ContainersProvider] Received containers from service:', supabaseContainers?.length);
        
        // If we get an empty array, that's valid - just set it
        if (!supabaseContainers || supabaseContainers.length === 0) {
          setContainers([]);
          console.log('[ContainersProvider] No containers in database');
          SafeStorage.setItem(STORAGE_KEY, JSON.stringify([]));
          return; // Exit early, no need to process
        }
        
        // Generate container numbers for any containers missing them
        let containerCounter = 1;
        const existingNumbers = supabaseContainers
          .filter(c => c.containerNumber && c.containerNumber.startsWith('CNT'))
          .map(c => {
            const match = c.containerNumber.match(/CNT(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(num => !isNaN(num));
        
        if (existingNumbers.length > 0) {
          containerCounter = Math.max(...existingNumbers) + 1;
        }
        
        // Service now handles field mapping, just need to process notes timeline
        const formattedContainers: Container[] = supabaseContainers.map(c => {
          // Parse notes to extract timeline
          let notesTimeline: NoteEntry[] = [];
          if (c.notes) {
            try {
              const parsed = JSON.parse(c.notes);
              if (Array.isArray(parsed)) {
                notesTimeline = parsed;
              }
            } catch {
              // If notes is a plain string, convert it to timeline format
              notesTimeline = [{
                id: generateUUID(),
                text: c.notes,
                timestamp: c.createdDate || c.created_at || new Date().toISOString()
              }];
            }
          }
          
          // Ensure container has a number
          let containerNumber = c.containerNumber;
          if (!containerNumber || containerNumber === '') {
            containerNumber = `CNT${String(containerCounter++).padStart(4, '0')}`;
            console.log(`[ContainersProvider] Assigned number ${containerNumber} to container ${c.id}`);
            
            // Update the container in the database with the new number
            if (USE_SUPABASE) {
              SupabaseService.containers.updateContainer(c.id, { containerNumber } as any).catch(err => {
                console.error('[ContainersProvider] Failed to update container number in database:', err);
              });
            }
          }
          
          const formattedContainer: Container = {
            id: c.id,
            containerNumber: containerNumber,
            assignedBales: c.assignedBales || [],
            totalWeight: c.currentWeight || 0,
            destination: c.destination,
            status: c.status === 'In Transit' || c.status === 'Delivered' ? 'Shipped' : c.status as Container['status'],
            createdDate: c.createdDate || c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            shipmentDate: c.shipmentDate,
            estimatedArrivalDate: c.estimatedArrivalDate,
            actualArrivalDate: c.actualArrivalDate,
            sealNumber: c.sealNumber,
            shippingLine: c.shippingLine,
            vesselName: c.vesselName,
            bookingNumber: c.bookingNumber,
            notes: c.notes,
            notesTimeline: notesTimeline,
            documents: c.documents || []
          };
          
          return formattedContainer;
        });
        
        setContainers(formattedContainers);
        console.log(`[ContainersProvider] Loaded ${formattedContainers.length} containers from Supabase`);
        
        // Sync to localStorage for offline access
        SafeStorage.setItem(STORAGE_KEY, JSON.stringify(formattedContainers));
      } else {
        console.log('[ContainersProvider] Using localStorage (Supabase not configured)');
        // Only use localStorage if Supabase is not configured
        // This prevents showing stale data while Supabase loads
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
      
      // Only fallback to localStorage if it's a network error, not during initial load
      // This prevents showing stale data
      if (USE_SUPABASE && err instanceof Error && err.message.includes('network')) {
        try {
          const stored = SafeStorage.getLatestValue(STORAGE_KEY);
          if (stored) {
            const parsedContainers = JSON.parse(stored);
            setContainers(parsedContainers);
            console.log('[ContainersProvider] Using localStorage fallback due to network error');
          }
        } catch (fallbackErr) {
          console.error('[ContainersProvider] Fallback also failed:', fallbackErr);
        }
      }
    } finally {
      // Ensure minimum loading time to prevent flash of "no containers"
      const loadTime = Date.now() - startTime;
      const minLoadTime = 300; // 300ms minimum
      
      if (loadTime < minLoadTime) {
        setTimeout(() => setIsLoading(false), minLoadTime - loadTime);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  // Note: Status mapping functions removed - direct mapping after column rename and status update

  // Initial load
  useEffect(() => {
    loadContainers();
  }, [loadContainers]);

    // Generate a proper UUID for Supabase
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

const addContainer = async (containerData: Omit<Container, 'id' | 'containerNumber' | 'createdDate' | 'totalWeight'>) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const createdDate = new Date().toISOString().split('T')[0];
      const newContainer: Container = {
        ...containerData,
        id: generateUUID(), // Generate proper UUID for Supabase
        containerNumber: generateContainerNumber(),
        createdDate,
        totalWeight: 0, // Will be calculated from bales
        assignedBales: containerData.assignedBales || []
      };
    
      // If there are notes, format them for the timeline
      if (newContainer.notes && newContainer.notes.trim()) {
        const noteEntry = {
          id: generateUUID(),
          text: newContainer.notes,
          timestamp: new Date().toISOString()
        };
        newContainer.notesTimeline = [noteEntry];
      }

      // Sync to Supabase first if available
      if (USE_SUPABASE) {
        try {
          // Prepare container for database - service will handle field mapping
          const dbContainer: Omit<any, 'id' | 'created_at' | 'updated_at'> = {
            containerNumber: newContainer.containerNumber,
            type: 'Steel' as const,
            capacity: 1000,
            currentWeight: 0,
            destination: newContainer.destination || 'Not specified',
            status: 'Warehouse' as const,
            assignedBales: newContainer.assignedBales || [],
            createdDate: newContainer.createdDate,
            shipmentDate: newContainer.shipmentDate,
            estimatedArrivalDate: newContainer.estimatedArrivalDate,
            actualArrivalDate: newContainer.actualArrivalDate,
            sealNumber: newContainer.sealNumber,
            shippingLine: newContainer.shippingLine,
            vesselName: newContainer.vesselName,
            bookingNumber: newContainer.bookingNumber,
            documents: newContainer.documents || []
          };
          
          // If there are notes, convert them to timeline format
          if (newContainer.notes && newContainer.notes.trim()) {
            const noteEntry = {
              id: generateUUID(),
              text: newContainer.notes,
              timestamp: new Date().toISOString()
            };
            dbContainer.notes = JSON.stringify([noteEntry]);
          }
          
          console.log('[ContainersProvider] Creating container in Supabase...');
          const result = await SupabaseService.containers.createContainer(dbContainer);
          console.log('[ContainersProvider] Container created successfully');
          
          if (result?.id) {
            newContainer.id = result.id; // Use database-generated ID
          }
        } catch (error) {
          console.error('[ContainersProvider] Failed to sync container to Supabase:', error);
          console.error('[ContainersProvider] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            fullError: error
          });
          
          // If this is a network/API error, let's try to get more details
          if (error && typeof error === 'object' && 'code' in error) {
            console.error('[ContainersProvider] Supabase error code:', (error as any).code);
            console.error('[ContainersProvider] Supabase error details:', (error as any).details);
            console.error('[ContainersProvider] Supabase error hint:', (error as any).hint);
          }
          
          // Don't throw the error - allow local storage to work as fallback
          console.log('[ContainersProvider] Continuing with local storage as fallback...');
        }
      }

      // Update local state after successful sync or as fallback
      const newContainers = [...containers, newContainer];
      setContainers(newContainers);
      SafeStorage.setItem(STORAGE_KEY, JSON.stringify(newContainers));
    } catch (error) {
      console.error('[ContainersProvider] Error in addContainer:', error);
      setError(error instanceof Error ? error.message : 'Failed to create container');
      throw error; // Re-throw so UI can handle it
    } finally {
      setIsCreating(false);
    }
  };

  const updateContainer = (id: string, updates: Partial<Container>) => {
    // Update local state immediately
    const newContainers = containers.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    setContainers(newContainers);
    SafeStorage.setItem(STORAGE_KEY, JSON.stringify(newContainers));

    // Sync to Supabase in background if available
    if (USE_SUPABASE) {
      // Prepare updates with totalWeight mapped to currentWeight
      const dbUpdates: Partial<any> = { ...updates };
      if (updates.totalWeight !== undefined) {
        dbUpdates.currentWeight = updates.totalWeight;
        delete dbUpdates.totalWeight;
      }
      
      // Service will handle the rest of the field mapping
      SupabaseService.containers.updateContainer(id, dbUpdates).catch(err => {
        console.error('[ContainersProvider] Error syncing container update to Supabase:', err);
      });
    }
  };

  const deleteContainer = (id: string) => {
    // Update local state immediately
    const newContainers = containers.filter(c => c.id !== id);
    setContainers(newContainers);
    SafeStorage.setItem(STORAGE_KEY, JSON.stringify(newContainers));

    // Sync to Supabase in background if available
    if (USE_SUPABASE) {
      SupabaseService.containers.deleteContainer(id).catch(err => {
        console.error('[ContainersProvider] Error syncing container deletion to Supabase:', err);
      });
    }
  };


  const assignBaleToContainer = (containerId: string, baleId: string) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;

    if (!container.assignedBales.includes(baleId)) {
      updateContainer(containerId, {
        assignedBales: [...container.assignedBales, baleId]
      });
    }
  };

  const removeBaleFromContainer = (containerId: string, baleId: string) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;

    updateContainer(containerId, {
      assignedBales: container.assignedBales.filter(id => id !== baleId)
    });
  };

  const generateContainerNumber = () => {
    const existingNumbers = containers
      .map(container => {
        // Safely check if containerNumber exists and is a string
        if (!container.containerNumber || typeof container.containerNumber !== 'string') {
          return 0;
        }
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
    
    // Get current user info
    const userEmail = localStorage.getItem('userEmail');
    const userFullName = localStorage.getItem('userFullName');
    const author = userFullName || userEmail || 'Unknown User';
    
    // Create new note entry
    const newNote: NoteEntry = {
      id: generateUUID(),
      text: noteText,
      timestamp: new Date().toISOString(),
      author
    };
    
    // Get current notes timeline (parse from notes field or use existing notesTimeline)
    let currentNotesTimeline: NoteEntry[] = [];
    
    if (container.notesTimeline) {
      // Use existing timeline
      currentNotesTimeline = container.notesTimeline;
    } else if (container.notes) {
      // Try to parse notes as timeline JSON, fallback to legacy format
      try {
        const parsed = JSON.parse(container.notes);
        if (Array.isArray(parsed)) {
          currentNotesTimeline = parsed;
        }
      } catch {
        // If notes is a plain string, convert it to timeline format
        currentNotesTimeline = [{
          id: generateUUID(),
          text: container.notes,
          timestamp: container.createdDate || new Date().toISOString()
        }];
      }
    }
    
    const updatedNotesTimeline = [...currentNotesTimeline, newNote];
    
    // Store timeline as JSON in notes field for database compatibility
    // and also keep notesTimeline for UI compatibility
    updateContainer(containerId, {
      notes: JSON.stringify(updatedNotesTimeline),
      notesTimeline: updatedNotesTimeline
    });
  };

  const addDocuments = (containerId: string, documents: DocumentEntry[]) => {
    if (!documents || documents.length === 0) return;
    
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // Get current documents
    let currentDocuments: DocumentEntry[] = [];
    if (container.documents && Array.isArray(container.documents)) {
      // If documents is already an array of DocumentEntry objects
      currentDocuments = container.documents as DocumentEntry[];
    } else if (container.documents && Array.isArray(container.documents)) {
      // If documents is an array of strings (old format), convert to DocumentEntry
      currentDocuments = (container.documents as string[]).map((docId, index) => ({
        id: docId,
        name: `Document ${index + 1}`,
        data: '', // Would need to be populated from storage
        uploadedAt: container.createdDate || new Date().toISOString()
      }));
    }
    
    // Add new documents
    const updatedDocuments = [...currentDocuments, ...documents];
    
    // Update container with new documents
    updateContainer(containerId, {
      documents: updatedDocuments
    });
  };

  const deleteDocument = (containerId: string, documentId: string) => {
    const container = containers.find(c => c.id === containerId);
    if (!container || !container.documents) return;
    
    // Get current documents
    let currentDocuments: DocumentEntry[] = [];
    if (Array.isArray(container.documents)) {
      currentDocuments = container.documents as DocumentEntry[];
    }
    
    // Remove the document with the specified ID
    const updatedDocuments = currentDocuments.filter(doc => doc.id !== documentId);
    
    // Update container with filtered documents
    updateContainer(containerId, {
      documents: updatedDocuments
    });
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


  const value = {
    containers,
    isLoading,
    isCreating,
    error,
    addContainer,
    updateContainer,
    deleteContainer,
    generateContainerNumber,
    assignBaleToContainer,
    removeBaleFromContainer,
    addNoteToTimeline,
    addDocuments,
    deleteDocument,
    markAsShipped,
    unmarkAsShipped,
    getContainerByBaleId
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