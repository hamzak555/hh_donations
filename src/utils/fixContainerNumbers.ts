// Utility to fix containers without container numbers
// This can be run in the browser console to fix existing containers

export const fixContainerNumbers = async () => {
  const containersKey = 'containers';
  const stored = localStorage.getItem(containersKey);
  
  if (!stored) {
    console.log('No containers found in localStorage');
    return;
  }
  
  try {
    const containers = JSON.parse(stored);
    let fixedCount = 0;
    
    const updatedContainers = containers.map((container: any, index: number) => {
      if (!container.containerNumber || container.containerNumber === '') {
        fixedCount++;
        // Generate a proper container number
        const paddedNumber = String(index + 1).padStart(4, '0');
        container.containerNumber = `CNT${paddedNumber}`;
        console.log(`Fixed container ${container.id}: assigned ${container.containerNumber}`);
      }
      
      // Also ensure proper default values
      if (!container.destination || container.destination === '') {
        container.destination = 'Not specified';
      }
      
      // Fix totalWeight if it's exactly 5960 (likely test data)
      if (container.totalWeight === 5960) {
        container.totalWeight = 0; // Reset to 0, will be calculated from actual bales
      }
      
      return container;
    });
    
    // Save the fixed containers
    localStorage.setItem(containersKey, JSON.stringify(updatedContainers));
    
    console.log(`✅ Fixed ${fixedCount} containers without numbers`);
    console.log('📍 Reload the page to see the changes');
    
    return updatedContainers;
  } catch (error) {
    console.error('Error fixing containers:', error);
  }
};

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).fixContainerNumbers = fixContainerNumbers;
}