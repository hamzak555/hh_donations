// Seed data to populate the application with production-like data
export const seedProductionData = () => {
  // Sample Drivers Data
  const drivers = [
    {
      id: 'driver-1',
      name: 'John Smith',
      email: 'john.smith@hhdonations.com',
      phone: '(555) 123-4567',
      assignedBins: ['bin-1', 'bin-2', 'bin-3'],
      status: 'Active' as const,
      totalPickups: 156
    },
    {
      id: 'driver-2',
      name: 'Maria Garcia',
      email: 'maria.garcia@hhdonations.com',
      phone: '(555) 234-5678',
      assignedBins: ['bin-4', 'bin-5'],
      status: 'Active' as const,
      totalPickups: 203
    },
    {
      id: 'driver-3',
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@hhdonations.com',
      phone: '(555) 345-6789',
      assignedBins: ['bin-6', 'bin-7', 'bin-8'],
      status: 'Active' as const,
      totalPickups: 189
    },
    {
      id: 'driver-4',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@hhdonations.com',
      phone: '(555) 456-7890',
      assignedBins: [],
      status: 'Inactive' as const,
      totalPickups: 95
    }
  ];

  // Sample Containers Data
  const containers = [
    {
      id: 'container-1',
      number: 'CONT-2024-001',
      location: 'Warehouse A - Bay 3',
      capacity: 40000,
      currentWeight: 28500,
      assignedBales: ['bale-1', 'bale-2', 'bale-3'],
      status: 'Active' as const,
      lastEmptied: new Date('2024-01-15').toISOString(),
      photos: [],
      documents: []
    },
    {
      id: 'container-2',
      number: 'CONT-2024-002',
      location: 'Warehouse B - Bay 1',
      capacity: 40000,
      currentWeight: 39800,
      assignedBales: ['bale-4', 'bale-5', 'bale-6', 'bale-7'],
      status: 'Full' as const,
      lastEmptied: new Date('2024-01-10').toISOString(),
      photos: [],
      documents: []
    },
    {
      id: 'container-3',
      number: 'CONT-2024-003',
      location: 'Port Terminal',
      capacity: 40000,
      currentWeight: 15000,
      assignedBales: ['bale-8', 'bale-9'],
      status: 'In Transit' as const,
      lastEmptied: new Date('2024-01-20').toISOString(),
      photos: [],
      documents: []
    }
  ];

  // Sample Bins Data
  const bins = [
    {
      id: 'bin-1',
      number: 'BIN-001',
      location: {
        lat: 40.7128,
        lng: -74.0060,
        address: '123 Main St, New York, NY 10001'
      },
      capacity: 1000,
      currentLevel: 75,
      status: 'Active' as const,
      lastEmptied: new Date('2024-01-18').toISOString(),
      assignedDriver: 'driver-1'
    },
    {
      id: 'bin-2',
      number: 'BIN-002',
      location: {
        lat: 40.7580,
        lng: -73.9855,
        address: '456 Broadway, New York, NY 10013'
      },
      capacity: 1000,
      currentLevel: 90,
      status: 'Full' as const,
      lastEmptied: new Date('2024-01-16').toISOString(),
      assignedDriver: 'driver-1'
    },
    {
      id: 'bin-3',
      number: 'BIN-003',
      location: {
        lat: 40.7489,
        lng: -73.9680,
        address: '789 Park Ave, New York, NY 10016'
      },
      capacity: 1500,
      currentLevel: 45,
      status: 'Active' as const,
      lastEmptied: new Date('2024-01-19').toISOString(),
      assignedDriver: 'driver-1'
    },
    {
      id: 'bin-4',
      number: 'BIN-004',
      location: {
        lat: 40.7614,
        lng: -73.9776,
        address: '321 5th Ave, New York, NY 10016'
      },
      capacity: 1000,
      currentLevel: 60,
      status: 'Active' as const,
      lastEmptied: new Date('2024-01-17').toISOString(),
      assignedDriver: 'driver-2'
    },
    {
      id: 'bin-5',
      number: 'BIN-005',
      location: {
        lat: 40.7527,
        lng: -73.9772,
        address: '654 Lexington Ave, New York, NY 10022'
      },
      capacity: 1200,
      currentLevel: 30,
      status: 'Active' as const,
      lastEmptied: new Date('2024-01-20').toISOString(),
      assignedDriver: 'driver-2'
    },
    {
      id: 'bin-6',
      number: 'BIN-006',
      location: {
        lat: 40.7411,
        lng: -73.9897,
        address: '987 6th Ave, New York, NY 10011'
      },
      capacity: 1000,
      currentLevel: 15,
      status: 'Needs Maintenance' as const,
      lastEmptied: new Date('2024-01-14').toISOString(),
      assignedDriver: 'driver-3'
    }
  ];

  // Sample Bales Data
  const bales = [
    {
      id: 'bale-1',
      baleNumber: 'BALE-2024-001',
      weight: 8500,
      material: 'Mixed Textiles',
      location: 'Warehouse A',
      dateCreated: new Date('2024-01-10').toISOString(),
      status: 'Assigned' as const,
      assignedContainer: 'container-1',
      photos: [],
      documents: []
    },
    {
      id: 'bale-2',
      baleNumber: 'BALE-2024-002',
      weight: 9200,
      material: 'Cotton',
      location: 'Warehouse A',
      dateCreated: new Date('2024-01-11').toISOString(),
      status: 'Assigned' as const,
      assignedContainer: 'container-1',
      photos: [],
      documents: []
    },
    {
      id: 'bale-3',
      baleNumber: 'BALE-2024-003',
      weight: 10800,
      material: 'Polyester Blend',
      location: 'Warehouse A',
      dateCreated: new Date('2024-01-12').toISOString(),
      status: 'Assigned' as const,
      assignedContainer: 'container-1',
      photos: [],
      documents: []
    },
    {
      id: 'bale-4',
      baleNumber: 'BALE-2024-004',
      weight: 9500,
      material: 'Mixed Textiles',
      location: 'Warehouse B',
      dateCreated: new Date('2024-01-13').toISOString(),
      status: 'Assigned' as const,
      assignedContainer: 'container-2',
      photos: [],
      documents: []
    },
    {
      id: 'bale-5',
      baleNumber: 'BALE-2024-005',
      weight: 10200,
      material: 'Wool',
      location: 'Warehouse B',
      dateCreated: new Date('2024-01-14').toISOString(),
      status: 'Assigned' as const,
      assignedContainer: 'container-2',
      photos: [],
      documents: []
    },
    {
      id: 'bale-6',
      baleNumber: 'BALE-2024-006',
      weight: 8900,
      material: 'Cotton',
      location: 'Warehouse B',
      dateCreated: new Date('2024-01-15').toISOString(),
      status: 'In Storage' as const,
      assignedContainer: '',
      photos: [],
      documents: []
    },
    {
      id: 'bale-7',
      baleNumber: 'BALE-2024-007',
      weight: 11200,
      material: 'Denim',
      location: 'Warehouse C',
      dateCreated: new Date('2024-01-16').toISOString(),
      status: 'In Storage' as const,
      assignedContainer: '',
      photos: [],
      documents: []
    }
  ];

  // Sample Pickup Requests Data
  const pickupRequests = [
    {
      id: 'pickup-1',
      name: 'Robert Wilson',
      phone: '(555) 111-2222',
      email: 'robert.w@email.com',
      address: '100 Central Park West, New York, NY 10025',
      items: '5 bags of clothes, 2 boxes of shoes',
      preferredDate: new Date('2024-01-25').toISOString(),
      preferredTime: 'Morning (9am-12pm)',
      status: 'Pending' as const,
      notes: 'Please call before arrival',
      assignedDriver: '',
      completedDate: null
    },
    {
      id: 'pickup-2',
      name: 'Lisa Chen',
      phone: '(555) 222-3333',
      email: 'lisa.chen@email.com',
      address: '250 Park Ave South, New York, NY 10003',
      items: '10 bags of clothing',
      preferredDate: new Date('2024-01-26').toISOString(),
      preferredTime: 'Afternoon (12pm-5pm)',
      status: 'Scheduled' as const,
      notes: 'Large donation - may need truck',
      assignedDriver: 'driver-1',
      completedDate: null
    },
    {
      id: 'pickup-3',
      name: 'James Brown',
      phone: '(555) 333-4444',
      email: 'jbrown@email.com',
      address: '789 Madison Ave, New York, NY 10065',
      items: '3 bags of clothes',
      preferredDate: new Date('2024-01-20').toISOString(),
      preferredTime: 'Morning (9am-12pm)',
      status: 'Completed' as const,
      notes: '',
      assignedDriver: 'driver-2',
      completedDate: new Date('2024-01-20').toISOString()
    },
    {
      id: 'pickup-4',
      name: 'Emily Davis',
      phone: '(555) 444-5555',
      email: 'emily.d@email.com',
      address: '456 Columbus Ave, New York, NY 10024',
      items: '6 bags of mixed textiles',
      preferredDate: new Date('2024-01-27').toISOString(),
      preferredTime: 'Afternoon (12pm-5pm)',
      status: 'Pending' as const,
      notes: 'Call when 10 minutes away',
      assignedDriver: '',
      completedDate: null
    },
    {
      id: 'pickup-5',
      name: 'Michael Thompson',
      phone: '(555) 555-6666',
      email: 'mthompson@email.com',
      address: '321 West End Ave, New York, NY 10023',
      items: '4 bags of clothes, 1 bag of linens',
      preferredDate: new Date('2024-01-28').toISOString(),
      preferredTime: 'Morning (9am-12pm)',
      status: 'Scheduled' as const,
      notes: 'Apartment 5B - buzz twice',
      assignedDriver: 'driver-3',
      completedDate: null
    }
  ];

  // Store all data in localStorage
  localStorage.setItem('driversData', JSON.stringify(drivers));
  localStorage.setItem('containersData', JSON.stringify(containers));
  localStorage.setItem('binsData', JSON.stringify(bins));
  localStorage.setItem('balesData', JSON.stringify(bales));
  localStorage.setItem('pickupRequestsData', JSON.stringify(pickupRequests));
  
  console.log('Production data seeded successfully!');
  console.log('Data summary:', {
    drivers: drivers.length,
    containers: containers.length,
    bins: bins.length,
    bales: bales.length,
    pickupRequests: pickupRequests.length
  });
  
  // Reload to update all contexts
  window.location.reload();
};

// Make it available globally
(window as any).seedProductionData = seedProductionData;