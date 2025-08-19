import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'dummy-url'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'dummy-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  BINS: 'bins',
  DRIVERS: 'drivers', 
  CONTAINERS: 'containers',
  BALES: 'bales',
  PICKUP_REQUESTS: 'pickup_requests',
  ADMIN_USERS: 'admin_users',
  PARTNER_APPLICATIONS: 'partner_applications'
} as const

// Types for database records - Updated for column rename
export interface DatabaseBin {
  id: string
  binNumber: string
  locationName: string
  address: string
  lat: number
  lng: number
  status: 'Available' | 'Unavailable' | 'Full' | 'Almost Full'
  contractFile?: string
  contractFileName?: string
  contractUploadDate?: string
  assignedDriver?: string
  createdDate?: string
  fullSince?: string
  // Sensor fields
  sensorId?: string
  containerId?: number
  fillLevel?: number
  lastSensorUpdate?: string
  batteryLevel?: number
  temperature?: number
  sensorEnabled?: boolean
  created_at?: string
  updated_at?: string
}

export interface DatabaseDriver {
  id: string
  name: string
  phone: string
  email?: string
  licenseNumber: string
  hireDate: string
  status: 'Active' | 'Inactive' | 'On Leave'
  assignedBins: string[]
  vehicleType?: string
  totalPickups?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface DatabaseContainer {
  id: string
  containerNumber: string
  type: 'Steel' | 'Plastic' | 'Cardboard'
  capacity: number
  currentWeight: number
  destination: string
  status: 'Warehouse' | 'Shipped' | 'In Transit' | 'Delivered'
  assignedBales?: string[]
  createdDate?: string
  shipmentDate?: string
  estimatedArrivalDate?: string
  actualArrivalDate?: string
  sealNumber?: string
  shippingLine?: string
  vesselName?: string
  bookingNumber?: string
  notes?: string
  documents?: string[]
  created_at?: string
  updated_at?: string
}

export interface DatabaseBale {
  id: string
  baleNumber: string
  weight: number
  contents: 'A-Quality' | 'B-Quality' | 'C-Quality' | 'Creme' | 'Shoes'
  createdDate: string
  location: string
  status: 'Warehouse' | 'Container' | 'Shipped' | 'Sold'
  pricePerKg?: number
  buyerInfo?: string
  soldDate?: string
  salePrice?: number
  paymentMethod?: string
  notes?: string
  notesTimeline?: any
  photos?: string[]
  containerNumber?: string
  created_at?: string
  updated_at?: string
}

export interface DatabasePickupRequest {
  id: string
  name: string
  phone: string
  email?: string
  address: string
  date: string
  time?: string
  additionalNotes?: string
  location?: any
  status: 'Pending' | 'Picked Up' | 'Cancelled'
  assignedDriver?: string
  adminNotes?: string
  submittedAt?: string
  created_at?: string
  updated_at?: string
}

export interface DatabaseAdminUser {
  id: string
  email: string
  passwordHash: string
  fullName: string
  role: 'admin' | 'manager' | 'operator'
  isActive: boolean
  lastLogin?: string
  created_at?: string
  updated_at?: string
}

export interface DatabasePartnerApplication {
  id: string
  organizationName: string
  contactPerson: string
  email: string
  phone: string
  website?: string
  taxId?: string
  street: string
  city: string
  state: string
  zipCode: string
  additionalInfo?: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewNotes?: string
  created_at?: string
  updated_at?: string
}