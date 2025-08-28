import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMapsErrorBoundary } from '@/components/GoogleMapsLoader';
import { SimpleGoogleMap } from '@/components/SimpleGoogleMap';
import { DelayedMarker as SafeMarker } from '@/components/DelayedMarker';
import { InfoWindow, Autocomplete } from '@react-google-maps/api';
import { FallbackMap } from '@/components/FallbackMap';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Navigation, Search, ExternalLink, AlertCircle } from 'lucide-react';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useBins, BinLocation } from '@/contexts/BinsContextSupabase';
import SEO from '@/components/SEO';

const FindBin = () => {
  const [selectedBin, setSelectedBin] = useState<BinLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyBins, setNearbyBins] = useState<BinLocation[]>([]);
  const [map, setMap] = useState<any>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [userLocationIcon, setUserLocationIcon] = useState<any>(undefined);
  const [binIcon, setBinIcon] = useState<any>({ url: '/images/hh map pin icon.png' });
  const [pixelOffset, setPixelOffset] = useState<any>(undefined);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const binRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Use bins from shared context
  const { bins } = useBins();

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const center = {
    lat: userLocation?.lat || 43.6532,
    lng: userLocation?.lng || -79.3832
  };

  useEffect(() => {
    // Check if Google Maps is fully loaded
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && 
          window.google && 
          window.google.maps &&
          window.google.maps.SymbolPath &&
          window.google.maps.Size &&
          window.google.maps.Point) {
        setGoogleMapsReady(true);
        return true;
      }
      return false;
    };

    // Try immediately
    if (checkGoogleMaps()) return;

    // If not ready, keep checking
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Set icons only when Google Maps is ready
  useEffect(() => {
    if (googleMapsReady && window.google && window.google.maps) {
      try {
        setUserLocationIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        });
        
        setBinIcon({
          url: '/images/hh map pin icon.png',
          scaledSize: new window.google.maps.Size(30, 30),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(15, 30)
        });
        
        setPixelOffset(new window.google.maps.Size(0, -35));
      } catch (error) {
        console.warn('Error setting Google Maps icons:', error);
      }
    }
  }, [googleMapsReady]);

  const onLoad = useCallback((map: any) => {
    setMap(map);
    // Ensure both map and Google Maps API are ready
    const checkReady = () => {
      if (window.google && 
          window.google.maps && 
          window.google.maps.SymbolPath &&
          window.google.maps.Size) {
        setMapLoaded(true);
        setGoogleMapsReady(true);
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();
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

  // Handle autocomplete load
  const onAutocompleteLoad = (autocompleteInstance: any) => {
    setAutocomplete(autocompleteInstance);
  };

  // Handle place selection from autocomplete
  const onPlaceChanged = () => {
    if (autocomplete) {
      try {
        const place = autocomplete.getPlace();
        
        if (place && place.geometry && place.geometry.location) {
          const location = place.geometry.location;
          const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
          const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
          const newLocation = {
            lat: Number(lat),
            lng: Number(lng)
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
      } catch (error) {
        console.error('Error handling place change:', error);
        setLocationError('Unable to process the selected location. Please try again.');
      }
    }
  };

  // Handle manual search (when pressing Enter or clicking Search)
  const handleSearch = () => {
    if (!searchQuery) return;
    
    setLocationError('');
    
    // Check if Google Maps is available
    if (typeof window === 'undefined' || !window.google || !window.google.maps) {
      setLocationError('Maps service is not available. Please try again later.');
      return;
    }
    
    // If autocomplete hasn't triggered, use geocoding service
    if (!window.google || !window.google.maps) {
      console.warn('Google Maps not available for geocoding');
      return;
    }
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
          const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
          const newLocation = {
            lat: Number(lat),
            lng: Number(lng)
          };
          
          setUserLocation(newLocation);
          
          if (map) {
            map.panTo(newLocation);
            map.setZoom(14);
          }
        } else {
          setLocationError('Address not found. Please try a different search.');
        }
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      setLocationError('Unable to search for this address. Please try again.');
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
        description="Locate H&H Donations clothing bins in your area. Use our interactive map to find the nearest donation bin, check availability, and get directions. Available 24/7 for your convenience."
        keywords="donation bins near me, clothing donation locations, find donation bin, charity bins, H&H Donations map, textile recycling bins"
        url="/find-bin"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "H&H Donations Bin Locator",
          "description": "Interactive map to find donation bins",
          "provider": {
            "@type": "Organization",
            "name": "H&H Donations"
          },
          "areaServed": {
            "@type": "Country",
            "name": "Canada"
          },
          "serviceType": "Donation Collection"
        }}
      />
      <GoogleMapsErrorBoundary fallback={<LoadingSkeleton type="findbin" />}>
        <div className="flex flex-col lg:h-screen">
          {/* Header */}
          <div className="px-8 pt-10 pb-6">
            <h1 className="text-3xl font-bold">Find a Donation Bin</h1>
          </div>

          {/* Main Content Area - Full Height */}
          <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-6 px-4 lg:px-8 pb-6 lg:overflow-hidden">
          {/* Map with Search Bar */}
          <div className="lg:col-span-2 h-[300px] lg:h-full flex flex-col gap-4 flex-shrink-0">
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
                className="flex items-center justify-center gap-0.5 w-full h-10"
              >
                <Navigation className="w-4 h-4" />
                Use My Location
              </Button>
            </div>
            
            {/* Location Error Alert */}
            {locationError && (
              <Alert className="border-red-500 bg-red-50 flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <AlertDescription className="text-red-800 flex-1">
                  {locationError}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Map */}
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <SimpleGoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={12}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                >
                  {/* User Location Marker */}
                  {mapLoaded && googleMapsReady && userLocation && (
                    <SafeMarker
                      position={userLocation}
                      icon={userLocationIcon}
                      title="Your Location"
                    />
                  )}

                  {/* Bin Markers */}
                  {mapLoaded && googleMapsReady && bins.map((bin) => (
                    <SafeMarker
                      key={bin.id}
                      position={{ lat: bin.lat, lng: bin.lng }}
                      onClick={() => {
                        setSelectedBin(bin);
                        scrollToBin(bin.id);
                      }}
                      icon={binIcon}
                      opacity={bin.status === 'Unavailable' ? 0.4 : 1}
                    />
                  ))}

                  {/* Info Window */}
                  {mapLoaded && googleMapsReady && selectedBin && (
                    <InfoWindow
                      position={{ lat: selectedBin.lat, lng: selectedBin.lng }}
                      onCloseClick={() => setSelectedBin(null)}
                      options={{
                        pixelOffset: pixelOffset
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
                  </SimpleGoogleMap>
              </CardContent>
            </Card>
          </div>

          {/* Nearby Bins List */}
          <div className="lg:col-span-1 h-[500px] lg:h-full overflow-hidden flex-shrink-0 mt-6 lg:mt-0">
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
                    {nearbyBins.map((bin) => {
                      const isUnavailable = bin.status === 'Unavailable';
                      return (
                        <div 
                          key={bin.id}
                          ref={(el) => { binRefs.current[bin.id] = el; }}
                          className={`p-4 border rounded-lg transition-all duration-300 ${
                            isUnavailable
                              ? 'bg-gray-100 border-gray-300 opacity-60'
                              : selectedBin?.id === bin.id 
                                ? 'bg-green-50 border-green-600 shadow-md ring-2 ring-green-200' 
                                : 'hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div 
                            className={isUnavailable ? "cursor-not-allowed" : "cursor-pointer"}
                            onClick={() => {
                              if (!isUnavailable) {
                                setSelectedBin(bin);
                                if (map) {
                                  map.panTo({ lat: bin.lat, lng: bin.lng });
                                  map.setZoom(15);
                                }
                              }
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className={`font-semibold text-base ${isUnavailable ? 'text-gray-500' : ''}`}>
                                  {bin.locationName}
                                </h4>
                                <p className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {bin.address}
                                </p>
                                <p className={`text-sm font-medium ${getStatusColor(bin.status)} mt-2`}>
                                  {bin.status}
                                </p>
                              </div>
                              {bin.distance && (
                                <div className="text-right">
                                  <span className={`text-base font-medium ${isUnavailable ? 'text-gray-400' : ''}`}>
                                    {bin.distance} km
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            {isUnavailable ? (
                              <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                                <Navigation className="w-4 h-4" />
                                Bin Currently Unavailable
                              </span>
                            ) : (
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
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </GoogleMapsErrorBoundary>
    </>
  );
};

export default FindBin;