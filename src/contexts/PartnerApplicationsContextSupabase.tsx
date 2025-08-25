import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseService } from '@/services/supabaseService';
import { isSupabaseConfigured, DatabasePartnerApplication } from '@/lib/supabase';

export interface PartnerApplication {
  id: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  additionalInfo?: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  submittedAt: string;
  reviewNotes?: string;
  notesTimeline?: { id: string; text: string; timestamp: string; user?: string }[];
  reviewedBy?: string;
  reviewedAt?: string;
}

// Convert between app format (nested address) and database format (flat fields with snake_case)
const convertAppToDatabase = (app: PartnerApplication): DatabasePartnerApplication => ({
  id: app.id,
  organization_name: app.organizationName,
  contact_person: app.contactPerson,
  email: app.email,
  phone: app.phone,
  website: app.website,
  street: app.address.street,
  city: app.address.city,
  state: app.address.state,
  zip_code: app.address.zipCode,
  additional_info: app.additionalInfo,
  status: app.status,
  submitted_at: app.submittedAt,
  review_notes: app.reviewNotes,
  reviewed_at: app.reviewedAt
});

const convertDatabaseToApp = (db: DatabasePartnerApplication): PartnerApplication => {
  // Try to parse notes timeline from review_notes if it's a JSON string
  let notesTimeline;
  if (db.review_notes) {
    try {
      const parsed = JSON.parse(db.review_notes);
      if (Array.isArray(parsed)) {
        notesTimeline = parsed;
      }
    } catch {
      // If it's not valid JSON, treat it as a plain text note
      // and keep it in reviewNotes field
    }
  }

  return {
    id: db.id,
    organizationName: db.organization_name,
    contactPerson: db.contact_person,
    email: db.email,
    phone: db.phone,
    website: db.website,
    address: {
      street: db.street,
      city: db.city,
      state: db.state,
      zipCode: db.zip_code
    },
    additionalInfo: db.additional_info,
    status: db.status,
    submittedAt: db.submitted_at,
    reviewNotes: notesTimeline ? undefined : db.review_notes, // Only keep if not JSON
    notesTimeline: notesTimeline,
    reviewedAt: db.reviewed_at
  };
};

interface PartnerApplicationsContextType {
  applications: PartnerApplication[];
  setApplications: React.Dispatch<React.SetStateAction<PartnerApplication[]>>;
  addApplication: (application: Omit<PartnerApplication, 'id' | 'status' | 'submittedAt'>) => Promise<void>;
  updateApplicationStatus: (id: string, status: PartnerApplication['status'], notes?: string) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  addNoteToTimeline: (id: string, note: string) => Promise<void>;
  refreshApplications: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const PartnerApplicationsContext = createContext<PartnerApplicationsContextType | undefined>(undefined);

// Use environment variable to determine if Supabase is enabled
const USE_SUPABASE = isSupabaseConfigured;

// Generate a proper UUID for Supabase
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const PartnerApplicationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load applications from Supabase on mount
  useEffect(() => {
    if (USE_SUPABASE) {
      refreshApplications();
    } else {
      // Load from localStorage if Supabase is not configured
      const stored = localStorage.getItem('partnerApplications');
      if (stored) {
        try {
          setApplications(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored applications:', e);
        }
      }
    }
  }, []);

  // Save to localStorage when applications change (if not using Supabase)
  useEffect(() => {
    if (!USE_SUPABASE) {
      localStorage.setItem('partnerApplications', JSON.stringify(applications));
    }
  }, [applications]);

  const refreshApplications = async () => {
    if (!USE_SUPABASE) {
      const stored = localStorage.getItem('partnerApplications');
      if (stored) {
        try {
          setApplications(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored applications:', e);
        }
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await SupabaseService.partnerApplications.getAllPartnerApplications();
      setApplications(data.map(convertDatabaseToApp));
    } catch (err) {
      console.error('Failed to fetch partner applications:', err);
      setError('Failed to load applications');
      // Fall back to localStorage
      const stored = localStorage.getItem('partnerApplications');
      if (stored) {
        try {
          setApplications(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored applications:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addApplication = async (application: Omit<PartnerApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newApplication: PartnerApplication = {
      ...application,
      id: USE_SUPABASE ? generateUUID() : Date.now().toString(),
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    if (USE_SUPABASE) {
      try {
        const dbApp = convertAppToDatabase(newApplication);
        await SupabaseService.partnerApplications.createPartnerApplication(dbApp);
        await refreshApplications();
      } catch (err) {
        console.error('Failed to create application:', err);
        setError('Failed to submit application');
        // Fall back to localStorage
        setApplications(prev => [...prev, newApplication]);
        localStorage.setItem('partnerApplications', JSON.stringify([...applications, newApplication]));
      }
    } else {
      setApplications(prev => [...prev, newApplication]);
    }
  };

  const updateApplicationStatus = async (
    id: string, 
    status: PartnerApplication['status'], 
    notes?: string
  ) => {
    const updates: Partial<PartnerApplication> = {
      status,
      reviewedAt: new Date().toISOString()
    };

    // Don't update reviewNotes if we're using notesTimeline
    // Only add a note to timeline if notes are provided
    if (notes && notes.trim()) {
      // Add status change note to timeline
      const statusNote = {
        id: Date.now().toString() + '-status',
        text: `Status changed to ${status}. ${notes}`,
        timestamp: new Date().toISOString(),
        user: 'Admin'
      };

      setApplications(prev =>
        prev.map(app => {
          if (app.id === id) {
            const currentNotes = app.notesTimeline || [];
            return {
              ...app,
              ...updates,
              notesTimeline: [...currentNotes, statusNote]
            };
          }
          return app;
        })
      );
    } else {
      setApplications(prev =>
        prev.map(app => app.id === id ? { ...app, ...updates } : app)
      );
    }

    if (USE_SUPABASE) {
      try {
        const app = applications.find(a => a.id === id);
        if (app) {
          // Get current notes timeline
          let notesTimeline = app.notesTimeline || [];
          
          // Add status change note if provided
          if (notes && notes.trim()) {
            notesTimeline = [...notesTimeline, {
              id: Date.now().toString() + '-status',
              text: `Status changed to ${status}. ${notes}`,
              timestamp: new Date().toISOString(),
              user: 'Admin'
            }];
          }

          // For updates, preserve the notes timeline
          const dbUpdates: Partial<DatabasePartnerApplication> = {
            status: updates.status,
            reviewed_at: updates.reviewedAt
          };

          // Only update review_notes if we have a notes timeline to save
          if (notesTimeline.length > 0) {
            dbUpdates.review_notes = JSON.stringify(notesTimeline);
          }

          await SupabaseService.partnerApplications.updatePartnerApplication(id, dbUpdates);
          await refreshApplications();
        }
      } catch (err) {
        console.error('Failed to update application:', err);
        setError('Failed to update application');
      }
    }
  };

  const deleteApplication = async (id: string) => {
    if (USE_SUPABASE) {
      try {
        await SupabaseService.partnerApplications.deletePartnerApplication(id);
        await refreshApplications();
      } catch (err) {
        console.error('Failed to delete application:', err);
        setError('Failed to delete application');
        // Fall back to localStorage
        setApplications(prev => prev.filter(app => app.id !== id));
      }
    } else {
      setApplications(prev => prev.filter(app => app.id !== id));
    }
  };

  const addNoteToTimeline = async (id: string, note: string) => {
    if (!note.trim()) return;
    
    const newNote = {
      id: Date.now().toString(),
      text: note,
      timestamp: new Date().toISOString(),
      user: 'Admin' // You can get this from auth context if available
    };

    setApplications(prev =>
      prev.map(app => {
        if (app.id === id) {
          const currentNotes = app.notesTimeline || [];
          return {
            ...app,
            notesTimeline: [...currentNotes, newNote]
          };
        }
        return app;
      })
    );

    // If using Supabase, also update there
    if (USE_SUPABASE) {
      try {
        const app = applications.find(a => a.id === id);
        if (app) {
          const updatedNotes = [...(app.notesTimeline || []), newNote];
          // Store notes timeline as JSON in review_notes field for now
          // In production, you might want a separate notes table
          await SupabaseService.partnerApplications.updatePartnerApplication(id, {
            review_notes: JSON.stringify(updatedNotes)
          });
        }
      } catch (err) {
        console.error('Failed to save note to Supabase:', err);
        // Note is already saved locally, so we don't revert
      }
    }
  };

  return (
    <PartnerApplicationsContext.Provider
      value={{
        applications,
        setApplications,
        addApplication,
        updateApplicationStatus,
        deleteApplication,
        addNoteToTimeline,
        refreshApplications,
        isLoading,
        error
      }}
    >
      {children}
    </PartnerApplicationsContext.Provider>
  );
};

export const usePartnerApplications = () => {
  const context = useContext(PartnerApplicationsContext);
  if (context === undefined) {
    throw new Error('usePartnerApplications must be used within a PartnerApplicationsProvider');
  }
  return context;
};