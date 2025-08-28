import React from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
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

  React.useEffect(() => {
    // Check if Google Maps is loaded
    if (typeof window !== 'undefined' && (!window.google || !window.google.maps)) {
      console.warn('Google Maps not available');
      setMapError(true);
    } else {
      setMapError(false);
    }
  }, []);

  if (mapError) {
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
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                The interactive map is temporarily unavailable. You can still browse the list of locations on the right.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={options}
      >
        {children}
      </GoogleMap>
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
  try {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      return <Marker {...props} />;
    }
    return null;
  } catch (error) {
    console.warn('Error rendering marker:', error);
    return null;
  }
};

// Safe InfoWindow component
export const SafeInfoWindow: React.FC<any> = (props) => {
  try {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      return <InfoWindow {...props} />;
    }
    return null;
  } catch (error) {
    console.warn('Error rendering info window:', error);
    return null;
  }
};