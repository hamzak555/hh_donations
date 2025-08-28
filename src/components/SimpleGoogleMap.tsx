import React from 'react';
import { GoogleMap } from '@react-google-maps/api';

interface SimpleGoogleMapProps {
  mapContainerStyle: { width: string; height: string };
  center: { lat: number; lng: number };
  zoom: number;
  onLoad?: (map: any) => void;
  onUnmount?: () => void;
  options?: any;
  children?: React.ReactNode;
}

export const SimpleGoogleMap: React.FC<SimpleGoogleMapProps> = ({
  mapContainerStyle,
  center,
  zoom,
  onLoad,
  onUnmount,
  options,
  children
}) => {
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
};