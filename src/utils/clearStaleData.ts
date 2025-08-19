// Utility to clear stale data from localStorage
export const clearStaleContainerData = () => {
  const keys = ['containers', 'containersData'];
  
  keys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`Removing stale data for key: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ Stale container data cleared');
  console.log('📍 The page will now load fresh data from the database');
};

// Auto-clear stale data if it looks like test data
export const checkAndClearStaleData = () => {
  const containersKey = 'containers';
  const stored = localStorage.getItem(containersKey);
  
  if (stored) {
    try {
      const containers = JSON.parse(stored);
      
      // Check if this looks like the old test data
      const hasTestData = containers.some((c: any) => 
        (!c.containerNumber || c.containerNumber === '') &&
        (c.destination === 'Toronto, ON, Canada' || 
         c.destination === 'Montreal, QC, Canada' ||
         c.destination === 'Beirut, Lebanon' ||
         c.destination === 'Bavaria, Germany') &&
        (c.totalWeight === 5960 || c.assignedBales?.length === 10)
      );
      
      if (hasTestData) {
        console.log('🔍 Detected stale test data, clearing...');
        clearStaleContainerData();
        return true;
      }
    } catch (error) {
      console.error('Error checking for stale data:', error);
    }
  }
  
  return false;
};

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).clearStaleContainerData = clearStaleContainerData;
  (window as any).checkAndClearStaleData = checkAndClearStaleData;
  
  // Auto-check on load
  checkAndClearStaleData();
}