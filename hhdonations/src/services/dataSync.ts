// Hybrid data sync service - uses API when available, localStorage as fallback
import { checkAPIConnection, dataService, driversAPI, containersAPI, binsAPI, balesAPI, pickupRequestsAPI } from './api';

export class HybridDataService {
  private static instance: HybridDataService;
  private useAPI: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    // Disable automatic API connection checks to prevent network instability
    // this.checkConnection();
    // setInterval(() => this.checkConnection(), 30000);
  }
  
  static getInstance(): HybridDataService {
    if (!HybridDataService.instance) {
      HybridDataService.instance = new HybridDataService();
    }
    return HybridDataService.instance;
  }
  
  private async checkConnection() {
    const wasUsingAPI = this.useAPI;
    this.useAPI = await checkAPIConnection();
    
    if (!wasUsingAPI && this.useAPI) {
      console.log('API connection established - syncing local data to server');
      await this.syncLocalToServer();
    } else if (wasUsingAPI && !this.useAPI) {
      console.log('API connection lost - falling back to localStorage');
    }
  }
  
  private async syncLocalToServer() {
    if (!this.useAPI) return;
    
    try {
      const localData = {
        drivers: JSON.parse(localStorage.getItem('driversData') || '[]'),
        containers: JSON.parse(localStorage.getItem('containersData') || '[]'),
        bins: JSON.parse(localStorage.getItem('binsData') || '[]'),
        bales: JSON.parse(localStorage.getItem('balesData') || '[]'),
        pickupRequests: JSON.parse(localStorage.getItem('pickupRequestsData') || '[]'),
      };
      
      await dataService.syncAll(localData);
      console.log('Local data synced to server successfully');
    } catch (error) {
      console.error('Failed to sync local data to server:', error);
    }
  }
  
  async saveDrivers(drivers: any[]) {
    // Always save to localStorage for offline access
    localStorage.setItem('driversData', JSON.stringify(drivers));
    
    // If API is available, sync to server
    if (this.useAPI) {
      try {
        await dataService.syncAll({ drivers });
      } catch (error) {
        console.error('Failed to sync drivers to server:', error);
      }
    }
  }
  
  async getDrivers(): Promise<any[]> {
    if (this.useAPI) {
      try {
        const drivers = await driversAPI.getAll();
        // Cache in localStorage
        localStorage.setItem('driversData', JSON.stringify(drivers));
        return drivers;
      } catch (error) {
        console.error('Failed to fetch drivers from server:', error);
      }
    }
    
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem('driversData') || '[]');
  }
  
  async saveContainers(containers: any[]) {
    localStorage.setItem('containersData', JSON.stringify(containers));
    
    if (this.useAPI) {
      try {
        await dataService.syncAll({ containers });
      } catch (error) {
        console.error('Failed to sync containers to server:', error);
      }
    }
  }
  
  async getContainers(): Promise<any[]> {
    if (this.useAPI) {
      try {
        const containers = await containersAPI.getAll();
        localStorage.setItem('containersData', JSON.stringify(containers));
        return containers;
      } catch (error) {
        console.error('Failed to fetch containers from server:', error);
      }
    }
    
    return JSON.parse(localStorage.getItem('containersData') || '[]');
  }
  
  async saveBins(bins: any[]) {
    localStorage.setItem('binsData', JSON.stringify(bins));
    
    if (this.useAPI) {
      try {
        await dataService.syncAll({ bins });
      } catch (error) {
        console.error('Failed to sync bins to server:', error);
      }
    }
  }
  
  async getBins(): Promise<any[]> {
    if (this.useAPI) {
      try {
        const bins = await binsAPI.getAll();
        localStorage.setItem('binsData', JSON.stringify(bins));
        return bins;
      } catch (error) {
        console.error('Failed to fetch bins from server:', error);
      }
    }
    
    return JSON.parse(localStorage.getItem('binsData') || '[]');
  }
  
  async saveBales(bales: any[]) {
    localStorage.setItem('balesData', JSON.stringify(bales));
    
    if (this.useAPI) {
      try {
        await dataService.syncAll({ bales });
      } catch (error) {
        console.error('Failed to sync bales to server:', error);
      }
    }
  }
  
  async getBales(): Promise<any[]> {
    if (this.useAPI) {
      try {
        const bales = await balesAPI.getAll();
        localStorage.setItem('balesData', JSON.stringify(bales));
        return bales;
      } catch (error) {
        console.error('Failed to fetch bales from server:', error);
      }
    }
    
    return JSON.parse(localStorage.getItem('balesData') || '[]');
  }
  
  async savePickupRequests(pickupRequests: any[]) {
    localStorage.setItem('pickupRequestsData', JSON.stringify(pickupRequests));
    
    if (this.useAPI) {
      try {
        await dataService.syncAll({ pickupRequests });
      } catch (error) {
        console.error('Failed to sync pickup requests to server:', error);
      }
    }
  }
  
  async getPickupRequests(): Promise<any[]> {
    if (this.useAPI) {
      try {
        const pickupRequests = await pickupRequestsAPI.getAll();
        localStorage.setItem('pickupRequestsData', JSON.stringify(pickupRequests));
        return pickupRequests;
      } catch (error) {
        console.error('Failed to fetch pickup requests from server:', error);
      }
    }
    
    return JSON.parse(localStorage.getItem('pickupRequestsData') || '[]');
  }
  
  isUsingAPI(): boolean {
    return this.useAPI;
  }
  
  startAutoSync(intervalMs: number = 60000) {
    // Disabled auto-sync to prevent network instability
    // if (this.syncInterval) {
    //   clearInterval(this.syncInterval);
    // }
    // 
    // this.syncInterval = setInterval(() => {
    //   if (this.useAPI) {
    //     this.syncLocalToServer();
    //   }
    // }, intervalMs);
  }
  
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const hybridDataService = HybridDataService.getInstance();