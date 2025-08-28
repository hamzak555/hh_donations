// Enhanced Supabase Service with relational queries
import { supabase, TABLES } from '@/lib/supabase'
import { BinLocation } from '@/contexts/BinsContextSupabase'

export class EnhancedBinsService {
  /**
   * Get all bins with driver details using the relational connection
   * This uses a single query with a join for better performance
   */
  static async getAllBinsWithDrivers(): Promise<BinLocation[]> {
    const { data, error } = await supabase
      .from(TABLES.BINS)
      .select(`
        *,
        driver:drivers!bins_driver_id_fkey (
          id,
          name,
          email,
          phone,
          status
        )
      `)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching bins with drivers:', error)
      throw error
    }

    // Map the response to include both driver ID and name
    return data.map(bin => ({
      ...bin,
      driverId: bin.driver?.id || bin.driver_id,
      assignedDriver: bin.driver?.name || bin.assignedDriver,
      // Remove the nested driver object as we've extracted what we need
      driver: undefined
    }))
  }

  /**
   * Get bins assigned to a specific driver using the foreign key
   * More efficient than filtering all bins
   */
  static async getBinsByDriverId(driverId: string): Promise<BinLocation[]> {
    const { data, error } = await supabase
      .from(TABLES.BINS)
      .select('*')
      .eq('driver_id', driverId)
      .order('binNumber', { ascending: true })

    if (error) {
      console.error('Error fetching bins by driver:', error)
      throw error
    }

    return data
  }

  /**
   * Assign a driver to a bin using the relational connection
   */
  static async assignDriverToBin(binId: string, driverId: string | null): Promise<void> {
    // If driverId is provided, get the driver name for backward compatibility
    let driverName = null
    if (driverId) {
      const { data: driver } = await supabase
        .from(TABLES.DRIVERS)
        .select('name')
        .eq('id', driverId)
        .single()
      
      driverName = driver?.name
    }

    const { error } = await supabase
      .from(TABLES.BINS)
      .update({
        driver_id: driverId,
        assignedDriver: driverName, // Keep for backward compatibility
        updated_at: new Date().toISOString()
      })
      .eq('id', binId)

    if (error) {
      console.error('Error assigning driver to bin:', error)
      throw error
    }
  }

  /**
   * Get unassigned bins (bins without a driver)
   */
  static async getUnassignedBins(): Promise<BinLocation[]> {
    const { data, error } = await supabase
      .from(TABLES.BINS)
      .select('*')
      .is('driver_id', null)
      .order('binNumber', { ascending: true })

    if (error) {
      console.error('Error fetching unassigned bins:', error)
      throw error
    }

    return data
  }

  /**
   * Bulk assign bins to a driver
   */
  static async bulkAssignBinsToDriver(binIds: string[], driverId: string): Promise<void> {
    // Get driver name for backward compatibility
    const { data: driver } = await supabase
      .from(TABLES.DRIVERS)
      .select('name')
      .eq('id', driverId)
      .single()

    const { error } = await supabase
      .from(TABLES.BINS)
      .update({
        driver_id: driverId,
        assignedDriver: driver?.name,
        updated_at: new Date().toISOString()
      })
      .in('id', binIds)

    if (error) {
      console.error('Error bulk assigning bins:', error)
      throw error
    }
  }
}

export default EnhancedBinsService