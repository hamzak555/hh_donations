import React from 'react';

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
  const [AutocompleteComponent, setAutocompleteComponent] = React.useState<any>(null);

  React.useEffect(() => {
    // Check if Google Maps is available and dynamically import Autocomplete
    const loadAutocomplete = async () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        try {
          const { Autocomplete } = await import('@react-google-maps/api');
          setAutocompleteComponent(() => Autocomplete);
        } catch (err) {
          console.warn('Failed to load Autocomplete component:', err);
        }
      }
    };

    // Check immediately
    loadAutocomplete();

    // Check again after a delay (in case Google Maps is still loading)
    const timeout = setTimeout(loadAutocomplete, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // If Google Maps is not available, just render the input without autocomplete
  if (!AutocompleteComponent) {
    return children;
  }

  try {
    return (
      <AutocompleteComponent
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={options}
      >
        {children}
      </AutocompleteComponent>
    );
  } catch (error) {
    console.warn('Autocomplete component error:', error);
    // Fallback to just the input
    return children;
  }
};