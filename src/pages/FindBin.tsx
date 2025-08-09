import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Navigation, Search, ExternalLink } from 'lucide-react';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useBins, BinLocation } from '@/contexts/BinsContext';

const FindBin = () => {
  const [selectedBin, setSelectedBin] = useState<BinLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyBins, setNearbyBins] = useState<BinLocation[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const binRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Use bins from shared context
  const { bins } = useBins();

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    minHeight: 'calc(100vh - 200px)' // Full height minus header and search bar
  };

  const center = {
    lat: userLocation?.lat || 43.6532,
    lng: userLocation?.lng || -79.3832
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setIsLoading(false);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  // Scroll to selected bin in the list
  const scrollToBin = (binId: string) => {
    const binElement = binRefs.current[binId];
    if (binElement && scrollAreaRef.current) {
      // Find the scroll container within ScrollArea
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const elementTop = binElement.offsetTop;
        scrollContainer.scrollTo({
          top: elementTop - 20, // Add some padding
          behavior: 'smooth'
        });
      }
    }
  };

  // Update nearby bins when user location changes
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

  // Scroll to selected bin when it changes
  useEffect(() => {
    if (selectedBin) {
      scrollToBin(selectedBin.id);
    }
  }, [selectedBin]);

  // Get user's current location
  const getUserLocation = () => {
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
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Handle autocomplete load
  const onAutocompleteLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  // Handle place selection from autocomplete
  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        // Update user location to searched location
        setUserLocation(newLocation);
        
        // Center map on the selected location
        if (map) {
          map.panTo(newLocation);
          map.setZoom(14);
        }
        
        // Update search query with formatted address
        if (place.formatted_address) {
          setSearchQuery(place.formatted_address);
        }
      }
    }
  };

  // Handle manual search (when pressing Enter or clicking Search)
  const handleSearch = () => {
    if (!searchQuery) return;
    
    // If autocomplete hasn't triggered, use geocoding service
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const newLocation = {
          lat: location.lat(),
          lng: location.lng()
        };
        
        setUserLocation(newLocation);
        
        if (map) {
          map.panTo(newLocation);
          map.setZoom(14);
        }
      } else {
        alert('Address not found. Please try a different search.');
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Available': return 'text-green-600';
      case 'Unavailable': return 'text-gray-600';
      case 'Full': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <LoadScript 
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
      libraries={['places']}
      loadingElement={<LoadingSkeleton type="findbin" />}
      onLoad={() => setIsLoading(false)}
      onError={() => {
        console.error('Error loading Google Maps');
        setIsLoading(false);
      }}
    >
      {isLoading ? (
        <LoadingSkeleton type="findbin" />
      ) : (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="px-8 pt-10 pb-6">
            <h1 className="text-3xl font-bold">Find a Donation Bin</h1>
          </div>

          {/* Main Content Area - Full Height */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 px-8 pb-6 overflow-hidden">
          {/* Map with Search Bar */}
          <div className="lg:col-span-2 h-full flex flex-col gap-4">
            {/* Search Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
              <div className="lg:col-span-2 relative autocomplete-container overflow-visible">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Autocomplete
                  onLoad={onAutocompleteLoad}
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    componentRestrictions: { country: 'ca' }, // Restrict to Canada
                    fields: ['formatted_address', 'geometry']
                  }}
                >
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Enter address or postal code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 w-full h-10"
                  />
                </Autocomplete>
              </div>
              <Button 
                variant="outline" 
                onClick={getUserLocation}
                className="flex items-center justify-center gap-2 w-full h-10"
              >
                <Navigation className="w-4 h-4" />
                Use My Location
              </Button>
            </div>
            
            {/* Map */}
            <Card className="flex-1">
              <CardContent className="p-0 h-full">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={12}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                >
                  {/* User Location Marker */}
                  {userLocation && (
                    <Marker
                      position={userLocation}
                      icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#4285F4',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 3,
                      }}
                      title="Your Location"
                    />
                  )}

                  {/* Bin Markers */}
                  {bins.map((bin) => (
                    <Marker
                      key={bin.id}
                      position={{ lat: bin.lat, lng: bin.lng }}
                      onClick={() => {
                        setSelectedBin(bin);
                        scrollToBin(bin.id);
                      }}
                      icon={{
                        url: '/images/hh map pin icon.png',
                        scaledSize: new google.maps.Size(30, 30),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(15, 30)
                      }}
                    />
                  ))}

                  {/* Info Window */}
                  {selectedBin && (
                    <InfoWindow
                      position={{ lat: selectedBin.lat, lng: selectedBin.lng }}
                      onCloseClick={() => setSelectedBin(null)}
                      options={{
                        pixelOffset: new google.maps.Size(0, -35)
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

          {/* Nearby Bins List */}
          <div className="lg:col-span-1 h-full overflow-hidden mt-14 lg:mt-0">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5" />
                  Nearby Bins ({nearbyBins.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0 px-4 pb-6">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                  <div className="space-y-3 pr-4 pl-1 py-2">
                    {nearbyBins.map((bin) => (
                      <div 
                        key={bin.id}
                        ref={(el) => { binRefs.current[bin.id] = el; }}
                        className={`p-4 border rounded-lg transition-all duration-300 ${
                          selectedBin?.id === bin.id 
                            ? 'bg-green-50 border-green-600 shadow-md ring-2 ring-green-200' 
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div 
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedBin(bin);
                            if (map) {
                              map.panTo({ lat: bin.lat, lng: bin.lng });
                              map.setZoom(15);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-base">{bin.locationName}</h4>
                              <p className="text-sm text-gray-500 mt-1">{bin.address}</p>
                              <p className={`text-sm font-medium ${getStatusColor(bin.status)} mt-2`}>
                                {bin.status}
                              </p>
                            </div>
                            {bin.distance && (
                              <div className="text-right">
                                <span className="text-base font-medium">{bin.distance} km</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${bin.lat},${bin.lng}&destination_place_id=${encodeURIComponent(bin.locationName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
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
      )}
    </LoadScript>
  );
};

export default FindBin;