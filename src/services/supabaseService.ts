import { supabase, TABLES, DatabaseBin, DatabaseDriver, DatabaseContainer, DatabaseBale, DatabasePickupRequest, DatabaseAdminUser, DatabasePartnerApplication } from '@/lib/supabase'
import { BinLocation } from '@/contexts/BinsContext'

// Utility functions to convert between database and app types
const convertDatabaseBinToApp = (dbBin: DatabaseBin): BinLocation => ({
  id: dbBin.id,
  binNumber: dbBin.bin_number,
  locationName: dbBin.location_name,
  address: dbBin.address,
  lat: dbBin.lat,
  lng: dbBin.lng,
  status: dbBin.status,
  pickupStatus: dbBin.pickup_status,
  lastPickup: dbBin.last_pickup,
  contractFile: dbBin.contract_file,
  contractFileName: dbBin.contract_file_name,
  contractUploadDate: dbBin.contract_upload_date,
  assignedDriver: dbBin.assigned_driver,
  createdDate: dbBin.created_date,
  fullSince: dbBin.full_since,
  sensorId: dbBin.sensor_id,
  containerId: dbBin.container_id,
  fillLevel: dbBin.fill_level,
  lastSensorUpdate: dbBin.last_sensor_update,
  batteryLevel: dbBin.battery_level,
  temperature: dbBin.temperature,
  sensorEnabled: dbBin.sensor_enabled
})

const convertAppBinToDatabase = (appBin: BinLocation): Omit<DatabaseBin, 'created_at' | 'updated_at'> => ({
  id: appBin.id,
  bin_number: appBin.binNumber,
  location_name: appBin.locationName,
  address: appBin.address,
  lat: appBin.lat,
  lng: appBin.lng,
  status: appBin.status,
  pickup_status: appBin.pickupStatus,
  last_pickup: appBin.lastPickup,
  contract_file: appBin.contractFile,
  contract_file_name: appBin.contractFileName,
  contract_upload_date: appBin.contractUploadDate,
  assigned_driver: appBin.assignedDriver,
  created_date: appBin.createdDate,
  full_since: appBin.fullSince,
  sensor_id: appBin.sensorId,
  container_id: appBin.containerId,
  fill_level: appBin.fillLevel,
  last_sensor_update: appBin.lastSensorUpdate,
  battery_level: appBin.batteryLevel,
  temperature: appBin.temperature,
  sensor_enabled: appBin.sensorEnabled
})

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
    // Convert app updates to database format
    const dbUpdates: Partial<DatabaseBin> = {}
    
    if (updates.binNumber) dbUpdates.bin_number = updates.binNumber
    if (updates.locationName) dbUpdates.location_name = updates.locationName
    if (updates.address) dbUpdates.address = updates.address
    if (updates.lat !== undefined) dbUpdates.lat = updates.lat
    if (updates.lng !== undefined) dbUpdates.lng = updates.lng
    if (updates.status) dbUpdates.status = updates.status
    if (updates.pickupStatus) dbUpdates.pickup_status = updates.pickupStatus
    if (updates.lastPickup) dbUpdates.last_pickup = updates.lastPickup
    if (updates.contractFile) dbUpdates.contract_file = updates.contractFile
    if (updates.contractFileName) dbUpdates.contract_file_name = updates.contractFileName
    if (updates.contractUploadDate) dbUpdates.contract_upload_date = updates.contractUploadDate
    if (updates.assignedDriver !== undefined) dbUpdates.assigned_driver = updates.assignedDriver
    if (updates.createdDate) dbUpdates.created_date = updates.createdDate
    if (updates.fullSince !== undefined) dbUpdates.full_since = updates.fullSince
    if (updates.sensorId !== undefined) dbUpdates.sensor_id = updates.sensorId
    if (updates.containerId !== undefined) dbUpdates.container_id = updates.containerId
    if (updates.fillLevel !== undefined) dbUpdates.fill_level = updates.fillLevel
    if (updates.lastSensorUpdate !== undefined) dbUpdates.last_sensor_update = updates.lastSensorUpdate
    if (updates.batteryLevel !== undefined) dbUpdates.battery_level = updates.batteryLevel
    if (updates.temperature !== undefined) dbUpdates.temperature = updates.temperature
    if (updates.sensorEnabled !== undefined) dbUpdates.sensor_enabled = updates.sensorEnabled

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
  static async getAllContainers() {
    const { data, error } = await supabase
      .from(TABLES.CONTAINERS)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching containers:', error)
      throw error
    }

    return data
  }

  static async createContainer(container: Omit<DatabaseContainer, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from(TABLES.CONTAINERS)
      .insert([container])
      .select()
      .single()

    if (error) {
      console.error('Error creating container:', error)
      throw error
    }

    return data
  }

  static async updateContainer(id: string, updates: Partial<DatabaseContainer>) {
    const { data, error } = await supabase
      .from(TABLES.CONTAINERS)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating container:', error)
      throw error
    }

    return data
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
  static async getAllAdminUsers() {
    const { data, error } = await supabase
      .from(TABLES.ADMIN_USERS)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching admin users:', error)
      throw error
    }

    return data
  }

  static async createAdminUser(user: Omit<DatabaseAdminUser, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from(TABLES.ADMIN_USERS)
      .insert([user])
      .select()
      .single()

    if (error) {
      console.error('Error creating admin user:', error)
      throw error
    }

    return data
  }

  static async updateAdminUser(id: string, updates: Partial<DatabaseAdminUser>) {
    const { data, error } = await supabase
      .from(TABLES.ADMIN_USERS)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating admin user:', error)
      throw error
    }

    return data
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

  static async getUserByEmail(email: string) {
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

    return data
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