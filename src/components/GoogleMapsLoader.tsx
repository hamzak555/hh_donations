import React, { useState, useEffect, ReactNode } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface GoogleMapsLoaderProps {
  children: ReactNode;
  libraries?: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[];
  fallback?: ReactNode;
}

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({
  children,
  libraries = ['places'],
  fallback
}) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Check if Google Maps is already loaded
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoading(false);
    }
  }, []);

  const handleLoadError = (error: Error) => {
    console.error('Google Maps failed to load:', error);
    setLoadError(true);
    setIsLoading(false);
  };

  const handleLoadSuccess = () => {
    setLoadError(false);
    setIsLoading(false);
  };

  const handleRetry = () => {
    setLoadError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
    // Force reload by changing key slightly
    window.location.reload();
  };

  // If no API key is configured, show a helpful message
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key') {
    return (
      <div className="p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Google Maps API key not configured</strong>
            <p className="mt-2">
              To use location features, please add your Google Maps API key to the .env file:
            </p>
            <code className="block mt-2 p-2 bg-gray-100 rounded">
              REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
            </code>
          </AlertDescription>
        </Alert>
        {fallback && <div className="mt-4">{fallback}</div>}
      </div>
    );
  }

  // If there was a load error, show error message with retry
  if (loadError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Failed to load Google Maps</strong>
            <p className="mt-2">
              The maps service is temporarily unavailable. You can still use other features of the application.
            </p>
            {retryCount < 3 && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Retry Loading Maps
              </Button>
            )}
          </AlertDescription>
        </Alert>
        {fallback && <div className="mt-4">{fallback}</div>}
      </div>
    );
  }

  // If Google Maps is already loaded globally, just render children
  if (!isLoading && window.google && window.google.maps) {
    return <>{children}</>;
  }

  // Load Google Maps
  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      onLoad={handleLoadSuccess}
      onError={handleLoadError}
      loadingElement={
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading maps...</p>
          </div>
        </div>
      }
    >
      {children}
    </LoadScript>
  );
};

// Error boundary specifically for Google Maps components
export class GoogleMapsErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Google Maps Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Map component error</strong>
              <p className="mt-2">
                There was an error loading the map. Please refresh the page to try again.
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Refresh Page
              </Button>
            </AlertDescription>
          </Alert>
          {this.props.fallback && <div className="mt-4">{this.props.fallback}</div>}
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook to check if Google Maps is available
export const useGoogleMapsAvailable = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
      }
      setIsChecking(false);
    };

    // Check immediately
    checkGoogleMaps();

    // Also check after a short delay in case it's still loading
    const timeout = setTimeout(checkGoogleMaps, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return { isAvailable, isChecking };
};