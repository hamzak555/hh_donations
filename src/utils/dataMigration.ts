import { SupabaseService } from '@/services/supabaseService'
import { BinLocation } from '@/contexts/BinsContext'

/**
 * Data Migration Utilities
 * These functions help migrate existing localStorage data to Supabase
 */

export class DataMigration {
  /**
   * Check if a string is a valid UUID
   */
  static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  /**
   * Generate a deterministic UUID from a string (for consistent migration)
   */
  static generateUUIDFromString(str: string): string {
    // Generate a consistent UUID based on the input string
    // This ensures the same ID always generates the same UUID
    const hash = str.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0)
    }, 0)
    
    const hex = Math.abs(hash).toString(16).padStart(12, '0')
    return `00000000-0000-4000-8000-${hex.slice(0, 12)}`
  }

  /**
   * Migrate bins from localStorage to Supabase
   */
  static async migrateBinsToSupabase(): Promise<void> {
    try {
      console.log('🚀 Starting bins migration to Supabase...')
      
      // Debug localStorage contents
      const storedBins = localStorage.getItem('binsData')
      console.log('📦 Raw bins data from localStorage:', storedBins ? 'Found data' : 'NULL/EMPTY')
      
      if (!storedBins) {
        console.log('⚠️ No bins found in localStorage with key "binsData"')
        console.log('🔍 All localStorage keys:', Object.keys(localStorage))
        return
      }

      const localBins: BinLocation[] = JSON.parse(storedBins)
      console.log(`📊 Found ${localBins.length} bins in localStorage`)
      console.log('📋 Sample bin data:', localBins[0])

      // Check if bins already exist in Supabase
      console.log('🔍 Checking for existing bins in Supabase...')
      const existingBins = await SupabaseService.bins.getAllBins()
      console.log(`📊 Found ${existingBins.length} existing bins in Supabase`)
      
      if (existingBins.length > 0) {
        console.log(`⚠️ ${existingBins.length} bins already exist in Supabase. Skipping migration.`)
        return
      }

      // Migrate each bin
      console.log(`🚀 Starting migration of ${localBins.length} bins...`)
      let successCount = 0
      let errorCount = 0
      
      for (let i = 0; i < localBins.length; i++) {
        const bin = localBins[i]
        console.log(`📤 Migrating bin ${i + 1}/${localBins.length}: ${bin.binNumber}`)
        console.log('📋 Bin data:', JSON.stringify(bin, null, 2))
        
        try {
          // Convert ID to UUID if needed
          const binToMigrate = {
            ...bin,
            id: this.isValidUUID(bin.id) ? bin.id : this.generateUUIDFromString(bin.id)
          }
          
          const result = await SupabaseService.bins.createBin(binToMigrate)
          console.log(`✅ Successfully migrated ${bin.binNumber}`, result)
          successCount++
        } catch (error) {
          console.error(`❌ Failed to migrate ${bin.binNumber}:`, error)
          console.error('📋 Error details:', error.message, error.stack)
          errorCount++
        }
      }
      
      console.log(`📊 Migration summary: ${successCount} success, ${errorCount} errors`)

      console.log('Bins migration completed!')
      
    } catch (error) {
      console.error('Error during bins migration:', error)
      throw error
    }
  }

  /**
   * Migrate drivers from localStorage to Supabase
   */
  static async migrateDriversToSupabase(): Promise<void> {
    try {
      console.log('Starting drivers migration to Supabase...')
      
      // Get existing drivers from localStorage
      const storedDrivers = localStorage.getItem('driversData')
      if (!storedDrivers) {
        console.log('No drivers found in localStorage')
        return
      }

      const localDrivers = JSON.parse(storedDrivers)
      console.log(`Found ${localDrivers.length} drivers in localStorage`)

      // Check if drivers already exist in Supabase
      const existingDrivers = await SupabaseService.drivers.getAllDrivers()
      if (existingDrivers.length > 0) {
        console.log(`${existingDrivers.length} drivers already exist in Supabase. Skipping migration.`)
        return
      }

      // Migrate each driver
      for (let i = 0; i < localDrivers.length; i++) {
        const driver = localDrivers[i]
        console.log(`Migrating driver ${i + 1}/${localDrivers.length}: ${driver.name}`)
        
        try {
          // Convert driver format to match database schema
          const dbDriver = {
            id: this.isValidUUID(driver.id) ? driver.id : this.generateUUIDFromString(driver.id),
            name: driver.name,
            phone: driver.phone,
            email: driver.email,
            license_number: driver.licenseNumber || `LIC-${driver.id}`,
            hire_date: driver.hireDate || new Date().toISOString().split('T')[0],
            status: driver.status,
            assigned_bins: driver.assignedBins || [],
            vehicle_type: driver.vehicleType,
            notes: driver.notes
          }
          
          await SupabaseService.drivers.createDriver(dbDriver)
          console.log(`✓ Successfully migrated ${driver.name}`)
        } catch (error) {
          console.error(`✗ Failed to migrate ${driver.name}:`, error)
        }
      }

      console.log('Drivers migration completed!')
      
    } catch (error) {
      console.error('Error during drivers migration:', error)
      throw error
    }
  }

  /**
   * Migrate pickup requests from localStorage to Supabase
   */
  static async migratePickupRequestsToSupabase(): Promise<void> {
    try {
      console.log('Starting pickup requests migration to Supabase...')
      
      // Get existing pickup requests from localStorage
      const storedRequests = localStorage.getItem('pickupRequests')
      if (!storedRequests) {
        console.log('No pickup requests found in localStorage')
        return
      }

      const localRequests = JSON.parse(storedRequests)
      console.log(`Found ${localRequests.length} pickup requests in localStorage`)

      // Check if pickup requests already exist in Supabase
      const existingRequests = await SupabaseService.pickupRequests.getAllPickupRequests()
      if (existingRequests.length > 0) {
        console.log(`${existingRequests.length} pickup requests already exist in Supabase. Skipping migration.`)
        return
      }

      // Migrate each pickup request
      let successCount = 0
      let errorCount = 0
      
      for (let i = 0; i < localRequests.length; i++) {
        const request = localRequests[i]
        
        // Debug log to see the actual structure
        console.log(`📋 Request ${i + 1} data:`, JSON.stringify(request, null, 2))
        
        // Handle different field name variations
        const requesterName = request.requesterName || request.name || 'Unknown'
        const address = request.pickupAddress || request.address || 'Unknown'
        const date = request.pickupDate || request.date || new Date().toISOString().split('T')[0]
        
        // Handle time field - convert "9:00 AM - 4:00 PM" to just store as text
        // or extract start time if needed
        let timeValue = request.pickupTime || request.time || null
        if (timeValue && timeValue.includes(' - ')) {
          // For time ranges like "9:00 AM - 4:00 PM", just store as text
          // The database schema should use TEXT type for pickup_time instead of TIME
          console.log(`⚠️ Time range detected: "${timeValue}" - storing as text`)
        }
        
        // Extract lat/lng from nested location object if present
        let lat = request.lat || null
        let lng = request.lng || null
        
        if (!lat && !lng && request.location) {
          // Check for nested location object
          lat = request.location.lat || null
          lng = request.location.lng || null
          console.log(`📍 Extracted coordinates from location object: lat=${lat}, lng=${lng}`)
        }
        
        const description = request.itemDescription || request.additionalNotes || request.description || 'No description'
        
        console.log(`Migrating pickup request ${i + 1}/${localRequests.length}: ${requesterName}`)
        
        try {
          // Convert request format to match database schema
          const dbRequest = {
            id: this.isValidUUID(request.id) ? request.id : this.generateUUIDFromString(request.id || `pickup-${i}`),
            requester_name: requesterName,
            phone: request.phone || 'Unknown',
            email: request.email || null,
            pickup_address: address,
            lat: lat,
            lng: lng,
            pickup_date: date,
            pickup_time: timeValue, // This will be TEXT in database, not TIME
            item_description: description,
            estimated_weight: request.estimatedWeight || null,
            status: request.status || 'Pending',
            assigned_driver: request.assignedDriver || null,
            notes: request.notes || null,
            special_instructions: request.specialInstructions || null
          }
          
          console.log(`📤 Sending to Supabase:`, JSON.stringify(dbRequest, null, 2))
          
          await SupabaseService.pickupRequests.createPickupRequest(dbRequest)
          console.log(`✓ Successfully migrated pickup request for ${requesterName}`)
          successCount++
        } catch (error) {
          console.error(`✗ Failed to migrate pickup request for ${requesterName}:`, error)
          console.error('📋 Error details:', error.message)
          errorCount++
        }
      }

      console.log(`📊 Pickup requests migration summary: ${successCount} success, ${errorCount} errors`)
      console.log('Pickup requests migration completed!')
      
    } catch (error) {
      console.error('Error during pickup requests migration:', error)
      throw error
    }
  }

  /**
   * Migrate containers from localStorage to Supabase
   */
  static async migrateContainersToSupabase(): Promise<void> {
    try {
      console.log('Starting containers migration to Supabase...')
      
      // Get existing containers from localStorage
      const storedContainers = localStorage.getItem('containers')
      if (!storedContainers) {
        console.log('No containers found in localStorage')
        return
      }

      const localContainers = JSON.parse(storedContainers)
      console.log(`Found ${localContainers.length} containers in localStorage`)

      // Check if containers already exist in Supabase
      const existingContainers = await SupabaseService.containers.getAllContainers()
      if (existingContainers.length > 0) {
        console.log(`${existingContainers.length} containers already exist in Supabase. Skipping migration.`)
        return
      }

      // Migrate each container
      for (let i = 0; i < localContainers.length; i++) {
        const container = localContainers[i]
        console.log(`Migrating container ${i + 1}/${localContainers.length}: ${container.containerNumber}`)
        
        try {
          // Convert container format to match database schema
          const dbContainer = {
            id: this.isValidUUID(container.id) ? container.id : this.generateUUIDFromString(container.id),
            container_number: container.containerNumber,
            type: 'Steel' as const, // Default type since not in original schema
            capacity: 1000, // Default capacity
            current_weight: container.totalWeight || 0,
            location: container.destination || 'Unknown',
            status: container.status === 'Warehouse' ? 'Empty' as const : 
                   container.status === 'Shipped' ? 'In Transit' as const : 'Empty' as const,
            last_pickup: container.shipmentDate
          }
          
          await SupabaseService.containers.createContainer(dbContainer)
          console.log(`✓ Successfully migrated container ${container.containerNumber}`)
        } catch (error) {
          console.error(`✗ Failed to migrate container ${container.containerNumber}:`, error)
        }
      }

      console.log('Containers migration completed!')
      
    } catch (error) {
      console.error('Error during containers migration:', error)
      throw error
    }
  }

  /**
   * Migrate bales from localStorage to Supabase
   */
  static async migrateBalsToSupabase(): Promise<void> {
    try {
      console.log('Starting bales migration to Supabase...')
      
      // Get existing bales from localStorage
      const storedBales = localStorage.getItem('bales')
      if (!storedBales) {
        console.log('No bales found in localStorage')
        return
      }

      const localBales = JSON.parse(storedBales)
      console.log(`Found ${localBales.length} bales in localStorage`)

      // Check if bales already exist in Supabase
      const existingBales = await SupabaseService.bales.getAllBales()
      if (existingBales.length > 0) {
        console.log(`${existingBales.length} bales already exist in Supabase. Skipping migration.`)
        return
      }

      // Migrate each bale
      for (let i = 0; i < localBales.length; i++) {
        const bale = localBales[i]
        console.log(`Migrating bale ${i + 1}/${localBales.length}: ${bale.baleNumber}`)
        
        try {
          // Convert bale format to match database schema
          const dbBale = {
            id: this.isValidUUID(bale.id) ? bale.id : this.generateUUIDFromString(bale.id),
            bale_number: bale.baleNumber,
            weight: bale.weight,
            grade: this.mapBaleQualityToGrade(bale.contents),
            date_created: bale.createdDate,
            location: 'Warehouse', // Default location
            status: this.mapBaleStatusToDBStatus(bale.status),
            price_per_kg: bale.salePrice ? bale.salePrice / bale.weight : undefined,
            buyer_info: bale.paymentMethod ? `Payment: ${bale.paymentMethod}` : undefined,
            notes: bale.notes
          }
          
          await SupabaseService.bales.createBale(dbBale)
          console.log(`✓ Successfully migrated bale ${bale.baleNumber}`)
        } catch (error) {
          console.error(`✗ Failed to migrate bale ${bale.baleNumber}:`, error)
        }
      }

      console.log('Bales migration completed!')
      
    } catch (error) {
      console.error('Error during bales migration:', error)
      throw error
    }
  }

  /**
   * Helper function to map bale quality to database grade
   */
  static mapBaleQualityToGrade(quality: string): 'A - Excellent' | 'B - Good' | 'C - Fair' {
    if (quality.includes('A-Quality') || quality === 'Creme') return 'A - Excellent'
    if (quality.includes('B-Quality')) return 'B - Good'
    return 'C - Fair'
  }

  /**
   * Helper function to map bale status
   */
  static mapBaleStatusToDBStatus(status: string): 'Created' | 'Sold' | 'Shipped' {
    if (status === 'Sold') return 'Sold'
    if (status === 'Shipped' || status === 'Container') return 'Shipped'
    return 'Created'
  }

  /**
   * Migrate admin users from localStorage to Supabase
   */
  static async migrateAdminUsersToSupabase(): Promise<void> {
    try {
      console.log('Starting admin users migration to Supabase...')
      
      // Get existing admin auth from localStorage
      const storedAuth = localStorage.getItem('adminAuth')
      if (!storedAuth) {
        console.log('No admin users found in localStorage')
        return
      }

      // Parse admin auth data
      const adminAuth = JSON.parse(storedAuth)
      console.log(`Found admin user in localStorage: ${adminAuth.email || 'admin'}`)

      // Check if admin users already exist in Supabase
      const existingUsers = await SupabaseService.adminUsers.getAllAdminUsers()
      if (existingUsers.length > 0) {
        console.log(`${existingUsers.length} admin users already exist in Supabase. Skipping migration.`)
        return
      }

      try {
        // Create admin user based on localStorage data
        const adminUser = {
          email: adminAuth.email || 'admin@hhdonations.org',
          password_hash: adminAuth.password ? `hashed_${adminAuth.password}` : 'hashed_admin123',
          full_name: adminAuth.fullName || adminAuth.name || 'System Administrator',
          role: 'admin' as const,
          is_active: true,
          last_login: adminAuth.lastLogin || null
        }
        
        await SupabaseService.adminUsers.createAdminUser(adminUser)
        console.log(`✓ Successfully migrated admin user: ${adminUser.email}`)
      } catch (error) {
        console.error(`✗ Failed to migrate admin user:`, error)
      }

      console.log('Admin users migration completed!')
      
    } catch (error) {
      console.error('Error during admin users migration:', error)
      throw error
    }
  }

  /**
   * Migrate partner applications from localStorage to Supabase
   */
  static async migratePartnerApplicationsToSupabase(): Promise<void> {
    try {
      console.log('Starting partner applications migration to Supabase...')
      
      // Get existing partner applications from localStorage
      const storedApplications = localStorage.getItem('partnerApplications')
      if (!storedApplications) {
        console.log('No partner applications found in localStorage')
        return
      }

      const localApplications = JSON.parse(storedApplications)
      console.log(`Found ${localApplications.length} partner applications in localStorage`)

      // Check if partner applications already exist in Supabase
      const existingApplications = await SupabaseService.partnerApplications.getAllPartnerApplications()
      if (existingApplications.length > 0) {
        console.log(`${existingApplications.length} partner applications already exist in Supabase. Skipping migration.`)
        return
      }

      // Migrate each partner application
      for (let i = 0; i < localApplications.length; i++) {
        const application = localApplications[i]
        console.log(`Migrating partner application ${i + 1}/${localApplications.length}: ${application.organizationName}`)
        
        try {
          // Convert application format to match database schema
          const dbApplication = {
            id: this.isValidUUID(application.id) ? application.id : this.generateUUIDFromString(application.id),
            organization_name: application.organizationName,
            contact_person: application.contactPerson,
            email: application.email,
            phone: application.phone,
            website: application.website,
            tax_id: application.taxId,
            street: application.address.street,
            city: application.address.city,
            state: application.address.state,
            zip_code: application.address.zipCode,
            additional_info: application.additionalInfo,
            status: application.status,
            submitted_at: application.submittedAt,
            reviewed_at: application.reviewedAt,
            review_notes: application.reviewNotes
          }
          
          await SupabaseService.partnerApplications.createPartnerApplication(dbApplication)
          console.log(`✓ Successfully migrated partner application for ${application.organizationName}`)
        } catch (error) {
          console.error(`✗ Failed to migrate partner application for ${application.organizationName}:`, error)
        }
      }

      console.log('Partner applications migration completed!')
      
    } catch (error) {
      console.error('Error during partner applications migration:', error)
      throw error
    }
  }

  /**
   * Run complete migration of all data
   */
  static async migrateAllData(): Promise<void> {
    console.log('🚀 Starting complete data migration to Supabase...')
    
    try {
      await this.migrateBinsToSupabase()
      await this.migrateDriversToSupabase()
      await this.migratePickupRequestsToSupabase()
      await this.migrateContainersToSupabase()
      await this.migrateBalsToSupabase()
      await this.migratePartnerApplicationsToSupabase()
      await this.migrateAdminUsersToSupabase()
      
      console.log('✅ Complete data migration successful!')
      console.log('💡 You can now disable localStorage and use Supabase exclusively')
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      throw error
    }
  }

  /**
   * Create backup of localStorage data before migration
   */
  static createLocalStorageBackup(): string {
    const backup = {
      bins: localStorage.getItem('binsData'),
      drivers: localStorage.getItem('driversData'),
      containers: localStorage.getItem('containers'),
      bales: localStorage.getItem('bales'),
      pickupRequests: localStorage.getItem('pickupRequests'),
      partnerApplications: localStorage.getItem('partnerApplications'),
      adminAuth: localStorage.getItem('adminAuth'),
      timestamp: new Date().toISOString()
    }
    
    const backupString = JSON.stringify(backup, null, 2)
    console.log('📦 LocalStorage backup created:', backupString.length, 'characters')
    
    return backupString
  }

  /**
   * Check Supabase connection and existing data
   */
  static async testSupabaseConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Supabase connection...')
      
      // Test connection and check existing data in all tables
      const results = await Promise.all([
        SupabaseService.bins.getAllBins().catch(e => ({ error: e.message })),
        SupabaseService.drivers.getAllDrivers().catch(e => ({ error: e.message })),
        SupabaseService.pickupRequests.getAllPickupRequests().catch(e => ({ error: e.message })),
        SupabaseService.containers.getAllContainers().catch(e => ({ error: e.message })),
        SupabaseService.bales.getAllBales().catch(e => ({ error: e.message })),
        SupabaseService.partnerApplications.getAllPartnerApplications().catch(e => ({ error: e.message })),
        SupabaseService.adminUsers.getAllAdminUsers().catch(e => ({ error: e.message }))
      ])

      console.log('📊 Existing data in Supabase:')
      console.log('Bins:', results[0]?.length || results[0]?.error || 0)
      console.log('Drivers:', results[1]?.length || results[1]?.error || 0) 
      console.log('Pickup Requests:', results[2]?.length || results[2]?.error || 0)
      console.log('Containers:', results[3]?.length || results[3]?.error || 0)
      console.log('Bales:', results[4]?.length || results[4]?.error || 0)
      console.log('Partner Applications:', results[5]?.length || results[5]?.error || 0)
      console.log('Admin Users:', results[6]?.length || results[6]?.error || 0)
      
      // Check if any queries failed
      const hasErrors = results.some(result => result?.error)
      if (hasErrors) {
        console.error('❌ Some database queries failed - check table creation')
        return false
      }
      
      console.log('✅ Supabase connection successful!')
      return true
      
    } catch (error) {
      console.error('❌ Supabase connection failed:', error)
      return false
    }
  }

  /**
   * Clear all Supabase tables for testing (DANGEROUS)
   */
  static async clearAllSupabaseData(): Promise<void> {
    try {
      console.log('🔥 DANGER: Clearing all Supabase data...')
      
      // Note: This would require implementing delete all methods
      console.log('⚠️ Manual deletion required - go to Supabase SQL editor and run:')
      console.log('DELETE FROM bins; DELETE FROM drivers; DELETE FROM pickup_requests; DELETE FROM containers; DELETE FROM bales; DELETE FROM partner_applications;')
      
    } catch (error) {
      console.error('❌ Error clearing data:', error)
    }
  }

  /**
   * Debug localStorage data
   */
  static debugLocalStorageData(): void {
    console.log('=== DEBUGGING LOCALSTORAGE DATA ===')
    
    const keys = [
      'binsData',
      'driversData', 
      'pickupRequests',
      'containers',
      'bales',
      'partnerApplications',
      'adminAuth'
    ]

    keys.forEach(key => {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          console.log(`${key}:`, {
            exists: true,
            length: Array.isArray(parsed) ? parsed.length : 'Not an array',
            data: parsed
          })
        } catch (e) {
          console.log(`${key}:`, {
            exists: true,
            raw: data,
            parseError: e.message
          })
        }
      } else {
        console.log(`${key}:`, { exists: false })
      }
    })

    console.log('=== ALL LOCALSTORAGE KEYS ===')
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key)
      console.log(`${key}:`, value?.substring(0, 200) + (value && value.length > 200 ? '...' : ''))
    }
  }
}