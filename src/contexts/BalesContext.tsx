import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type BaleQuality = 'A-Quality' | 'B-Quality' | 'C-Quality' | 'Creme' | 'Shoes';
export type BaleStatus = 'Warehouse' | 'Assigned to Container' | 'Shipped' | 'Sold';
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
  photos?: string[]; // Array of photo URLs
}

interface BalesContextType {
  bales: Bale[];
  addBale: (bale: Omit<Bale, 'id' | 'baleNumber' | 'createdDate'>) => void;
  updateBale: (id: string, updates: Partial<Bale>) => void;
  deleteBale: (id: string) => void;
  generateBaleNumber: () => string;
  markAsSold: (id: string, salePrice: number, paymentMethod: PaymentMethod) => void;
  revertToActive: (id: string) => void;
  addNoteToTimeline: (baleId: string, noteText: string) => void;
  addPhotos: (baleId: string, photos: string[]) => void;
}

const BalesContext = createContext<BalesContextType | undefined>(undefined);

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

export const BalesProvider = ({ children }: BalesProviderProps) => {
  const [bales, setBales] = useState<Bale[]>(() => {
    const savedBales = localStorage.getItem('bales');
    if (savedBales) {
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
            id: String(Date.now()),
            text: bale.notes,
            timestamp: bale.createdDate || new Date().toISOString()
          }];
        }
        
        return bale;
      });
      return migratedBales;
    }
    return [];
  });

  // Save to localStorage whenever bales change
  useEffect(() => {
    localStorage.setItem('bales', JSON.stringify(bales));
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

  const addBale = (baleData: Omit<Bale, 'id' | 'baleNumber' | 'createdDate'>) => {
    const createdDate = new Date().toISOString().split('T')[0];
    const newBale: Bale = {
      ...baleData,
      id: String(Date.now()),
      baleNumber: generateBaleNumber(),
      createdDate,
      // Convert initial notes to timeline format
      notesTimeline: baleData.notes ? [{
        id: String(Date.now()),
        text: baleData.notes,
        timestamp: new Date().toISOString()
      }] : undefined
    };
    
    setBales(prev => [...prev, newBale]);
  };

  const updateBale = (id: string, updates: Partial<Bale>) => {
    setBales(prev => 
      prev.map(bale => 
        bale.id === id ? { ...bale, ...updates } : bale
      )
    );
  };

  const deleteBale = (id: string) => {
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
    updateBale(id, { 
      status: 'Warehouse',
      salePrice: undefined,
      paymentMethod: undefined,
      soldDate: undefined
    });
  };

  const addNoteToTimeline = (baleId: string, noteText: string) => {
    if (!noteText.trim()) return;
    
    setBales(prev => 
      prev.map(bale => {
        if (bale.id === baleId) {
          const newNote: NoteEntry = {
            id: String(Date.now()),
            text: noteText,
            timestamp: new Date().toISOString()
          };
          
          const currentTimeline = bale.notesTimeline || [];
          return {
            ...bale,
            notesTimeline: [...currentTimeline, newNote]
          };
        }
        return bale;
      })
    );
  };

  const addPhotos = (baleId: string, photos: string[]) => {
    setBales(prev => 
      prev.map(bale => {
        if (bale.id === baleId) {
          const currentPhotos = bale.photos || [];
          return {
            ...bale,
            photos: [...currentPhotos, ...photos]
          };
        }
        return bale;
      })
    );
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
    addPhotos
  };

  return (
    <BalesContext.Provider value={contextValue}>
      {children}
    </BalesContext.Provider>
  );
};