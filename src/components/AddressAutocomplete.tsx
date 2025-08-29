import React, { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface AddressAutocompleteProps {
  value: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  onChange: (address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
  className?: string;
  required?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  className = '',
  required = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    // Initialize autocomplete - Restrict to Canada only
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'ca' }
    });

    // Add listener for place selection
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place || !place.address_components) return;

      let street = '';
      let streetNumber = '';
      let route = '';
      let city = '';
      let state = '';
      let zipCode = '';

      // Parse address components
      place.address_components.forEach((component) => {
        const types = component.types;
        
        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        }
        if (types.includes('route')) {
          route = component.long_name;
        }
        if (types.includes('locality')) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
        if (types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      });

      // Combine street number and route
      street = streetNumber ? `${streetNumber} ${route}` : route;

      onChange({
        street,
        city,
        state,
        zipCode
      });
    });

    // Cleanup
    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [onChange]);

  // Format display value
  const displayValue = value.street || '';

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        defaultValue={displayValue}
        placeholder="Start typing your address..."
        className={`pl-10 ${className}`}
        required={required}
        onChange={(e) => {
          // Allow manual editing
          if (!e.target.value) {
            onChange({
              street: '',
              city: '',
              state: '',
              zipCode: ''
            });
          }
        }}
      />
    </div>
  );
};

export default AddressAutocomplete;