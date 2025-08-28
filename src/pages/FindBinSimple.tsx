import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Navigation, Search, ExternalLink, AlertCircle } from 'lucide-react';
import { useBins, BinLocation } from '@/contexts/BinsContextSupabase';
import SEO from '@/components/SEO';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 43.6532,
  lng: -79.3832
};

const libraries: ("places")[] = ['places'];

const FindBinSimple = () => {
  const [selectedBin, setSelectedBin] = useState<BinLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyBins, setNearbyBins] = useState<BinLocation[]>([]);
  const [map, setMap] = useState<any>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [locationError, setLocationError] = useState<string>('');
  
  const { bins } = useBins();

  const center = userLocation || defaultCenter;

  const onLoad = useCallback((map: any) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  };

  useEffect(() => {
    if (userLocation) {
      const binsWithDistance = bins.map(bin => ({
        ...bin,
        distance: calculateDistance(userLocation.lat, userLocation.lng, bin.lat, bin.lng)
      }));
      binsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setNearbyBins(binsWithDistance);
    } else {
      setNearbyBins(bins);
    }
  }, [userLocation, bins]);

  const getUserLocation = () => {
    setLocationError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          if (map) {
            map.panTo(newLocation);
            map.setZoom(14);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  };

  const onAutocompleteLoad = (autocompleteInstance: any) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setUserLocation(newLocation);
        if (map) {
          map.panTo(newLocation);
          map.setZoom(14);
        }
        if (place.formatted_address) {
          setSearchQuery(place.formatted_address);
        }
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Available': return 'text-green-600';
      case 'Almost Full': return 'text-yellow-600';
      case 'Full': return 'text-red-600';
      case 'Unavailable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      <SEO 
        title="Find Donation Bins Near You"
        description="Locate H&H Donations clothing bins in your area."
        keywords="donation bins near me, clothing donation locations"
        url="/find-bin"
      />
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
        libraries={libraries}
      >
        <div className="flex flex-col lg:h-screen">
          <div className="px-8 pt-10 pb-6">
            <h1 className="text-3xl font-bold">Find a Donation Bin</h1>
          </div>

          <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-6 px-4 lg:px-8 pb-6 lg:overflow-hidden">
            <div className="lg:col-span-2 h-[500px] lg:h-full flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <Autocomplete
                    onLoad={onAutocompleteLoad}
                    onPlaceChanged={onPlaceChanged}
                    options={{
                      componentRestrictions: { country: 'ca' },
                      fields: ['formatted_address', 'geometry']
                    }}
                  >
                    <Input
                      type="text"
                      placeholder="Enter address or postal code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full h-10"
                    />
                  </Autocomplete>
                </div>
                <Button 
                  variant="outline" 
                  onClick={getUserLocation}
                  className="w-full h-10"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Use My Location
                </Button>
              </div>
              
              {locationError && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {locationError}
                  </AlertDescription>
                </Alert>
              )}
              
              <Card className="flex-1">
                <CardContent className="p-0 h-full">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={12}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                  >
                    {userLocation && (
                      <Marker
                        position={userLocation}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: '#4285F4',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 3,
                        }}
                        title="Your Location"
                      />
                    )}

                    {bins.map((bin) => (
                      <Marker
                        key={bin.id}
                        position={{ lat: bin.lat, lng: bin.lng }}
                        onClick={() => setSelectedBin(bin)}
                        icon={{
                          url: '/images/hh map pin icon.png',
                          scaledSize: new window.google.maps.Size(30, 30),
                          origin: new window.google.maps.Point(0, 0),
                          anchor: new window.google.maps.Point(15, 30)
                        }}
                        opacity={bin.status === 'Unavailable' ? 0.4 : 1}
                      />
                    ))}

                    {selectedBin && (
                      <InfoWindow
                        position={{ lat: selectedBin.lat, lng: selectedBin.lng }}
                        onCloseClick={() => setSelectedBin(null)}
                        options={{
                          pixelOffset: new window.google.maps.Size(0, -35)
                        }}
                      >
                        <div className="p-2">
                          <h3 className="font-semibold">{selectedBin.locationName}</h3>
                          <p className="text-sm text-gray-600">{selectedBin.address}</p>
                          <p className={`text-sm font-medium ${getStatusColor(selectedBin.status)}`}>
                            Status: {selectedBin.status}
                          </p>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 h-[500px] lg:h-full overflow-hidden">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5" />
                    Nearby Bins ({nearbyBins.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 px-4 pb-6">
                  <ScrollArea className="h-full">
                    <div className="space-y-3 pr-4 pl-1 py-2">
                      {nearbyBins.map((bin) => (
                        <div 
                          key={bin.id}
                          className={`p-4 border rounded-lg transition-all duration-300 ${
                            selectedBin?.id === bin.id 
                              ? 'bg-green-50 border-green-600 shadow-md ring-2 ring-green-200' 
                              : 'hover:bg-gray-50 border-gray-200'
                          }`}
                          onClick={() => {
                            setSelectedBin(bin);
                            if (map) {
                              map.panTo({ lat: bin.lat, lng: bin.lng });
                              map.setZoom(15);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start cursor-pointer">
                            <div className="flex-1">
                              <h4 className="font-semibold text-base">
                                {bin.locationName}
                              </h4>
                              <p className="text-sm mt-1 text-gray-500">
                                {bin.address}
                              </p>
                              <p className={`text-sm font-medium ${getStatusColor(bin.status)} mt-2`}>
                                {bin.status}
                              </p>
                            </div>
                            {bin.distance && (
                              <div className="text-right">
                                <span className="text-base font-medium">
                                  {bin.distance} km
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${bin.lat},${bin.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Navigation className="w-4 h-4" />
                              Get Directions
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </LoadScript>
    </>
  );
};

export default FindBinSimple;