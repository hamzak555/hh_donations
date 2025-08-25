// Data persistence utilities for production environment
export const DATA_KEYS = {
  drivers: 'driversData',
  containers: 'containersData',
  bins: 'binsData',
  bales: 'balesData',
  pickupRequests: 'pickupRequestsData',
  adminAuth: 'adminAuth'
};

// Verify data persistence across sessions
export const verifyDataPersistence = (): boolean => {
  let allDataPresent = true;
  
  Object.entries(DATA_KEYS).forEach(([name, key]) => {
    const data = localStorage.getItem(key);
    if (!data && key !== 'adminAuth') {
      console.warn(`Missing data for ${name} (key: ${key})`);
      allDataPresent = false;
    }
  });
  
  return allDataPresent;
};

// Force save all context data to localStorage
export const forceSaveToLocalStorage = (contextName: string, data: any): boolean => {
  const key = DATA_KEYS[contextName as keyof typeof DATA_KEYS];
  if (!key) {
    console.error(`Unknown context: ${contextName}`);
    return false;
  }
  
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    
    // Verify the save
    const saved = localStorage.getItem(key);
    if (saved !== serialized) {
      console.error(`Failed to verify save for ${contextName}`);
      return false;
    }
    
    console.log(`Successfully saved ${contextName} to localStorage`);
    return true;
  } catch (error) {
    console.error(`Error saving ${contextName}:`, error);
    return false;
  }
};

// Initialize localStorage with empty arrays if keys don't exist
export const initializeLocalStorage = (): void => {
  Object.entries(DATA_KEYS).forEach(([name, key]) => {
    if (key === 'adminAuth') return; // Skip auth
    
    const existing = localStorage.getItem(key);
    if (!existing) {
      console.log(`Initializing ${name} with empty array`);
      localStorage.setItem(key, JSON.stringify([]));
    }
  });
};

// Debug function to check localStorage state
export const debugLocalStorage = (): void => {
  console.group('LocalStorage Debug Info');
  
  Object.entries(DATA_KEYS).forEach(([name, key]) => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(`${name} (${key}):`, Array.isArray(parsed) ? `${parsed.length} items` : 'present');
      } catch {
        console.log(`${name} (${key}): invalid JSON`);
      }
    } else {
      console.log(`${name} (${key}): not set`);
    }
  });
  
  console.groupEnd();
};