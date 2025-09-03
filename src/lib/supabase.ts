import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Check if Supabase is configured - trim whitespace from env vars
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim()

// Only create client if both URL and key are provided
// Otherwise create a dummy client that won't be used
let supabase: SupabaseClient
let isSupabaseConfigured = false

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url') {
  try {
    console.log('Supabase configured, initializing client...')
    console.log('URL:', supabaseUrl)
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    isSupabaseConfigured = true
    console.log('Supabase client created successfully')
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    console.warn('Falling back to localStorage only mode')
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
} else {
  console.warn('Supabase not configured. App will use localStorage only.')
  console.log('URL provided:', !!supabaseUrl, 'Key provided:', !!supabaseAnonKey)
  // Create a dummy client with valid URL to prevent initialization errors
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export { supabase, isSupabaseConfigured }

// Database table names
export const TABLES = {
  BINS: 'bins',
  DRIVERS: 'drivers', 
  CONTAINERS: 'containers',
  BALES: 'bales',
  PICKUP_REQUESTS: 'pickup_requests',
  ADMIN_USERS: 'admin_users',
  PARTNERS: 'partners' // Renamed from PARTNER_APPLICATIONS
} as const

// Types for database records - Updated for column rename
export interface DatabaseBin {
  id: string
  binNumber: string
  locationName: string
  address: string
  lat: number
  lng: number
  status: 'Available' | 'Unavailable' | 'Full' | 'Almost Full' | 'Warehouse'
  assignedDriver?: string // Keep for backward compatibility (driver name)
  driver_id?: string // Foreign key reference to drivers.id
  partner_id?: string // Foreign key reference to partners.id (renamed from partner_application_id)
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
  hasCredentials?: boolean
  password_hash?: string
  last_login?: string
  password_changed_at?: string
  assignedPickupRoutes?: string[]
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
  container_id?: string // Foreign key reference to containers.id
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
  assignedDriver?: string // Keep for backward compatibility (driver name)
  driver_id?: string // Foreign key reference to drivers.id
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
  role: 'admin'
  isActive: boolean
  lastLogin?: string
  created_at?: string
  updated_at?: string
}

export interface DatabasePartner {
  id: string
  organization_name: string
  contact_person: string
  email: string
  phone: string
  website?: string
  street: string
  city: string
  state: string
  zip_code: string
  additional_info?: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'archived'
  submitted_at: string
  reviewed_at?: string
  review_notes?: string
  assigned_bins?: string[] // JSON array of bin IDs
  documents?: any // JSON array of document objects
  partner_since?: string // New field
  is_active?: boolean // New field
  bin_collection_frequency?: string // New field
  last_collection_date?: string // New field
  total_collections?: number // New field
  notes?: string // New field
  created_at?: string
  updated_at?: string
}