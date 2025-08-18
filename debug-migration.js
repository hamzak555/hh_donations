// Comprehensive migration debugging script
// Copy and paste this into your browser console on the migration page

console.log('🔍 MIGRATION DEBUG SCRIPT');
console.log('================================');

// 1. Check all localStorage data
console.log('\n📦 LOCALSTORAGE CONTENTS:');
const expectedKeys = [
  'binsData',
  'driversData', 
  'pickupRequests',
  'containers',
  'bales',
  'partnerApplications',
  'adminAuth'
];

expectedKeys.forEach(key => {
  const data = localStorage.getItem(key);
  console.log(`${key}: ${data ? `${data.length} chars` : 'EMPTY'}`);
  
  if (data) {
    try {
      const parsed = JSON.parse(data);
      const count = Array.isArray(parsed) ? parsed.length : 1;
      console.log(`  └─ Parsed: ${count} items`);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`  └─ Sample:`, parsed[0]);
      }
    } catch (e) {
      console.log(`  └─ Parse error: ${e.message}`);
    }
  }
});

// 2. Show all localStorage keys (to find any we missed)
console.log('\n🗂️ ALL LOCALSTORAGE KEYS:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const data = localStorage.getItem(key);
  console.log(`  ${key}: ${data ? `${data.length} chars` : 'empty'}`);
}

// 3. Test Supabase connection
console.log('\n🔗 TESTING SUPABASE CONNECTION:');
if (window.supabase) {
  console.log('✅ Supabase client found');
  
  // Test a simple query
  window.supabase.from('bins').select('count').then(result => {
    if (result.error) {
      console.log('❌ Supabase query failed:', result.error);
    } else {
      console.log('✅ Supabase connection working');
    }
  });
} else {
  console.log('❌ Supabase client not found in window');
}

// 4. Test the DataMigration class
console.log('\n🚀 TESTING MIGRATION FUNCTIONS:');
if (window.DataMigration) {
  console.log('✅ DataMigration class found');
  
  // Test localStorage backup
  try {
    const backup = window.DataMigration.createLocalStorageBackup();
    console.log('✅ Backup created:', backup.length, 'characters');
  } catch (e) {
    console.log('❌ Backup failed:', e.message);
  }
} else {
  console.log('❌ DataMigration class not found in window');
}

console.log('\n================================');
console.log('🏁 DEBUG COMPLETE - Check output above');