import React, { useEffect, useState } from 'react';
import { Marker } from '@react-google-maps/api';

interface DelayedMarkerProps {
  position: { lat: number; lng: number };
  onClick?: () => void;
  icon?: any;
  opacity?: number;
  title?: string;
  label?: any;
}

// This component delays rendering the Marker until Google Maps is fully available
export const DelayedMarker: React.FC<DelayedMarkerProps> = (props) => {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    // Check if Google Maps is fully loaded
    const checkGoogleMaps = () => {
      if (
        typeof window !== 'undefined' &&
        window.google &&
        window.google.maps &&
        window.google.maps.Marker &&
        window.google.maps.Map
      ) {
        setCanRender(true);
        return true;
      }
      return false;
    };

    // Initial check
    if (checkGoogleMaps()) return;

    // Set up interval to check
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    // Timeout after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.warn('Google Maps did not load within timeout period');
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Only render the Marker when Google Maps is available
  if (!canRender) {
    return null;
  }

  return <Marker {...props} />;
};