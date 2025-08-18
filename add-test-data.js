// Add test data to localStorage for migration testing
// Run this in browser console on your H&H Donations app

console.log('Adding test data to localStorage...');

// Test bins data
const testBins = [
  {
    id: 'bin-001',
    binNumber: 'BIN-001',
    locationName: 'Test Location 1',
    address: '123 Test Street, Test City, TS 12345',
    lat: 40.7128,
    lng: -74.0060,
    status: 'Available',
    pickupStatus: 'Not Scheduled',
    createdDate: '2024-01-01',
    sensorEnabled: false
  },
  {
    id: 'bin-002', 
    binNumber: 'BIN-002',
    locationName: 'Test Location 2',
    address: '456 Test Avenue, Test City, TS 12345',
    lat: 40.7589,
    lng: -73.9851,
    status: 'Full',
    pickupStatus: 'Scheduled',
    createdDate: '2024-01-02',
    sensorEnabled: true,
    fillLevel: 85,
    batteryLevel: 75
  }
];

// Test drivers data  
const testDrivers = [
  {
    id: 'driver-001',
    name: 'John Smith',
    email: 'john@test.com',
    phone: '555-0123',
    assignedBins: ['bin-001'],
    status: 'Active',
    totalPickups: 25
  }
];

// Test pickup requests
const testPickupRequests = [
  {
    id: 'req-001',
    requesterName: 'Jane Doe',
    phone: '555-0456',
    email: 'jane@test.com',
    pickupAddress: '789 Pickup Street, Test City, TS 12345',
    pickupDate: '2024-08-20',
    itemDescription: 'Old clothing and books',
    status: 'Pending'
  }
];

// Test containers
const testContainers = [
  {
    id: 'container-001',
    containerNumber: 'CONT-001',
    assignedBales: [],
    totalWeight: 0,
    destination: 'Port of Test',
    status: 'Warehouse',
    createdDate: '2024-08-01'
  }
];

// Test bales
const testBales = [
  {
    id: 'bale-001',
    baleNumber: 'BALE-001',
    contents: 'A-Quality',
    weight: 45.5,
    status: 'Warehouse',
    createdDate: '2024-08-01'
  }
];

// Save to localStorage
localStorage.setItem('binsData', JSON.stringify(testBins));
localStorage.setItem('driversData', JSON.stringify(testDrivers));
localStorage.setItem('pickupRequests', JSON.stringify(testPickupRequests));
localStorage.setItem('containers', JSON.stringify(testContainers));
localStorage.setItem('bales', JSON.stringify(testBales));

console.log('✅ Test data added to localStorage!');
console.log('📊 Added:', {
  bins: testBins.length,
  drivers: testDrivers.length,
  pickupRequests: testPickupRequests.length,
  containers: testContainers.length,
  bales: testBales.length
});

console.log('🔄 Now refresh the migration page and try migrating again!');