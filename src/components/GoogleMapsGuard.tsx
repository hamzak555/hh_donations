import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * GoogleMapsGuard ensures Google Maps API is fully loaded before rendering children.
 * This prevents "google is not defined" errors in production.
 */
export const GoogleMapsGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const checkGoogleMaps = () => {
      // Check if Google Maps is fully loaded
      if (
        typeof window !== 'undefined' &&
        window.google &&
        window.google.maps &&
        window.google.maps.Map &&
        window.google.maps.Marker &&
        window.google.maps.places
      ) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkGoogleMaps()) return;

    // Set up interval to check periodically
    const maxAttempts = 20; // 10 seconds total
    const intervalId = setInterval(() => {
      setAttempts(prev => prev + 1);
      
      if (checkGoogleMaps()) {
        clearInterval(intervalId);
      } else if (attempts >= maxAttempts) {
        clearInterval(intervalId);
        setError('Google Maps failed to load. Please check your internet connection or disable ad blockers.');
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [attempts]);

  // Show error if maps failed to load
  if (error) {
    return (
      <div className="p-4">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading while waiting for maps
  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading maps...</p>
        </div>
      </div>
    );
  }

  // Render children only when maps are ready
  return <>{children}</>;
};

/**
 * Hook to check if Google Maps is available
 */
export const useGoogleMapsReady = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (
        typeof window !== 'undefined' &&
        window.google &&
        window.google.maps &&
        window.google.maps.Map &&
        window.google.maps.Marker
      ) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) return;

    const intervalId = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(intervalId);
      }
    }, 500);

    // Cleanup after 10 seconds
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  return isReady;
};