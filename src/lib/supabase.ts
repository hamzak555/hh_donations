import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Check if Supabase is configured
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Only create client if both URL and key are provided
// Otherwise create a dummy client that won't be used
let supabase: SupabaseClient

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url') {
  console.log('Supabase configured, initializing client...')
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('Supabase not configured. App will use localStorage only.')
  // Create a dummy client with valid URL to prevent initialization errors
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export { supabase }

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