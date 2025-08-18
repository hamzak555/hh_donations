interface SensoneoConfig {
  apiKey: string;
  baseUrl: string;
  apiVersion: string;
}

interface SensorMeasurement {
  customerIds?: number[];
  containerIds?: number[];
  containerCodes?: string[];
  standCodes?: string[];
  dateFrom?: string; // ISO date-time
  dateTo?: string; // ISO date-time
  lastId?: number; // Get data from this ID
}

interface MeasurementResponse {
  id: number;
  containerId: number;
  percentCalculated: number; // Fill level percentage (0-100)
  upturned?: boolean; // If container is flipped
  temperature?: number; // Air temperature
  batteryStatus?: number; // Battery voltage
  measuredAt: string; // UTC timestamp
  serverAt: string; // UTC timestamp when received
  prediction?: string; // Predicted full timestamp
  containerCode?: string;
  standCode?: string;
  sensorId?: string;
}

interface CollectionData {
  customerIds?: number[];
  containerIds?: number[];
  containerCodes?: string[];
  standCodes?: string[];
  dateFrom?: string;
  dateTo?: string;
  lastId?: number;
}

interface CollectionResponse {
  id: number;
  containerId: number;
  sensorId: string;
  customerId?: number;
  containerCode?: string;
  stand?: string;
  pickedAt: string; // Collection timestamp
  percentBefore?: number; // Fill level before pickup
  percentNow?: number; // Fill level after pickup
  eventDriven?: boolean; // Sensor-triggered event
}

class SensoneoAPI {
  private config: SensoneoConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  constructor(config: Partial<SensoneoConfig> = {}) {
    this.config = {
      apiKey: process.env.REACT_APP_SENSONEO_API_KEY || config.apiKey || '',
      baseUrl: 'https://api.sensoneo.com/sensor',
      apiVersion: '1.0',
      ...config
    };
  }

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    try {
      // Sensoneo API uses specific header format
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': `application/json; api-version=${this.config.apiVersion}`,
          'x-api-key': this.config.apiKey,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Check API key');
        }
        if (response.status === 403) {
          throw new Error('Forbidden: No access to this resource');
        }
        if (response.status === 400) {
          throw new Error('Bad Request: Check request parameters');
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Sensoneo API Error:', error);
      throw error;
    }
  }

  /**
   * Fetch latest sensor measurements for containers
   */
  async fetchMeasurements(params: Partial<SensorMeasurement> = {}): Promise<MeasurementResponse[]> {
    const cacheKey = this.getCacheKey('/v2/sensors/measurements', params);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Default to last 24 hours if no date range specified
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Format dates properly for Sensoneo API
    const formatDate = (date: Date) => {
      return date.toISOString().split('.')[0] + 'Z';
    };
    
    const requestBody = {
      customerIds: params.customerIds || [],
      containerIds: params.containerIds || [],
      containerCodes: params.containerCodes || [],
      standCodes: params.standCodes || [],
      dateFrom: params.dateFrom || formatDate(yesterday),
      dateTo: params.dateTo || formatDate(now),
      lastId: params.lastId || 0
    };

    try {
      const response = await this.makeRequest<MeasurementResponse[]>(
        '/data/measurements',
        'POST',
        requestBody
      );

      this.setCache(cacheKey, response || []);
      return response || [];
    } catch (error) {
      console.error('Failed to fetch measurements:', error);
      return [];
    }
  }

  /**
   * Fetch latest measurement for a specific container
   */
  async fetchContainerMeasurement(containerId: number): Promise<MeasurementResponse | null> {
    const measurements = await this.fetchMeasurements({
      containerIds: [containerId]
    });
    
    // Return the most recent measurement
    return measurements.length > 0 ? measurements[measurements.length - 1] : null;
  }

  /**
   * Fetch measurements for multiple containers
   */
  async fetchBulkMeasurements(containerIds: number[]): Promise<Map<number, MeasurementResponse>> {
    const measurements = await this.fetchMeasurements({
      containerIds
    });

    // Create a map of containerId to most recent measurement
    const measurementMap = new Map<number, MeasurementResponse>();
    
    measurements.forEach(measurement => {
      const existing = measurementMap.get(measurement.containerId);
      if (!existing || new Date(measurement.measuredAt) > new Date(existing.measuredAt)) {
        measurementMap.set(measurement.containerId, measurement);
      }
    });

    return measurementMap;
  }

  /**
   * Fetch collection events
   */
  async fetchCollections(params: Partial<CollectionData> = {}): Promise<CollectionResponse[]> {
    const cacheKey = this.getCacheKey('/v2/sensors/collections', params);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Default to last 7 days for collections
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const requestBody = {
      dateFrom: weekAgo.toISOString(),
      dateTo: now.toISOString(),
      ...params
    };

    try {
      const response = await this.makeRequest<CollectionResponse[]>(
        '/data/collections',
        'POST',
        requestBody
      );

      this.setCache(cacheKey, response || []);
      return response || [];
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      return [];
    }
  }

  /**
   * Test API connection with different approaches
   */
  async testConnection(): Promise<boolean> {
    const url = `${this.config.baseUrl}/data/measurements`;
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    console.log('Testing Sensoneo API connection...');
    console.log('URL:', url);
    console.log('API Key:', this.config.apiKey.substring(0, 8) + '...');
    
    // Format dates without milliseconds and timezone
    const formatDate = (date: Date) => {
      return date.toISOString().split('.')[0] + 'Z';
    };
    
    // Try different request formats - the API error suggests it wants a 'request' field
    const requestAttempts = [
      {
        name: 'Wrapped in request field',
        body: {
          request: {
            customerIds: [],
            containerIds: [],
            containerCodes: [],
            standCodes: [],
            dateFrom: yesterday.toISOString(),
            dateTo: now.toISOString(),
            lastId: 0
          }
        }
      },
      {
        name: 'Direct structure from screenshot',
        body: {
          customerIds: [],
          containerIds: [],
          containerCodes: [],
          standCodes: [],
          dateFrom: yesterday.toISOString(),
          dateTo: now.toISOString(),
          lastId: 0
        }
      },
      {
        name: 'Minimal request',
        body: {
          request: {}
        }
      }
    ];
    
    console.log('Will try', requestAttempts.length, 'different request formats...');
    
    for (let i = 0; i < requestAttempts.length; i++) {
      const attempt = requestAttempts[i];
      console.log(`\nAttempt ${i + 1}: ${attempt.name}`);
      console.log('Request body:', JSON.stringify(attempt.body, null, 2));
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': `application/json; api-version=${this.config.apiVersion}`,
            'x-api-key': this.config.apiKey,
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(attempt.body)
        });

        console.log(`Response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✓ Success with format:', attempt.name);
          console.log('API Response data:', data);
          return true;
        } else {
          const errorText = await response.text();
          console.log(`✗ Failed with ${response.status}:`, errorText);
          
          // If this is the last attempt, throw the error
          if (i === requestAttempts.length - 1) {
            throw new Error(`All ${requestAttempts.length} request formats failed. Last error: ${response.status} - ${errorText}`);
          }
        }
      } catch (error) {
        console.log(`✗ Request failed:`, error);
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          throw new Error('Cannot connect to Sensoneo API from browser due to CORS. A backend proxy is required.');
        }
        
        if (i === requestAttempts.length - 1) {
          throw error;
        }
      }
    }
    
    return false;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Convert Sensoneo fill percentage to bin status
   */
  static getBinStatusFromFillLevel(fillLevel: number): 'Available' | 'Almost Full' | 'Full' {
    if (fillLevel >= 90) return 'Full';
    if (fillLevel >= 70) return 'Almost Full';
    return 'Available';
  }

  /**
   * Format battery status for display
   */
  static formatBatteryStatus(batteryVoltage?: number): string {
    if (!batteryVoltage) return 'Unknown';
    
    // Typical lithium battery voltages
    if (batteryVoltage >= 3.7) return 'Good';
    if (batteryVoltage >= 3.4) return 'Fair';
    if (batteryVoltage >= 3.0) return 'Low';
    return 'Critical';
  }
}

// Export singleton instance for easy use
export const sensoneoApi = new SensoneoAPI();

// Export class for custom configurations
export default SensoneoAPI;
export type { 
  SensorMeasurement, 
  MeasurementResponse, 
  CollectionData, 
  CollectionResponse,
  SensoneoConfig 
};