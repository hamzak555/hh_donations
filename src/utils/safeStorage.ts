// Safe storage operations with network error handling
import { NetworkHandler } from './networkHandler';

export class SafeStorage {
  private static pendingWrites: Map<string, string> = new Map();
  
  /**
   * Safely get an item from localStorage with error handling
   */
  static getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return null;
    }
  }
  
  /**
   * Safely set an item in localStorage with retry logic
   */
  static async setItem(key: string, value: string): Promise<boolean> {
    // Store in pending writes immediately
    this.pendingWrites.set(key, value);
    
    try {
      // Try to write to localStorage
      await NetworkHandler.withRetry(
        async () => {
          localStorage.setItem(key, value);
          // Verify the write was successful
          const stored = localStorage.getItem(key);
          if (stored !== value) {
            throw new Error('Write verification failed');
          }
        },
        {
          maxRetries: 3,
          retryDelay: 500,
          exponentialBackoff: false,
          onRetry: (attempt) => {
            console.log(`Retrying localStorage write for "${key}" (attempt ${attempt})`);
          }
        }
      );
      
      // Remove from pending writes on success
      this.pendingWrites.delete(key);
      return true;
    } catch (error) {
      console.error(`Failed to write to localStorage for key "${key}":`, error);
      
      // Keep in pending writes for later retry
      if (!NetworkHandler.getOnlineStatus()) {
        NetworkHandler.queueForRetry(
          `storage_${key}`,
          async () => {
            const pendingValue = this.pendingWrites.get(key);
            if (pendingValue) {
              localStorage.setItem(key, pendingValue);
              this.pendingWrites.delete(key);
            }
          }
        );
      }
      
      return false;
    }
  }
  
  /**
   * Get a value from pending writes if it exists, otherwise from localStorage
   */
  static getLatestValue(key: string): string | null {
    return this.pendingWrites.get(key) || this.getItem(key);
  }
  
  /**
   * Clear all pending writes (useful for cleanup)
   */
  static clearPendingWrites(): void {
    this.pendingWrites.clear();
  }
  
  /**
   * Retry all pending writes
   */
  static async retryPendingWrites(): Promise<void> {
    const writes = Array.from(this.pendingWrites.entries());
    
    for (const [key, value] of writes) {
      await this.setItem(key, value);
    }
  }
  
  /**
   * Remove an item from localStorage safely
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      this.pendingWrites.delete(key);
    } catch (error) {
      console.error(`Error removing item from localStorage for key "${key}":`, error);
    }
  }
}

// Auto-retry pending writes when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setTimeout(() => {
      SafeStorage.retryPendingWrites();
    }, 1000);
  });
}