import { supabase, TABLES, DatabaseBin, DatabaseDriver, DatabaseContainer, DatabaseBale, DatabasePickupRequest, DatabaseAdminUser, DatabasePartnerApplication } from '@/lib/supabase'
import { BinLocation } from '@/contexts/BinsContextSupabase'

// Simplified utility functions - direct mapping after column rename
const convertDatabaseBinToApp = (dbBin: DatabaseBin): BinLocation => ({
  // Direct mapping - all fields match after column rename
  ...dbBin
})

const convertAppBinToDatabase = (appBin: BinLocation): Omit<DatabaseBin, 'created_at' | 'updated_at'> => ({
  // Direct mapping - no field name conversion needed
  ...appBin
})

// Admin Users field mapping
const convertDatabaseUserToApp = (dbUser: any): DatabaseAdminUser => ({
  id: dbUser.id,
  email: dbUser.email,
  passwordHash: dbUser.password_hash || dbUser.passwordHash,
  fullName: dbUser.full_name || dbUser.fullName,
  role: dbUser.role,
  isActive: dbUser.is_active !== undefined ? dbUser.is_active : dbUser.isActive,
  lastLogin: dbUser.last_login || dbUser.lastLogin,
  created_at: dbUser.created_at,
  updated_at: dbUser.updated_at
})

const convertAppUserToDatabase = (appUser: Partial<DatabaseAdminUser>): any => {
  const dbUser: any = {}
  
  if (appUser.email !== undefined) dbUser.email = appUser.email
  if (appUser.passwordHash !== undefined) dbUser.password_hash = appUser.passwordHash
  if (appUser.fullName !== undefined) dbUser.full_name = appUser.fullName
  if (appUser.role !== undefined) dbUser.role = appUser.role
  if (appUser.isActive !== undefined) dbUser.is_active = appUser.isActive
  if (appUser.lastLogin !== undefined) dbUser.last_login = appUser.lastLogin
  
  return dbUser
}

// Container field mapping
const convertDatabaseContainerToApp = (dbContainer: any): DatabaseContainer => {
  return {
    id: dbContainer.id,
    containerNumber: dbContainer.containerNumber || dbContainer.container_number || `CNT-${dbContainer.id?.substring(0, 8) || 'UNKNOWN'}`,
    type: dbContainer.type || 'Steel',
    capacity: dbContainer.capacity || 1000,
    currentWeight: dbContainer.currentWeight || dbContainer.current_weight || 0,
    destination: dbContainer.destination || dbContainer.location || 'Not specified',
    status: dbContainer.status || 'Warehouse',
    assignedBales: dbContainer.assignedBales || dbContainer.assigned_bales || [],
    createdDate: dbContainer.createdDate || dbContainer.created_date,
    shipmentDate: dbContainer.shipmentDate || dbContainer.shipment_date,
    estimatedArrivalDate: dbContainer.estimatedArrivalDate || dbContainer.estimated_arrival_date,
    actualArrivalDate: dbContainer.actualArrivalDate || dbContainer.actual_arrival_date,
    sealNumber: dbContainer.sealNumber || dbContainer.seal_number,
    shippingLine: dbContainer.shippingLine || dbContainer.shipping_line,
    vesselName: dbContainer.vesselName || dbContainer.vessel_name,
    bookingNumber: dbContainer.bookingNumber || dbContainer.booking_number,
    notes: dbContainer.notes,
    documents: dbContainer.documents || [],
    created_at: dbContainer.created_at,
    updated_at: dbContainer.updated_at
  }
}

const convertAppContainerToDatabase = (appContainer: Partial<DatabaseContainer>): any => {
  const dbContainer: any = {}
  
  if (appContainer.containerNumber !== undefined) dbContainer.containerNumber = appContainer.containerNumber
  if (appContainer.type !== undefined) dbContainer.type = appContainer.type
  if (appContainer.capacity !== undefined) dbContainer.capacity = appContainer.capacity
  if (appContainer.currentWeight !== undefined) dbContainer.currentWeight = appContainer.currentWeight
  if (appContainer.destination !== undefined) dbContainer.location = appContainer.destination // Note: database uses 'location'
  if (appContainer.status !== undefined) dbContainer.status = appContainer.status
  if (appContainer.assignedBales !== undefined) dbContainer.assignedBales = appContainer.assignedBales
  if (appContainer.createdDate !== undefined) dbContainer.createdDate = appContainer.createdDate
  if (appContainer.shipmentDate !== undefined) dbContainer.shipmentDate = appContainer.shipmentDate
  if (appContainer.estimatedArrivalDate !== undefined) dbContainer.estimatedArrivalDate = appContainer.estimatedArrivalDate
  if (appContainer.actualArrivalDate !== undefined) dbContainer.actualArrivalDate = appContainer.actualArrivalDate
  if (appContainer.sealNumber !== undefined) dbContainer.sealNumber = appContainer.sealNumber
  if (appContainer.shippingLine !== undefined) dbContainer.shippingLine = appContainer.shippingLine
  if (appContainer.vesselName !== undefined) dbContainer.vesselName = appContainer.vesselName
  if (appContainer.bookingNumber !== undefined) dbContainer.bookingNumber = appContainer.bookingNumber
  if (appContainer.notes !== undefined) dbContainer.notes = appContainer.notes
  if (appContainer.documents !== undefined) dbContainer.documents = appContainer.documents
  
  return dbContainer
}

// Bins Service
export class BinsService {
  static async getAllBins(): Promise<BinLocation[]> {
    const { data, error } = await supabase
      .from(TABLES.BINS)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching bins:', error)
      throw error
    }

    return data.map(convertDatabaseBinToApp)
  }

  static async createBin(bin: BinLocation): Promise<BinLocation> {
    const dbBin = convertAppBinToDatabase(bin)
    
    const { data, error } = await supabase
      .from(TABLES.BINS)
      .insert([dbBin])
      .select()
      .single()

    if (error) {
      console.error('Error creating bin:', error)
      throw error
    }

    return convertDatabaseBinToApp(data)
  }

  static async updateBin(id: string, updates: Partial<BinLocation>): Promise<BinLocation> {
    // Direct mapping - no field name conversion needed after column rename
    const dbUpdates: Partial<DatabaseBin> = { ...updates }

    const { data, error } = await supabase
      .from(TABLES.BINS)
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating bin:', error)
      throw error
    }

    return convertDatabaseBinToApp(data)
  }

  static async deleteBin(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.BINS)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting bin:', error)
      throw error
    }
  }

  static async getBinById(id: string): Promise<BinLocation | null> {
    const { data, error } = await supabase
      .from(TABLES.BINS)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No rows returned
      }
      console.error('Error fetching bin:', error)
      throw error
    }

    return convertDatabaseBinToApp(data)
  }

  static async getBinsByStatus(status: BinLocation['status']): Promise<BinLocation[]> {
    const { data, error } = await supabase
      .from(TABLES.BINS)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching bins by status:', error)
      throw error
    }

    return data.map(convertDatabaseBinToApp)
  }

  static async getBinsWithSensors(): Promise<BinLocation[]> {
    const { data, error } = await supabase
      .from(TABLES.BINS)
      .select('*')
      .not('container_id', 'is', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching bins with sensors:', error)
      throw error
    }

    return data.map(convertDatabaseBinToApp)
  }
}

// Drivers Service (placeholder - expand as needed)
export class DriversService {
  static async getAllDrivers() {
    const { data, error } = await supabase
      .from(TABLES.DRIVERS)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching drivers:', error)
      throw error
    }

    return data
  }

  static async createDriver(driver: Omit<DatabaseDriver, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from(TABLES.DRIVERS)
      .insert([driver])
      .select()
      .single()

    if (error) {
      console.error('Error creating driver:', error)
      throw error
    }

    return data
  }

  static async updateDriver(id: string, updates: Partial<DatabaseDriver>) {
    const { data, error } = await supabase
      .from(TABLES.DRIVERS)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating driver:', error)
      throw error
    }

    return data
  }

  static async deleteDriver(id: string) {
    const { error } = await supabase
      .from(TABLES.DRIVERS)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting driver:', error)
      throw error
    }
  }
}

// Containers Service  
export class ContainersService {
  static async getAllContainers(): Promise<DatabaseContainer[]> {
    const { data, error } = await supabase
      .from(TABLES.CONTAINERS)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching containers:', error)
      throw error
    }

    // Convert database format to app format with field mapping
    return (data || []).map(convertDatabaseContainerToApp)
  }

  static async createContainer(container: Omit<DatabaseContainer, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseContainer> {
    // Convert app format to database format
    const dbContainer = convertAppContainerToDatabase(container)
    
    const { data, error } = await supabase
      .from(TABLES.CONTAINERS)
      .insert([dbContainer])
      .select()
      .single()

    if (error) {
      console.error('Error creating container:', error)
      throw error
    }

    return convertDatabaseContainerToApp(data)
  }

  static async updateContainer(id: string, updates: Partial<DatabaseContainer>): Promise<DatabaseContainer> {
    // Convert app format to database format
    const dbUpdates = convertAppContainerToDatabase(updates)
    
    const { data, error } = await supabase
      .from(TABLES.CONTAINERS)
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating container:', error)
      throw error
    }

    return convertDatabaseContainerToApp(data)
  }

  static async deleteContainer(id: string) {
    const { error } = await supabase
      .from(TABLES.CONTAINERS)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting container:', error)
      throw error
    }
  }
}

// Bales Service
export class BalesService {
  static async getAllBales() {
    const { data, error } = await supabase
      .from(TABLES.BALES)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching bales:', error)
      throw error
    }

    return data
  }

  static async createBale(bale: Omit<DatabaseBale, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from(TABLES.BALES)
      .insert([bale])
      .select()
      .single()

    if (error) {
      console.error('Error creating bale:', error)
      throw error
    }

    return data
  }

  static async updateBale(id: string, updates: Partial<DatabaseBale>) {
    const { data, error } = await supabase
      .from(TABLES.BALES)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating bale:', error)
      throw error
    }

    return data
  }

  static async deleteBale(id: string) {
    const { error } = await supabase
      .from(TABLES.BALES)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting bale:', error)
      throw error
    }
  }
}

// Pickup Requests Service (placeholder - expand as needed)
export class PickupRequestsService {
  static async getAllPickupRequests() {
    const { data, error } = await supabase
      .from(TABLES.PICKUP_REQUESTS)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pickup requests:', error)
      throw error
    }

    return data
  }

  static async createPickupRequest(request: Omit<DatabasePickupRequest, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from(TABLES.PICKUP_REQUESTS)
      .insert([request])
      .select()
      .single()

    if (error) {
      console.error('Error creating pickup request:', error)
      throw error
    }

    return data
  }

  static async updatePickupRequest(id: string, updates: Partial<DatabasePickupRequest>) {
    const { data, error } = await supabase
      .from(TABLES.PICKUP_REQUESTS)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating pickup request:', error)
      throw error
    }

    return data
  }

  static async deletePickupRequest(id: string) {
    const { error } = await supabase
      .from(TABLES.PICKUP_REQUESTS)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting pickup request:', error)
      throw error
    }
  }
}

// Admin Users Service
export class AdminUsersService {
  static async getAllAdminUsers(): Promise<DatabaseAdminUser[]> {
    const { data, error } = await supabase
      .from(TABLES.ADMIN_USERS)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching admin users:', error)
      throw error
    }

    // Convert snake_case database fields to camelCase
    return (data || []).map(convertDatabaseUserToApp)
  }

  static async createAdminUser(user: Omit<DatabaseAdminUser, 'id' | 'created_at' | 'updated_at'>) {
    // Convert camelCase to snake_case for database
    const dbUser = convertAppUserToDatabase(user)
    
    const { data, error } = await supabase
      .from(TABLES.ADMIN_USERS)
      .insert([dbUser])
      .select()
      .single()

    if (error) {
      console.error('Error creating admin user:', error)
      throw error
    }

    return convertDatabaseUserToApp(data)
  }

  static async updateAdminUser(id: string, updates: Partial<DatabaseAdminUser>) {
    // Convert camelCase to snake_case for database
    const dbUpdates = convertAppUserToDatabase(updates)
    
    const { data, error } = await supabase
      .from(TABLES.ADMIN_USERS)
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating admin user:', error)
      throw error
    }

    return convertDatabaseUserToApp(data)
  }

  static async deleteAdminUser(id: string) {
    const { error } = await supabase
      .from(TABLES.ADMIN_USERS)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting admin user:', error)
      throw error
    }
  }

  static async getUserByEmail(email: string): Promise<DatabaseAdminUser | null> {
    const { data, error } = await supabase
      .from(TABLES.ADMIN_USERS)
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by email:', error)
      throw error
    }

    return data ? convertDatabaseUserToApp(data) : null
  }
}

// Partner Applications Service
export class PartnerApplicationsService {
  static async getAllPartnerApplications() {
    const { data, error } = await supabase
      .from(TABLES.PARTNER_APPLICATIONS)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching partner applications:', error)
      throw error
    }

    return data
  }

  static async createPartnerApplication(application: Omit<DatabasePartnerApplication, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from(TABLES.PARTNER_APPLICATIONS)
      .insert([application])
      .select()
      .single()

    if (error) {
      console.error('Error creating partner application:', error)
      throw error
    }

    return data
  }

  static async updatePartnerApplication(id: string, updates: Partial<DatabasePartnerApplication>) {
    const { data, error } = await supabase
      .from(TABLES.PARTNER_APPLICATIONS)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating partner application:', error)
      throw error
    }

    return data
  }

  static async deletePartnerApplication(id: string) {
    const { error } = await supabase
      .from(TABLES.PARTNER_APPLICATIONS)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting partner application:', error)
      throw error
    }
  }
}

// Export a general service class
export class SupabaseService {
  static bins = BinsService
  static drivers = DriversService
  static containers = ContainersService
  static bales = BalesService
  static pickupRequests = PickupRequestsService
  static adminUsers = AdminUsersService
  static partnerApplications = PartnerApplicationsService
}

// Export individual services and create default export instance
export const supabaseService = {
  getBins: () => BinsService.getAllBins(),
  addBin: (bin: any) => BinsService.createBin(bin),
  updateBin: (id: string, updates: any) => BinsService.updateBin(id, updates),
  deleteBin: (id: string) => BinsService.deleteBin(id),
  
  getDrivers: () => DriversService.getAllDrivers(),
  addDriver: (driver: any) => DriversService.createDriver(driver),
  updateDriver: (id: string, updates: any) => DriversService.updateDriver(id, updates),
  deleteDriver: (id: string) => DriversService.deleteDriver(id),
  
  getContainers: () => ContainersService.getAllContainers(),
  addContainer: (container: any) => ContainersService.createContainer(container),
  updateContainer: (id: string, updates: any) => ContainersService.updateContainer(id, updates),
  deleteContainer: (id: string) => ContainersService.deleteContainer(id),
  
  getBales: () => BalesService.getAllBales(),
  addBale: (bale: any) => BalesService.createBale(bale),
  updateBale: (id: string, updates: any) => BalesService.updateBale(id, updates),
  deleteBale: (id: string) => BalesService.deleteBale(id),
  
  getPickupRequests: () => PickupRequestsService.getAllPickupRequests(),
  addPickupRequest: (request: any) => PickupRequestsService.createPickupRequest(request),
  updatePickupRequest: (id: string, updates: any) => PickupRequestsService.updatePickupRequest(id, updates),
  deletePickupRequest: (id: string) => PickupRequestsService.deletePickupRequest(id)
};