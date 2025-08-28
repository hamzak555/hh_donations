import React from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';

interface SafeAutocompleteProps {
  onLoad?: (autocomplete: any) => void;
  onPlaceChanged?: () => void;
  options?: any;
  children: React.ReactElement;
}

export const SafeAutocomplete: React.FC<SafeAutocompleteProps> = ({
  onLoad,
  onPlaceChanged,
  options,
  children
}) => {
  const [isGoogleMapsAvailable, setIsGoogleMapsAvailable] = React.useState(false);

  React.useEffect(() => {
    // Check if Google Maps is available
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setIsGoogleMapsAvailable(true);
      } else {
        setIsGoogleMapsAvailable(false);
      }
    };

    // Check immediately
    checkGoogleMaps();

    // Check again after a delay (in case it's still loading)
    const timeout = setTimeout(checkGoogleMaps, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // If Google Maps is not available, just render the input without autocomplete
  if (!isGoogleMapsAvailable) {
    return children;
  }

  try {
    return (
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={options}
      >
        {children}
      </Autocomplete>
    );
  } catch (error) {
    console.warn('Autocomplete component error:', error);
    // Fallback to just the input
    return children;
  }
};