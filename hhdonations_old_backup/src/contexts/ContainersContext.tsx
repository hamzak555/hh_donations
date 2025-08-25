import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeSetItem } from '../utils/storageManager';

export type ContainerStatus = 'Warehouse' | 'Shipped';

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
  assignedBales: string[]; // Array of bale IDs
  totalWeight: number; // Calculated from assigned bales
  shipmentDate?: string;
  estimatedArrivalDate?: string;
  destination: string;
  status: ContainerStatus;
  createdDate: string;
  notes?: string; // Keep for backward compatibility
  notesTimeline?: NoteEntry[]; // Timeline notes
  sealNumber?: string; // Container seal number
  shippingLine?: string; // Shipping company
  vesselName?: string; // Ship name
  billOfLading?: string; // B/L number
  documents?: string[] | DocumentEntry[]; // Array of document URLs (base64) or document objects
}

interface ContainersContextType {
  containers: Container[];
  addContainer: (container: Omit<Container, 'id' | 'containerNumber' | 'createdDate' | 'totalWeight'>) => void;
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

export const useContainers = () => {
  const context = useContext(ContainersContext);
  if (!context) {
    throw new Error('useContainers must be used within a ContainersProvider');
  }
  return context;
};

interface ContainersProviderProps {
  children: ReactNode;
}

export const ContainersProvider = ({ children }: ContainersProviderProps) => {
  const [containers, setContainers] = useState<Container[]>(() => {
    const savedContainers = localStorage.getItem('containers');
    if (savedContainers) {
      const parsedContainers = JSON.parse(savedContainers);
      // Migrate old data formats if needed
      const migratedContainers = parsedContainers.map((container: any) => {
        // Migrate old notes to timeline format
        if (container.notes && !container.notesTimeline) {
          container.notesTimeline = [{
            id: String(Date.now()),
            text: container.notes,
            timestamp: container.createdDate || new Date().toISOString()
          }];
        }
        return container;
      });
      return migratedContainers;
    }
    return [];
  });

  // Save to localStorage whenever containers change
  useEffect(() => {
    const success = safeSetItem('containers', JSON.stringify(containers));
    if (!success) {
      console.error('Failed to save containers to localStorage - storage may be full');
    }
  }, [containers]);

  const generateContainerNumber = () => {
    const existingNumbers = containers
      .filter(container => container.containerNumber.startsWith('CONT'))
      .map(container => {
        const numberPart = container.containerNumber.replace('CONT', '');
        return parseInt(numberPart, 10);
      })
      .filter(num => !isNaN(num));
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `CONT${String(nextNumber).padStart(3, '0')}`;
  };

  const addContainer = (containerData: Omit<Container, 'id' | 'containerNumber' | 'createdDate' | 'totalWeight'>) => {
    const createdDate = new Date().toISOString().split('T')[0];
    const newContainer: Container = {
      ...containerData,
      id: String(Date.now()),
      containerNumber: generateContainerNumber(),
      createdDate,
      totalWeight: 0, // Will be calculated from bales
      assignedBales: containerData.assignedBales || [],
      // Convert initial notes to timeline format
      notesTimeline: containerData.notes ? [{
        id: String(Date.now()),
        text: containerData.notes,
        timestamp: new Date().toISOString()
      }] : undefined
    };
    
    setContainers(prev => [...prev, newContainer]);
  };

  const updateContainer = (id: string, updates: Partial<Container>) => {
    setContainers(prev => 
      prev.map(container => 
        container.id === id ? { ...container, ...updates } : container
      )
    );
  };

  const deleteContainer = (id: string) => {
    setContainers(prev => prev.filter(container => container.id !== id));
  };

  const assignBaleToContainer = (containerId: string, baleId: string) => {
    setContainers(prev => 
      prev.map(container => {
        if (container.id === containerId) {
          const currentBales = container.assignedBales || [];
          if (!currentBales.includes(baleId)) {
            return {
              ...container,
              assignedBales: [...currentBales, baleId]
            };
          }
        }
        return container;
      })
    );
  };

  const removeBaleFromContainer = (containerId: string, baleId: string) => {
    setContainers(prev => 
      prev.map(container => {
        if (container.id === containerId) {
          return {
            ...container,
            assignedBales: (container.assignedBales || []).filter(id => id !== baleId)
          };
        }
        return container;
      })
    );
  };

  const addNoteToTimeline = (containerId: string, noteText: string) => {
    if (!noteText.trim()) return;
    
    setContainers(prev => 
      prev.map(container => {
        if (container.id === containerId) {
          const newNote: NoteEntry = {
            id: String(Date.now()),
            text: noteText,
            timestamp: new Date().toISOString()
          };
          
          const currentTimeline = container.notesTimeline || [];
          return {
            ...container,
            notesTimeline: [...currentTimeline, newNote]
          };
        }
        return container;
      })
    );
  };

  const addDocuments = (containerId: string, documents: DocumentEntry[]) => {
    setContainers(prev => 
      prev.map(container => {
        if (container.id === containerId) {
          const currentDocuments = (container.documents || []) as DocumentEntry[];
          return {
            ...container,
            documents: [...currentDocuments, ...documents]
          };
        }
        return container;
      })
    );
  };

  const deleteDocument = (containerId: string, documentId: string) => {
    setContainers(prev => 
      prev.map(container => {
        if (container.id === containerId) {
          const currentDocuments = (container.documents || []) as DocumentEntry[];
          return {
            ...container,
            documents: currentDocuments.filter(doc => 
              typeof doc === 'string' ? false : doc.id !== documentId
            )
          };
        }
        return container;
      })
    );
  };

  const markAsShipped = (id: string) => {
    const shipmentDate = new Date().toISOString().split('T')[0];
    updateContainer(id, { 
      status: 'Shipped',
      shipmentDate: shipmentDate
    });
  };

  const unmarkAsShipped = (id: string) => {
    updateContainer(id, { 
      status: 'Warehouse'
      // Keep shipmentDate - don't clear it
    });
  };

  const getContainerByBaleId = (baleId: string): Container | undefined => {
    return containers.find(container => 
      container.assignedBales && container.assignedBales.includes(baleId)
    );
  };

  const contextValue: ContainersContextType = {
    containers,
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
    <ContainersContext.Provider value={contextValue}>
      {children}
    </ContainersContext.Provider>
  );
};