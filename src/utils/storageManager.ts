// Storage management utility to handle localStorage quotas
import { dbManager } from './indexedDbManager';

// CRITICAL: These keys contain essential business data and must NEVER be deleted automatically
const PROTECTED_KEYS = [
  'bales',
  'containers', 
  'bins',
  'drivers',
  'pickupRequests',
  'adminAuth'
];

// Helper to clean up JSON strings to save space
const compressJSON = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    // Remove any null/undefined values and compress
    return JSON.stringify(parsed);
  } catch {
    return jsonString;
  }
};

// Create a backup before any potentially destructive operation
const createBackup = (): string => {
  const backup: Record<string, any> = {};
  PROTECTED_KEYS.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      backup[key] = data;
    }
  });
  backup.timestamp = new Date().toISOString();
  const backupString = JSON.stringify(backup);
  
  // Store backup in sessionStorage as emergency recovery
  try {
    sessionStorage.setItem('emergency_backup', backupString);
  } catch (e) {
    console.warn('Could not create emergency backup in sessionStorage');
  }
  
  return backupString;
};

// Verify critical data integrity
const verifyDataIntegrity = (): boolean => {
  let hasIssues = false;
  
  PROTECTED_KEYS.forEach(key => {
    if (key === 'adminAuth') return; // Auth can be missing
    
    const data = localStorage.getItem(key);
    if (!data || data === 'undefined' || data === 'null') {
      console.error(`CRITICAL: Missing or corrupted data for key: ${key}`);
      hasIssues = true;
      
      // Attempt recovery from sessionStorage backup
      const backup = sessionStorage.getItem('emergency_backup');
      if (backup) {
        try {
          const backupData = JSON.parse(backup);
          if (backupData[key]) {
            console.log(`Recovering ${key} from emergency backup...`);
            localStorage.setItem(key, backupData[key]);
            hasIssues = false;
          }
        } catch (e) {
          console.error('Could not recover from backup:', e);
        }
      }
    }
  });
  
  return !hasIssues;
};

export const getStorageSize = async (): Promise<{ 
  localStorage: { used: number; total: number };
  indexedDB: { used: number; total: number };
  combined: { used: number; total: number };
}> => {
  // LocalStorage usage
  let localUsed = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      localUsed += localStorage[key].length + key.length;
    }
  }
  const localTotal = 10 * 1024 * 1024; // 10MB estimate (doubled)
  
  // IndexedDB usage
  let indexedDBUsage = { photos: 0, documents: 0, total: 0 };
  try {
    indexedDBUsage = await dbManager.getStorageUsage();
  } catch (e) {
    console.warn('Could not get IndexedDB usage:', e);
  }
  const indexedDBTotal = 100 * 1024 * 1024; // 100MB estimate (much larger)
  
  return {
    localStorage: { used: localUsed, total: localTotal },
    indexedDB: { used: indexedDBUsage.total, total: indexedDBTotal },
    combined: { 
      used: localUsed + indexedDBUsage.total, 
      total: localTotal + indexedDBTotal 
    }
  };
};

export const getStorageUsageByKey = (): Record<string, number> => {
  const usage: Record<string, number> = {};
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      usage[key] = localStorage[key].length;
    }
  }
  
  return usage;
};

export const clearLargestItems = (additionalKeepKeys: string[] = []): void => {
  // ALWAYS protect critical keys
  const keepKeys = [...PROTECTED_KEYS, ...additionalKeepKeys];
  
  // Create backup before ANY deletion
  createBackup();
  
  const usage = getStorageUsageByKey();
  const sortedKeys = Object.keys(usage)
    .filter(key => !keepKeys.includes(key))
    .sort((a, b) => usage[b] - usage[a]);
  
  if (sortedKeys.length === 0) {
    console.warn('Storage optimization: No deletable items found. All items are protected.');
    // Don't alert user, just log
    return;
  }
  
  // Remove ONLY non-critical items
  for (let i = 0; i < Math.min(3, sortedKeys.length); i++) {
    // Double-check it's not a protected key
    if (PROTECTED_KEYS.includes(sortedKeys[i])) {
      console.error(`PREVENTED: Attempted to delete protected key: ${sortedKeys[i]}`);
      continue;
    }
    console.log(`Removing non-critical localStorage item: ${sortedKeys[i]} (${usage[sortedKeys[i]]} bytes)`);
    localStorage.removeItem(sortedKeys[i]);
  }
  
  // Verify data integrity after operation
  verifyDataIntegrity();
};

export const isStorageFull = async (): Promise<boolean> => {
  const storage = await getStorageSize();
  return storage.localStorage.used > storage.localStorage.total * 0.95; // 95% full (increased threshold)
};

export const safeSetItem = (key: string, value: string): boolean => {
  // Compress the value to save space
  const compressedValue = compressJSON(value);
  
  // Create backup before any save operation that might trigger cleanup
  if (PROTECTED_KEYS.includes(key)) {
    createBackup();
  }
  
  try {
    localStorage.setItem(key, compressedValue);
    
    // Verify the save was successful for critical data
    if (PROTECTED_KEYS.includes(key)) {
      const saved = localStorage.getItem(key);
      if (saved !== compressedValue) {
        console.error(`CRITICAL: Failed to save ${key} correctly`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, attempting to free space...');
      
      // Create emergency backup before ANY space clearing
      createBackup();
      console.log('Emergency backup created before space clearing');
      
      // Try to clear some space - protecting ALL critical data
      clearLargestItems([key]); // Pass current key as additional protected
      
      try {
        localStorage.setItem(key, compressedValue);
        
        // Verify critical data is still intact
        if (!verifyDataIntegrity()) {
          console.error('Data integrity check failed after save - attempting recovery');
          attemptDataRecovery();
        }
        
        return true;
      } catch (secondError) {
        console.error('Failed to save to localStorage even after clearing space');
        // Silently fail without alerting user
        return false;
      }
    }
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Export data integrity check for use in components
export const checkDataIntegrity = verifyDataIntegrity;

// Attempt to recover data from emergency backup
export const attemptDataRecovery = (): boolean => {
  const backup = sessionStorage.getItem('emergency_backup');
  if (!backup) {
    console.log('No emergency backup found');
    return false;
  }
  
  try {
    const backupData = JSON.parse(backup);
    console.log('Found emergency backup from:', backupData.timestamp);
    
    let recovered = false;
    PROTECTED_KEYS.forEach(key => {
      if (key === 'adminAuth') return;
      
      const currentData = localStorage.getItem(key);
      if ((!currentData || currentData === 'null' || currentData === '[]') && backupData[key]) {
        console.log(`Recovering ${key} from backup...`);
        localStorage.setItem(key, backupData[key]);
        recovered = true;
      }
    });
    
    if (recovered) {
      console.log('Data has been recovered from emergency backup');
    }
    
    return recovered;
  } catch (e) {
    console.error('Failed to recover from backup:', e);
    return false;
  }
};

export const clearAllData = async (): Promise<void> => {
  if (window.confirm('This will clear all data including bales, containers, bins, drivers, photos, and documents. Are you sure?')) {
    // Create final backup before clearing
    createBackup();
    console.log('Final backup created before clearing all data');
    
    localStorage.clear();
    try {
      await dbManager.clearAll();
    } catch (e) {
      console.warn('Could not clear IndexedDB:', e);
    }
    window.location.reload();
  }
};

export const exportData = async (): Promise<void> => {
  let indexedDBData = null;
  try {
    const usage = await dbManager.getStorageUsage();
    indexedDBData = {
      photosCount: 0, // We'll count them if needed
      documentsCount: 0,
      totalSize: usage.total,
      note: 'Photos and documents are stored separately in IndexedDB for better performance'
    };
  } catch (e) {
    console.warn('Could not export IndexedDB data:', e);
  }
  
  const data = {
    localStorage: {
      bales: localStorage.getItem('bales'),
      containers: localStorage.getItem('containers'),
      bins: localStorage.getItem('bins'),
      drivers: localStorage.getItem('drivers'),
      pickupRequests: localStorage.getItem('pickupRequests')
    },
    indexedDB: indexedDBData,
    exportDate: new Date().toISOString(),
    note: 'This export includes localStorage data. Photos/documents are in IndexedDB and exported separately.'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hhdonations_data_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};