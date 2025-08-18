import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PartnerApplication {
  id: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  taxId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  additionalInfo?: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

interface PartnerApplicationsContextType {
  applications: PartnerApplication[];
  addApplication: (application: Omit<PartnerApplication, 'id' | 'submittedAt' | 'status'>) => void;
  updateApplicationStatus: (id: string, status: PartnerApplication['status'], notes?: string) => void;
  deleteApplication: (id: string) => void;
  getApplicationById: (id: string) => PartnerApplication | undefined;
}

const PartnerApplicationsContext = createContext<PartnerApplicationsContextType | undefined>(undefined);

const STORAGE_KEY = 'partnerApplications';

export const PartnerApplicationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);

  useEffect(() => {
    const loadApplications = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setApplications(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading partner applications:', error);
      }
    };

    loadApplications();
    
    const handleStorageChange = () => {
      loadApplications();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (applications.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
      } catch (error) {
        console.error('Error saving partner applications:', error);
      }
    }
  }, [applications]);

  const addApplication = (application: Omit<PartnerApplication, 'id' | 'submittedAt' | 'status'>) => {
    const newApplication: PartnerApplication = {
      ...application,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    setApplications(prev => [...prev, newApplication]);
  };

  const updateApplicationStatus = (id: string, status: PartnerApplication['status'], notes?: string) => {
    setApplications(prev => prev.map(app => 
      app.id === id 
        ? { 
            ...app, 
            status, 
            reviewedAt: new Date().toISOString(),
            reviewNotes: notes 
          }
        : app
    ));
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  const getApplicationById = (id: string) => {
    return applications.find(app => app.id === id);
  };

  return (
    <PartnerApplicationsContext.Provider 
      value={{ 
        applications, 
        addApplication, 
        updateApplicationStatus, 
        deleteApplication,
        getApplicationById
      }}
    >
      {children}
    </PartnerApplicationsContext.Provider>
  );
};

export const usePartnerApplications = () => {
  const context = useContext(PartnerApplicationsContext);
  if (!context) {
    throw new Error('usePartnerApplications must be used within a PartnerApplicationsProvider');
  }
  return context;
};