import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

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

// Types for database records
export interface DatabaseBin {
  id: string
  bin_number: string
  location_name: string
  address: string
  lat: number
  lng: number
  status: 'Available' | 'Unavailable' | 'Full' | 'Almost Full'
  pickup_status: 'Scheduled' | 'Not Scheduled' | 'Completed'
  last_pickup?: string
  contract_file?: string
  contract_file_name?: string
  contract_upload_date?: string
  assigned_driver?: string
  created_date?: string
  full_since?: string
  // Sensor fields
  sensor_id?: string
  container_id?: number
  fill_level?: number
  last_sensor_update?: string
  battery_level?: number
  temperature?: number
  sensor_enabled?: boolean
  created_at?: string
  updated_at?: string
}

export interface DatabaseDriver {
  id: string
  name: string
  phone: string
  email?: string
  license_number: string
  hire_date: string
  status: 'Active' | 'Inactive' | 'On Leave'
  assigned_bins: string[]
  vehicle_type?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface DatabaseContainer {
  id: string
  container_number: string
  type: 'Steel' | 'Plastic' | 'Cardboard'
  capacity: number
  current_weight: number
  location: string
  status: 'Empty' | 'Partial' | 'Full' | 'In Transit'
  last_pickup?: string
  created_at?: string
  updated_at?: string
}

export interface DatabaseBale {
  id: string
  bale_number: string
  weight: number
  grade: 'A - Excellent' | 'B - Good' | 'C - Fair'
  date_created: string
  location: string
  status: 'Created' | 'Sold' | 'Shipped'
  price_per_kg?: number
  buyer_info?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface DatabasePickupRequest {
  id: string
  requester_name: string
  phone: string
  email?: string
  pickup_address: string
  lat?: number
  lng?: number
  pickup_date: string
  pickup_time?: string
  item_description: string
  estimated_weight?: number
  status: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Picked Up'
  assigned_driver?: string
  notes?: string
  special_instructions?: string
  created_at?: string
  updated_at?: string
}

export interface DatabaseAdminUser {
  id: string
  email: string
  password_hash: string
  full_name: string
  role: 'admin' | 'manager' | 'operator'
  is_active: boolean
  last_login?: string
  created_at?: string
  updated_at?: string
}

export interface DatabasePartnerApplication {
  id: string
  organization_name: string
  contact_person: string
  email: string
  phone: string
  website?: string
  tax_id?: string
  street: string
  city: string
  state: string
  zip_code: string
  additional_info?: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  review_notes?: string
  created_at?: string
  updated_at?: string
}