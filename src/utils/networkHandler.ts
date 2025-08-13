import { useState, useEffect } from 'react';

// Network resilience utility to handle connection issues and retries
export class NetworkHandler {
  private static isOnline = navigator.onLine;
  private static listeners: ((online: boolean) => void)[] = [];
  private static retryQueue: Map<string, () => Promise<any>> = new Map();
  
  static initialize() {
    // Initialize network status monitoring
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      NetworkHandler.isOnline = true;
      NetworkHandler.notifyListeners(true);
      NetworkHandler.processRetryQueue();
    });
    
    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      NetworkHandler.isOnline = false;
      NetworkHandler.notifyListeners(false);
    });
  }
  
  static getOnlineStatus(): boolean {
    return this.isOnline;
  }
  
  static addListener(callback: (online: boolean) => void): () => void {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  private static notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }
  
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      exponentialBackoff?: boolean;
      onRetry?: (attempt: number) => void;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      exponentialBackoff = true,
      onRetry
    } = options;
    
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check if we're online before attempting
        if (!this.isOnline && attempt > 0) {
          throw new Error('Network is offline');
        }
        
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a network error
        const isNetworkError = 
          error.message?.includes('network') ||
          error.message?.includes('Network') ||
          error.message?.includes('fetch') ||
          error.message?.includes('timeout') ||
          error.code === 'NETWORK_ERROR' ||
          error.code === 'ETIMEDOUT' ||
          !navigator.onLine;
        
        if (!isNetworkError || attempt === maxRetries) {
          throw error;
        }
        
        if (onRetry) {
          onRetry(attempt + 1);
        }
        
        // Calculate delay with optional exponential backoff
        const delay = exponentialBackoff 
          ? retryDelay * Math.pow(2, attempt)
          : retryDelay;
        
        console.log(`Retrying operation in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
  
  static async processRetryQueue(): Promise<void> {
    if (!this.isOnline || this.retryQueue.size === 0) {
      return;
    }
    
    console.log(`Processing ${this.retryQueue.size} queued operations`);
    
    for (const [key, operation] of this.retryQueue.entries()) {
      try {
        await operation();
        this.retryQueue.delete(key);
      } catch (error) {
        console.error(`Failed to process queued operation ${key}:`, error);
      }
    }
  }
  
  static queueForRetry(key: string, operation: () => Promise<any>): void {
    this.retryQueue.set(key, operation);
    console.log(`Operation ${key} queued for retry when connection is restored`);
  }
  
  static removeFromQueue(key: string): void {
    this.retryQueue.delete(key);
  }
}

// React hook for network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(NetworkHandler.getOnlineStatus());
  
  useEffect(() => {
    const unsubscribe = NetworkHandler.addListener(setIsOnline);
    return unsubscribe;
  }, []);
  
  return isOnline;
}

// Initialize the NetworkHandler when module loads
if (typeof window !== 'undefined') {
  NetworkHandler.initialize();
}