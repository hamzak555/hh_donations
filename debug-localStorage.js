// Debug script to check localStorage data
// Run this in the browser console on your H&H Donations app

console.log('=== DEBUGGING LOCALSTORAGE DATA ===');

const keys = [
  'binsData',
  'driversData', 
  'pickupRequests',
  'containers',
  'bales',
  'partnerApplications',
  'adminAuth'
];

keys.forEach(key => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      console.log(`${key}:`, {
        exists: true,
        length: Array.isArray(parsed) ? parsed.length : 'Not an array',
        sample: Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : parsed
      });
    } catch (e) {
      console.log(`${key}:`, {
        exists: true,
        raw: data,
        parseError: e.message
      });
    }
  } else {
    console.log(`${key}:`, { exists: false });
  }
});

console.log('=== ALL LOCALSTORAGE KEYS ===');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`);
}