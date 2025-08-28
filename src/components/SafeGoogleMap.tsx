import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';

interface SafeGoogleMapProps {
  mapContainerStyle: { width: string; height: string };
  center: { lat: number; lng: number };
  zoom: number;
  onLoad: (map: any) => void;
  onUnmount: () => void;
  options?: any;
  children?: React.ReactNode;
}

export const SafeGoogleMap: React.FC<SafeGoogleMapProps> = ({
  mapContainerStyle,
  center,
  zoom,
  onLoad,
  onUnmount,
  options,
  children
}) => {
  // Check if Google Maps is available
  const [mapError, setMapError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [GoogleMapComponent, setGoogleMapComponent] = React.useState<any>(null);

  React.useEffect(() => {
    // Check if Google Maps is loaded and try to import the component
    const checkAndLoadMap = async () => {
      // Wait a bit for Google Maps to be fully loaded
      const maxAttempts = 10;
      let attempts = 0;
      
      const tryLoad = async () => {
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          try {
            // Dynamically import the GoogleMap component only when Google Maps is available
            const { GoogleMap } = await import('@react-google-maps/api');
            setGoogleMapComponent(() => GoogleMap);
            setMapError(false);
            setIsLoading(false);
            return true;
          } catch (err) {
            console.error('Failed to load GoogleMap component:', err);
            return false;
          }
        }
        return false;
      };

      // Try immediately
      if (await tryLoad()) return;
      
      // If not loaded, try a few more times with delays
      const intervalId = setInterval(async () => {
        attempts++;
        if (await tryLoad() || attempts >= maxAttempts) {
          clearInterval(intervalId);
          if (attempts >= maxAttempts) {
            console.warn('Google Maps not available after multiple attempts');
            setMapError(true);
            setIsLoading(false);
          }
        }
      }, 500);
      
      return () => clearInterval(intervalId);
    };

    checkAndLoadMap();
  }, []);

  // Show loading spinner while maps are loading
  if (isLoading) {
    return (
      <div style={mapContainerStyle} className="flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  // Show error only after loading fails
  if (mapError || !GoogleMapComponent) {
    // Fallback UI when Google Maps is not available
    return (
      <div style={mapContainerStyle} className="flex items-center justify-center bg-gray-100 rounded-lg">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Map Unavailable</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                The interactive map is currently unavailable. You can still search for bins using the search bar above.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    return (
      <GoogleMapComponent
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={options}
      >
        {children}
      </GoogleMapComponent>
    );
  } catch (error) {
    console.error('Error rendering Google Map:', error);
    // Fallback if GoogleMap component fails
    return (
      <div style={mapContainerStyle} className="flex items-center justify-center bg-gray-100 rounded-lg">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <CardTitle>Map Loading Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Unable to load the map. Please refresh the page to try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
};

// Safe Marker component
export const SafeMarker: React.FC<any> = (props) => {
  const [MarkerComponent, setMarkerComponent] = React.useState<any>(null);

  React.useEffect(() => {
    const loadMarker = async () => {
      const maxAttempts = 10;
      let attempts = 0;
      
      const tryLoad = async () => {
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          try {
            const { Marker } = await import('@react-google-maps/api');
            setMarkerComponent(() => Marker);
            return true;
          } catch (err) {
            console.warn('Failed to load Marker component:', err);
            return false;
          }
        }
        return false;
      };

      // Try immediately
      if (await tryLoad()) return;
      
      // If not loaded, try a few more times with delays
      const intervalId = setInterval(async () => {
        attempts++;
        if (await tryLoad() || attempts >= maxAttempts) {
          clearInterval(intervalId);
        }
      }, 500);
      
      return () => clearInterval(intervalId);
    };

    loadMarker();
  }, []);

  if (!MarkerComponent) {
    return null;
  }

  try {
    return <MarkerComponent {...props} />;
  } catch (error) {
    console.warn('Error rendering marker:', error);
    return null;
  }
};

// Safe InfoWindow component
export const SafeInfoWindow: React.FC<any> = (props) => {
  const [InfoWindowComponent, setInfoWindowComponent] = React.useState<any>(null);

  React.useEffect(() => {
    const loadInfoWindow = async () => {
      const maxAttempts = 10;
      let attempts = 0;
      
      const tryLoad = async () => {
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          try {
            const { InfoWindow } = await import('@react-google-maps/api');
            setInfoWindowComponent(() => InfoWindow);
            return true;
          } catch (err) {
            console.warn('Failed to load InfoWindow component:', err);
            return false;
          }
        }
        return false;
      };

      // Try immediately  
      if (await tryLoad()) return;
      
      // If not loaded, try a few more times with delays
      const intervalId = setInterval(async () => {
        attempts++;
        if (await tryLoad() || attempts >= maxAttempts) {
          clearInterval(intervalId);
        }
      }, 500);
      
    };

    loadInfoWindow();
  }, []);

  if (!InfoWindowComponent) {
    return null;
  }

  try {
    return <InfoWindowComponent {...props} />;
  } catch (error) {
    console.warn('Error rendering info window:', error);
    return null;
  }
};