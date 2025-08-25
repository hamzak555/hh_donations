// Quick test script to check containers loading
const testContainers = async () => {
  try {
    // Check if we can access supabase
    const response = await fetch('/test-supabase-containers');
    console.log('Test response:', response);
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run the test
console.log('Testing containers loading...');
testContainers();