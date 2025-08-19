import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeSetItem, checkDataIntegrity, attemptDataRecovery } from '../utils/storageManager';
import { dbManager } from '../utils/indexedDbManager';
import { supabaseService } from '../services/supabaseService';

export type BaleQuality = 'A-Quality' | 'B-Quality' | 'C-Quality' | 'Creme' | 'Shoes';
export type BaleStatus = 'Warehouse' | 'Container' | 'Shipped' | 'Sold';
export type PaymentMethod = 'Cash' | 'Cheque' | 'Wire' | 'Credit Card';

export interface NoteEntry {
  id: string;
  text: string;
  timestamp: string;
}

export interface Bale {
  id: string;
  baleNumber: string;
  contents: BaleQuality;
  weight: number; // in KG
  status: BaleStatus;
  createdDate: string;
  soldDate?: string;
  salePrice?: number; // in USD
  paymentMethod?: PaymentMethod;
  notes?: string; // Keep for backward compatibility
  notesTimeline?: NoteEntry[]; // New timeline notes
  photos?: string[]; // Array of photo IDs (stored in IndexedDB)
  containerNumber?: string; // Container assignment
}

interface BalesContextType {
  bales: Bale[];
  addBale: (bale: Omit<Bale, 'id' | 'baleNumber' | 'createdDate'>) => void;
  updateBale: (id: string, updates: Partial<Bale>) => void;
  deleteBale: (id: string) => Promise<void>;
  generateBaleNumber: () => string;
  markAsSold: (id: string, salePrice: number, paymentMethod: PaymentMethod) => void;
  revertToActive: (id: string) => void;
  addNoteToTimeline: (baleId: string, noteText: string) => void;
  addPhotos: (baleId: string, photoFiles: File[]) => Promise<void>;
  getPhotos: (baleId: string) => Promise<string[]>;
  getPhotosWithIds: (baleId: string) => Promise<{id: string, data: string}[]>;
  removePhoto: (baleId: string, photoId: string) => Promise<void>;
  assignToContainer: (baleId: string, containerNumber: string) => void;
  removeFromContainer: (baleId: string) => void;
  getBalesByContainer: (containerNumber: string) => Bale[];
  repairPhotoIntegrity: (baleId: string) => Promise<void>;
}

const BalesContext = createContext<BalesContextType | undefined>(undefined);

// Check if Supabase is configured
const USE_SUPABASE = process.env.REACT_APP_SUPABASE_URL && 
                     process.env.REACT_APP_SUPABASE_URL !== 'your_supabase_project_url';

// Generate a proper UUID for Supabase
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useBales = () => {
  const context = useContext(BalesContext);
  if (!context) {
    throw new Error('useBales must be used within a BalesProvider');
  }
  return context;
};

interface BalesProviderProps {
  children: ReactNode;
}

// Simplified helper functions - direct mapping after column rename
const convertFromDatabase = (dbBale: any): Bale => {
  return {
    id: dbBale.id,
    baleNumber: dbBale.baleNumber, // Direct mapping after column rename
    contents: dbBale.contents as BaleQuality, // Direct mapping after column rename
    weight: dbBale.weight,
    status: dbBale.status as BaleStatus, // Direct mapping after column rename
    createdDate: dbBale.createdDate, // Direct mapping after column rename
    soldDate: dbBale.soldDate || undefined,
    salePrice: dbBale.salePrice || undefined,
    paymentMethod: dbBale.paymentMethod as PaymentMethod || undefined,
    notes: dbBale.notes || undefined,
    notesTimeline: dbBale.notesTimeline || undefined,
    photos: dbBale.photos || undefined,
    containerNumber: dbBale.containerNumber || undefined
  };
};

const convertToDatabase = (bale: Partial<Bale>): any => {
  // Direct mapping - no field name conversion needed after column rename
  const dbBale: any = { ...bale };
  
  // Add default location if missing
  if (dbBale.createdDate && !dbBale.location) {
    dbBale.location = 'Warehouse';
  }
  
  return dbBale;
};

export const BalesProvider = ({ children }: BalesProviderProps) => {
  const [bales, setBales] = useState<Bale[]>(() => {
    // Check data integrity on startup
    if (!checkDataIntegrity()) {
      console.warn('Data integrity check failed, attempting recovery...');
      attemptDataRecovery();
    }
    
    const savedBales = localStorage.getItem('bales');
    if (savedBales && savedBales !== 'undefined' && savedBales !== 'null') {
      const parsedBales = JSON.parse(savedBales);
      // Migrate old data formats
      const migratedBales = parsedBales.map((bale: any, index: number) => {
        // Migrate old contents format (A, B, C) to new format (A-Quality, B-Quality, C-Quality)
        if (bale.contents === 'A') bale.contents = 'A-Quality';
        else if (bale.contents === 'B') bale.contents = 'B-Quality';
        else if (bale.contents === 'C') bale.contents = 'C-Quality';
        
        // Migrate old bale number format (BALE2025001) to new format (B0001)
        if (bale.baleNumber && bale.baleNumber.startsWith('BALE')) {
          // Extract the sequential number from old format
          const oldNumber = bale.baleNumber.replace(/^BALE\d{4}/, '');
          const sequentialNumber = parseInt(oldNumber, 10) || (index + 1);
          bale.baleNumber = `B${String(sequentialNumber).padStart(4, '0')}`;
        }
        
        // Migrate old notes to timeline format
        if (bale.notes && !bale.notesTimeline) {
          bale.notesTimeline = [{
            id: generateUUID(),
            text: bale.notes,
            timestamp: bale.createdDate || new Date().toISOString()
          }];
        }
        
        // Migrate old status format
        if (bale.status === 'Assigned to Container') {
          bale.status = 'Container';
        }
        
        return bale;
      });
      return migratedBales;
    }
    return [];
  });

  // Load bales from Supabase on mount if configured
  useEffect(() => {
    const loadBales = async () => {
      if (USE_SUPABASE) {
        try {
          const dbBales = await supabaseService.getBales();
          if (dbBales && dbBales.length > 0) {
            const convertedBales = dbBales.map(convertFromDatabase);
            setBales(convertedBales);
            // Also save to localStorage as backup
            safeSetItem('bales', JSON.stringify(convertedBales));
          }
        } catch (error) {
          console.error('Failed to load bales from Supabase:', error);
          // Continue with localStorage data
        }
      }
    };
    loadBales();
  }, []);

  // Save to localStorage whenever bales change
  useEffect(() => {
    const success = safeSetItem('bales', JSON.stringify(bales));
    if (!success) {
      console.error('Failed to save bales to localStorage - storage may be full');
      // You could show a toast notification here
    }
  }, [bales]);

  const generateBaleNumber = () => {
    const existingNumbers = bales
      .filter(bale => bale.baleNumber.startsWith('B'))
      .map(bale => {
        const numberPart = bale.baleNumber.replace('B', '');
        return parseInt(numberPart, 10);
      })
      .filter(num => !isNaN(num));
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `B${String(nextNumber).padStart(4, '0')}`;
  };

  const addBale = async (baleData: Omit<Bale, 'id' | 'baleNumber' | 'createdDate'>) => {
    const createdDate = new Date().toISOString().split('T')[0];
    const newBale: Bale = {
      ...baleData,
      id: generateUUID(), // Generate proper UUID for Supabase
      baleNumber: generateBaleNumber(),
      createdDate,
      // Convert initial notes to timeline format
      notesTimeline: baleData.notes ? [{
        id: generateUUID(),
        text: baleData.notes,
        timestamp: new Date().toISOString()
      }] : undefined
    };
    
    // Add to Supabase if configured
    if (USE_SUPABASE) {
      try {
        const dbBale = convertToDatabase(newBale);
        const addedBale = await supabaseService.addBale(dbBale);
        if (addedBale) {
          newBale.id = addedBale.id; // Use the database-generated ID
        }
      } catch (error) {
        console.error('Failed to add bale to Supabase:', error);
      }
    }
    
    setBales(prev => [...prev, newBale]);
  };

  const updateBale = async (id: string, updates: Partial<Bale>) => {
    // Update in Supabase if configured
    if (USE_SUPABASE) {
      try {
        const dbUpdates = convertToDatabase(updates);
        await supabaseService.updateBale(id, dbUpdates);
      } catch (error) {
        console.error('Failed to update bale in Supabase:', error);
      }
    }
    
    setBales(prev => 
      prev.map(bale => 
        bale.id === id ? { ...bale, ...updates } : bale
      )
    );
  };

  const deleteBale = async (id: string) => {
    // Delete photos from IndexedDB before deleting bale
    try {
      await dbManager.deleteEntityFiles(id, 'bale');
    } catch (error) {
      console.warn('Failed to delete bale photos from IndexedDB:', error);
    }
    
    // Delete from Supabase if configured
    if (USE_SUPABASE) {
      try {
        await supabaseService.deleteBale(id);
      } catch (error) {
        console.error('Failed to delete bale from Supabase:', error);
      }
    }
    
    setBales(prev => prev.filter(bale => bale.id !== id));
  };

  const markAsSold = (id: string, salePrice: number, paymentMethod: PaymentMethod) => {
    const soldDate = new Date().toISOString().split('T')[0];
    updateBale(id, { 
      status: 'Sold', 
      salePrice, 
      paymentMethod, 
      soldDate
    });
  };

  const revertToActive = (id: string) => {
    const bale = bales.find(b => b.id === id);
    const newStatus = bale?.containerNumber ? 'Container' : 'Warehouse';
    
    updateBale(id, { 
      status: newStatus,
      salePrice: undefined,
      paymentMethod: undefined,
      soldDate: undefined
    });
  };

  const addNoteToTimeline = async (baleId: string, noteText: string) => {
    if (!noteText.trim()) return;
    
    const newNote: NoteEntry = {
      id: generateUUID(),
      text: noteText,
      timestamp: new Date().toISOString()
    };
    
    // Get current bale data before updating state
    const currentBale = bales.find(b => b.id === baleId);
    if (!currentBale) return;
    
    const currentTimeline = currentBale.notesTimeline || [];
    const updatedTimeline = [...currentTimeline, newNote];
    
    // Update local state
    setBales(prev => 
      prev.map(bale => {
        if (bale.id === baleId) {
          return {
            ...bale,
            notesTimeline: updatedTimeline
          };
        }
        return bale;
      })
    );
    
    // Sync to Supabase if configured
    if (USE_SUPABASE) {
      try {
        await updateBale(baleId, { notesTimeline: updatedTimeline });
      } catch (error) {
        console.error('[BalesContext] Failed to sync note to Supabase:', error);
      }
    }
  };

  const addPhotos = async (baleId: string, photoFiles: File[]): Promise<void> => {
    try {
      // Convert files to base64 and save to IndexedDB
      const photoIds: string[] = [];
      
      for (const file of photoFiles) {
        const base64 = await fileToBase64(file);
        const photoId = await dbManager.savePhoto(baleId, 'bale', base64);
        photoIds.push(photoId);
      }
      
      // Get current bale data before updating state
      const currentBale = bales.find(b => b.id === baleId);
      if (!currentBale) {
        throw new Error(`Bale with ID ${baleId} not found`);
      }
      
      const currentPhotos = currentBale.photos || [];
      const updatedPhotos = [...currentPhotos, ...photoIds];
      
      // Update local state
      setBales(prev => 
        prev.map(bale => {
          if (bale.id === baleId) {
            return {
              ...bale,
              photos: updatedPhotos
            };
          }
          return bale;
        })
      );
      
      // Sync to Supabase if configured
      if (USE_SUPABASE) {
        try {
          await updateBale(baleId, { photos: updatedPhotos });
        } catch (error) {
          console.error('[BalesContext] Failed to sync photos to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Failed to add photos:', error);
      throw error;
    }
  };
  
  const getPhotos = async (baleId: string): Promise<string[]> => {
    try {
      return await dbManager.getPhotos(baleId, 'bale');
    } catch (error) {
      console.error('Failed to get photos:', error);
      return [];
    }
  };

  const getPhotosWithIds = async (baleId: string): Promise<{id: string, data: string}[]> => {
    try {
      return await dbManager.getPhotosWithIds(baleId, 'bale');
    } catch (error) {
      console.error('Failed to get photos with IDs:', error);
      return [];
    }
  };

  const removePhoto = async (baleId: string, photoId: string): Promise<void> => {
    try {
      // Delete from IndexedDB
      await dbManager.deletePhoto(photoId);
      
      // Remove photo ID from bale record
      setBales(prev => 
        prev.map(bale => {
          if (bale.id === baleId) {
            const updatedPhotos = (bale.photos || []).filter(id => id !== photoId);
            return {
              ...bale,
              photos: updatedPhotos
            };
          }
          return bale;
        })
      );
    } catch (error) {
      console.error('Failed to remove photo:', error);
      throw error;
    }
  };
  
  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const assignToContainer = (baleId: string, containerNumber: string) => {
    updateBale(baleId, {
      status: 'Container',
      containerNumber: containerNumber
    });
  };

  const removeFromContainer = (baleId: string) => {
    updateBale(baleId, {
      status: 'Warehouse',
      containerNumber: undefined
    });
  };

  const getBalesByContainer = (containerNumber: string): Bale[] => {
    return bales.filter(bale => bale.containerNumber === containerNumber);
  };

  const repairPhotoIntegrity = async (baleId: string): Promise<void> => {
    try {
      const bale = bales.find(b => b.id === baleId);
      if (!bale || !bale.photos) return;

      // Get actual photos from IndexedDB
      const actualPhotos = await dbManager.getPhotos(baleId, 'bale');
      const actualPhotoIds = actualPhotos.map((_, index) => `photo_${baleId}_${index}`);
      
      // If there's a mismatch, update the bale record
      if (bale.photos.length !== actualPhotos.length) {
        console.log(`Repairing photo integrity for bale ${bale.baleNumber}: had ${bale.photos.length} IDs, found ${actualPhotos.length} actual photos`);
        
        updateBale(baleId, {
          photos: actualPhotoIds
        });
      }
    } catch (error) {
      console.error('Failed to repair photo integrity:', error);
    }
  };

  const contextValue: BalesContextType = {
    bales,
    addBale,
    updateBale,
    deleteBale,
    generateBaleNumber,
    markAsSold,
    revertToActive,
    addNoteToTimeline,
    addPhotos,
    getPhotos,
    getPhotosWithIds,
    removePhoto,
    assignToContainer,
    removeFromContainer,
    getBalesByContainer,
    repairPhotoIntegrity
  };

  return (
    <BalesContext.Provider value={contextValue}>
      {children}
    </BalesContext.Provider>
  );
};