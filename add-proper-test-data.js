// Add proper test data to localStorage for migration testing
// Run this in browser console on your H&H Donations app

console.log('Adding proper test data to localStorage...');

// Test pickup requests with correct format
const testPickupRequests = [
  {
    id: '1',
    name: 'John Doe',
    phone: '555-0123',
    email: 'john@example.com',
    address: '123 Main St, Toronto, ON M5H 2N2',
    location: {
      lat: 43.6532,
      lng: -79.3832
    },
    date: '2024-08-20',
    time: '9:00 AM - 4:00 PM',
    additionalNotes: 'Clothing and household items',
    status: 'Pending'
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '555-0456',
    email: 'jane@example.com',
    address: '456 Oak Ave, Toronto, ON M5H 3A1',
    location: {
      lat: 43.6590,
      lng: -79.3850
    },
    date: '2024-08-21',
    time: '9:00 AM - 4:00 PM',
    additionalNotes: 'Books and electronics',
    status: 'Scheduled'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    phone: '555-0789',
    email: 'bob@example.com',
    address: '789 Pine Rd, Toronto, ON M5H 4B2',
    location: {
      lat: 43.6400,
      lng: -79.3900
    },
    date: '2024-08-22',
    time: '9:00 AM - 4:00 PM',
    additionalNotes: 'Furniture and appliances',
    status: 'Picked Up'
  }
];

// Test bins data
const testBins = [
  {
    id: '1',
    binNumber: 'BIN-001',
    locationName: 'Downtown Community Center',
    address: '100 Queen St W, Toronto, ON M5H 2N1',
    lat: 43.6526,
    lng: -79.3841,
    status: 'Available',
    pickupStatus: 'Not Scheduled',
    createdDate: '2024-01-01',
    sensorEnabled: true,
    fillLevel: 45,
    batteryLevel: 85
  },
  {
    id: '2',
    binNumber: 'BIN-002',
    locationName: 'North York Mall',
    address: '5000 Yonge St, North York, ON M2N 7E9',
    lat: 43.7615,
    lng: -79.4111,
    status: 'Full',
    pickupStatus: 'Scheduled',
    createdDate: '2024-01-02',
    sensorEnabled: true,
    fillLevel: 95,
    batteryLevel: 72
  },
  {
    id: '3',
    binNumber: 'BIN-003',
    locationName: 'Scarborough Town Centre',
    address: '300 Borough Dr, Scarborough, ON M1P 4P5',
    lat: 43.7764,
    lng: -79.2575,
    status: 'Almost Full',
    pickupStatus: 'Not Scheduled',
    createdDate: '2024-01-03',
    sensorEnabled: false
  }
];

// Test drivers data
const testDrivers = [
  {
    id: '1',
    name: 'Mike Wilson',
    email: 'mike@hhdonations.org',
    phone: '555-1111',
    licenseNumber: 'D123456',
    hireDate: '2023-06-15',
    status: 'Active',
    assignedBins: ['BIN-001', 'BIN-002'],
    vehicleType: 'Box Truck',
    totalPickups: 150
  },
  {
    id: '2',
    name: 'Sarah Davis',
    email: 'sarah@hhdonations.org',
    phone: '555-2222',
    licenseNumber: 'D789012',
    hireDate: '2023-09-01',
    status: 'Active',
    assignedBins: ['BIN-003'],
    vehicleType: 'Van',
    totalPickups: 87
  }
];

// Test containers
const testContainers = [
  {
    id: '1',
    containerNumber: 'CONT-2024-001',
    assignedBales: ['BALE-001', 'BALE-002'],
    totalWeight: 500.5,
    destination: 'Port of Halifax',
    status: 'Warehouse',
    createdDate: '2024-08-01'
  },
  {
    id: '2',
    containerNumber: 'CONT-2024-002',
    assignedBales: [],
    totalWeight: 0,
    destination: 'Port of Montreal',
    status: 'Warehouse',
    createdDate: '2024-08-10'
  }
];

// Test bales
const testBales = [
  {
    id: '1',
    baleNumber: 'BALE-001',
    contents: 'A-Quality Clothing',
    weight: 250.25,
    status: 'Warehouse',
    createdDate: '2024-08-01'
  },
  {
    id: '2',
    baleNumber: 'BALE-002',
    contents: 'B-Quality Mixed',
    weight: 180.75,
    status: 'Warehouse',
    createdDate: '2024-08-05'
  },
  {
    id: '3',
    baleNumber: 'BALE-003',
    contents: 'Creme',
    weight: 320.50,
    status: 'Sold',
    createdDate: '2024-07-25',
    salePrice: 1282,
    paymentMethod: 'Bank Transfer'
  }
];

// Test partner applications
const testPartnerApplications = [
  {
    id: '1',
    organizationName: 'Community Care Toronto',
    contactPerson: 'Emily Chen',
    email: 'emily@communitycare.org',
    phone: '416-555-3333',
    website: 'https://communitycare.org',
    taxId: '123456789',
    address: {
      street: '200 Bay Street',
      city: 'Toronto',
      state: 'ON',
      zipCode: 'M5J 2J2'
    },
    additionalInfo: 'We serve over 500 families monthly',
    status: 'pending',
    submittedAt: '2024-08-15T10:30:00Z'
  },
  {
    id: '2',
    organizationName: 'Youth Support Network',
    contactPerson: 'David Lee',
    email: 'david@youthsupport.ca',
    phone: '416-555-4444',
    website: 'https://youthsupport.ca',
    taxId: '987654321',
    address: {
      street: '300 University Ave',
      city: 'Toronto',
      state: 'ON',
      zipCode: 'M5G 1V7'
    },
    additionalInfo: 'Focus on at-risk youth programs',
    status: 'approved',
    submittedAt: '2024-08-10T14:20:00Z',
    reviewedAt: '2024-08-12T09:15:00Z',
    reviewNotes: 'Verified 501c3 status, approved for partnership'
  }
];

// Test admin auth
const testAdminAuth = {
  email: 'admin@hhdonations.org',
  password: 'admin123',
  fullName: 'System Administrator',
  lastLogin: '2024-08-18T10:00:00Z'
};

// Save all test data to localStorage
localStorage.setItem('pickupRequests', JSON.stringify(testPickupRequests));
localStorage.setItem('binsData', JSON.stringify(testBins));
localStorage.setItem('driversData', JSON.stringify(testDrivers));
localStorage.setItem('containers', JSON.stringify(testContainers));
localStorage.setItem('bales', JSON.stringify(testBales));
localStorage.setItem('partnerApplications', JSON.stringify(testPartnerApplications));
localStorage.setItem('adminAuth', JSON.stringify(testAdminAuth));

console.log('✅ Proper test data added to localStorage!');
console.log('📊 Added:', {
  pickupRequests: testPickupRequests.length,
  bins: testBins.length,
  drivers: testDrivers.length,
  containers: testContainers.length,
  bales: testBales.length,
  partnerApplications: testPartnerApplications.length,
  adminUsers: 1
});

console.log('🔄 Now you can:');
console.log('1. Run the SQL fix in Supabase: ALTER TABLE pickup_requests ALTER COLUMN pickup_time TYPE TEXT;');
console.log('2. Clear existing data if needed: DELETE FROM pickup_requests; DELETE FROM bins; etc.');
console.log('3. Go to /admin/supabase-migration and click "Start Migration"');