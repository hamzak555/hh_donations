import React, { useEffect, useState } from 'react';

interface SafeMarkerProps {
  position: { lat: number; lng: number };
  onClick?: () => void;
  icon?: any;
  opacity?: number;
  title?: string;
  label?: any;
}

export const SafeMarker: React.FC<SafeMarkerProps> = (props) => {
  const [MarkerComponent, setMarkerComponent] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 20;

    const loadMarker = async () => {
      // Wait for Google Maps to be available
      while (mounted && retryCount < maxRetries) {
        if (typeof window !== 'undefined' && 
            window.google && 
            window.google.maps && 
            window.google.maps.Marker) {
          try {
            // Import the Marker component only when Google Maps is fully loaded
            const { Marker } = await import('@react-google-maps/api');
            if (mounted) {
              setMarkerComponent(() => Marker);
              setIsReady(true);
            }
            return;
          } catch (err) {
            console.warn('Failed to import Marker component:', err);
          }
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
        retryCount++;
      }
      
      if (retryCount >= maxRetries) {
        console.warn('Google Maps Marker not available after maximum retries');
      }
    };

    loadMarker();

    return () => {
      mounted = false;
    };
  }, []);

  // Don't render anything until the Marker component is loaded
  if (!isReady || !MarkerComponent) {
    return null;
  }

  // Render the actual Marker component with all props
  return <MarkerComponent {...props} />;
};

// Export a version that doesn't import from react-google-maps at all until needed
export const UltraSafeMarker: React.FC<SafeMarkerProps> = (props) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check if Google Maps is available
    const checkGoogle = () => {
      if (typeof window !== 'undefined' && 
          window.google && 
          window.google.maps && 
          window.google.maps.Marker) {
        setShouldRender(true);
        return true;
      }
      return false;
    };

    if (checkGoogle()) return;

    // If not available, check periodically
    const interval = setInterval(() => {
      if (checkGoogle()) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!shouldRender) {
    return null;
  }

  return <SafeMarker {...props} />;
};