import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDrivers } from '@/contexts/DriversContextSupabase';
import { useBins } from '@/contexts/BinsContextSupabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MapPin, Truck, Navigation, Check } from 'lucide-react';
import { useJsApiLoader, Autocomplete, GoogleMap, DirectionsRenderer, MarkerF } from '@react-google-maps/api';

const libraries: ("places")[] = ['places'];

function RouteCreation() {
  const { drivers } = useDrivers();
  const { bins } = useBins();
  
  // Check if current user is a driver
  const userRole = localStorage.getItem('userRole');
  const isDriverRole = userRole === 'driver';
  const driverId = localStorage.getItem('driverId');
  const currentDriverName = isDriverRole ? drivers.find(d => d.id === driverId)?.name : null;
  
  const [selectedRouteDriver, setSelectedRouteDriver] = useState<string>(isDriverRole ? (driverId || '') : '');
  const [startingAddress, setStartingAddress] = useState<string>('');
  const [collectedBins, setCollectedBins] = useState<Set<string>>(new Set());
  const [startingCoordinates, setStartingCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // Alert dialog state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertData, setAlertData] = useState<{
    type: 'collect' | 'uncollect';
    binId: string;
    binNumber: string;
    binLocation: string;
  } | null>(null);
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setStartingAddress(place.formatted_address);
        // Store coordinates for distance calculations
        if (place.geometry?.location) {
          setStartingCoordinates({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
        }
      }
    }
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Sort bins by distance from starting point
  const sortBinsByDistance = useCallback((binsToSort: typeof bins) => {
    if (!startingCoordinates) return binsToSort;
    
    return [...binsToSort].sort((a, b) => {
      const distanceA = calculateDistance(
        startingCoordinates.lat, 
        startingCoordinates.lng, 
        a.lat, 
        a.lng
      );
      const distanceB = calculateDistance(
        startingCoordinates.lat, 
        startingCoordinates.lng, 
        b.lat, 
        b.lng
      );
      return distanceA - distanceB;
    });
  }, [startingCoordinates]);

  const toggleBinCollected = (binId: string) => {
    const bin = bins.find(b => b.id === binId);
    if (!bin) return;
    
    const isCurrentlyCollected = collectedBins.has(binId);
    
    // Show confirmation dialog
    setAlertData({
      type: isCurrentlyCollected ? 'uncollect' : 'collect',
      binId,
      binNumber: bin.binNumber,
      binLocation: bin.locationName
    });
    setAlertOpen(true);
  };

  const handleConfirmAction = () => {
    if (!alertData) return;
    
    const { type, binId } = alertData;
    
    if (type === 'collect') {
      // Add to collected set
      setCollectedBins(prev => {
        const newSet = new Set(prev);
        newSet.add(binId);
        return newSet;
      });
    } else {
      // Remove from collected set
      setCollectedBins(prev => {
        const newSet = new Set(prev);
        newSet.delete(binId);
        return newSet;
      });
    }
    
    // Close dialog
    setAlertOpen(false);
    setAlertData(null);
  };

  // Calculate route when driver and starting address are set
  const calculateRoute = useCallback(() => {
    if (!isLoaded || !selectedRouteDriver || !startingCoordinates) {
      setDirectionsResponse(null);
      return;
    }
    
    const driver = drivers.find(d => d.id === selectedRouteDriver);
    if (!driver) return;
    
    const urgentBins = bins.filter(bin => 
      driver.assignedBins.includes(bin.binNumber) &&
      (bin.status === 'Almost Full' || bin.status === 'Full')
    );
    
    if (urgentBins.length === 0) return;
    
    const sortedBins = sortBinsByDistance(urgentBins);
    
    // Calculate route using DirectionsService
    const directionsService = new google.maps.DirectionsService();
    
    const waypoints = sortedBins.slice(0, -1).map(bin => ({
      location: { lat: bin.lat, lng: bin.lng },
      stopover: true
    }));
    
    const lastBin = sortedBins[sortedBins.length - 1];
    
    directionsService.route(
      {
        origin: startingCoordinates,
        destination: { lat: lastBin.lat, lng: lastBin.lng },
        waypoints: waypoints,
        optimizeWaypoints: false, // We already optimized by distance
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirectionsResponse(result);
        }
      }
    );
  }, [isLoaded, selectedRouteDriver, startingCoordinates, bins, drivers, sortBinsByDistance]);
  
  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  return (
    <div className="p-6 w-full h-full flex flex-col">
      <Card className="w-full flex-1 flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex-1 flex flex-col space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              {isDriverRole ? 'My Optimized Bin Route' : 'Create Optimized Bin Route'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {isDriverRole 
                ? 'Enter a starting address to create an optimized route for picking up your Almost Full and Full bins.'
                : 'Select a driver and enter a starting address to create an optimized route for picking up Almost Full and Full bins.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
            {/* Left Column - Form */}
            <div className="space-y-4 flex flex-col">
              <div>
                <Label htmlFor="route-driver">Select Driver</Label>
                {isDriverRole ? (
                  <div className="p-3 bg-gray-50 border rounded-md">
                    <span className="text-sm font-medium">{currentDriverName}</span>
                  </div>
                ) : (
                  <Select 
                    value={selectedRouteDriver}
                    onValueChange={setSelectedRouteDriver}
                  >
                    <SelectTrigger id="route-driver">
                      <SelectValue placeholder="Choose a driver" />
                    </SelectTrigger>
                  <SelectContent>
                    {drivers
                      .filter(driver => {
                        // Only show active drivers with Almost Full or Full bins
                        if (driver.status !== 'Active' || driver.assignedBins.length === 0) return false;
                        
                        const driverBins = bins.filter(bin => 
                          driver.assignedBins.includes(bin.binNumber) &&
                          (bin.status === 'Almost Full' || bin.status === 'Full')
                        );
                        
                        return driverBins.length > 0;
                      })
                      .map(driver => {
                        const urgentBins = bins.filter(bin => 
                          driver.assignedBins.includes(bin.binNumber) &&
                          (bin.status === 'Almost Full' || bin.status === 'Full')
                        );
                        
                        return (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} ({urgentBins.length} bins need pickup)
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div>
                <Label htmlFor="starting-address">Starting Address</Label>
                {isLoaded ? (
                  <Autocomplete
                    onLoad={onAutocompleteLoad}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <Input 
                      id="starting-address"
                      type="text"
                      placeholder="Enter the starting address for the route"
                      value={startingAddress}
                      onChange={(e) => {
                        setStartingAddress(e.target.value);
                        // Clear coordinates when manually typing (will be set again when place is selected)
                        setStartingCoordinates(null);
                      }}
                    />
                  </Autocomplete>
                ) : (
                  <Input 
                    id="starting-address"
                    type="text"
                    placeholder="Loading Google Maps..."
                    disabled
                  />
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => {
                    if (!selectedRouteDriver || !startingAddress) {
                      alert('Please select a driver and enter a starting address');
                      return;
                    }
                    
                    const driver = drivers.find(d => d.id === selectedRouteDriver);
                    if (!driver) return;
                    
                    const urgentBins = bins.filter(bin => 
                      driver.assignedBins.includes(bin.binNumber) &&
                      (bin.status === 'Almost Full' || bin.status === 'Full')
                    );
                    
                    if (urgentBins.length === 0) {
                      alert('No Almost Full or Full bins found for this driver');
                      return;
                    }
                    
                    // Sort bins by distance for optimal route
                    const sortedBins = sortBinsByDistance(urgentBins);
                    
                    // Create Google Maps directions URL
                    const baseUrl = 'https://www.google.com/maps/dir/';
                    const waypoints = [
                      encodeURIComponent(startingAddress),
                      ...sortedBins.map(bin => encodeURIComponent(bin.address))
                    ];
                    const mapsUrl = baseUrl + waypoints.join('/');
                    
                    // Open in new tab
                    window.open(mapsUrl, '_blank');
                  }}
                  disabled={!selectedRouteDriver || !startingAddress}
                  className="flex-1"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Get Directions in Google Maps
                </Button>
              </div>

              {/* Route Preview Map */}
              {directionsResponse && selectedRouteDriver && isLoaded && (
                <div className="mt-4 flex-1 flex flex-col">
                  <Label>Route Preview</Label>
                  <div className="mt-2 rounded-lg overflow-hidden border flex-1 min-h-[300px]">
                    <GoogleMap
                      center={startingCoordinates || { lat: 43.6532, lng: -79.3832 }}
                      zoom={12}
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false
                      }}
                    >
                      {directionsResponse && (
                        <DirectionsRenderer 
                          directions={directionsResponse}
                          options={{
                            suppressMarkers: true, // Hide default markers
                            polylineOptions: {
                              strokeColor: '#10b981',
                              strokeWeight: 4,
                              strokeOpacity: 0.8
                            }
                          }}
                        />
                      )}
                      
                      {/* Starting point marker */}
                      {startingCoordinates && (
                        <MarkerF
                          position={startingCoordinates}
                          label={{
                            text: 'S',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                          icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 12,
                            fillColor: '#059669',
                            fillOpacity: 1,
                            strokeColor: '#fff',
                            strokeWeight: 2
                          }}
                        />
                      )}
                      
                      {/* Numbered bin markers */}
                      {(() => {
                        const driver = drivers.find(d => d.id === selectedRouteDriver);
                        if (!driver) return null;
                        
                        const urgentBins = bins.filter(bin => 
                          driver.assignedBins.includes(bin.binNumber) &&
                          (bin.status === 'Almost Full' || bin.status === 'Full')
                        );
                        
                        const sortedBins = sortBinsByDistance(urgentBins);
                        
                        return sortedBins.map((bin, index) => (
                          <MarkerF
                            key={bin.id}
                            position={{ lat: bin.lat, lng: bin.lng }}
                            label={{
                              text: String(index + 1),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                            icon={{
                              path: google.maps.SymbolPath.CIRCLE,
                              scale: 10,
                              fillColor: bin.status === 'Full' ? '#dc2626' : '#eab308',
                              fillOpacity: 1,
                              strokeColor: '#fff',
                              strokeWeight: 2
                            }}
                          />
                        ));
                      })()}
                    </GoogleMap>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Bins List */}
            <div className="flex flex-col h-full">
              <div className="bg-gray-50 border rounded-lg p-4 flex flex-col h-full">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Bins to be Collected
                </h3>
                
                {/* Progress Bar */}
                {(() => {
                  const driver = selectedRouteDriver ? drivers.find(d => d.id === selectedRouteDriver) : null;
                  
                  const urgentBins = driver ? bins.filter(bin => 
                    driver.assignedBins.includes(bin.binNumber) &&
                    (bin.status === 'Almost Full' || bin.status === 'Full')
                  ) : [];
                  
                  const collectedCount = urgentBins.filter(b => collectedBins.has(b.id)).length;
                  const totalBins = urgentBins.length;
                  const progressPercentage = totalBins > 0 ? (collectedCount / totalBins) * 100 : 0;
                  
                  if (totalBins === 0) return null;
                  
                  return (
                    <div className="mb-4 p-3 bg-white rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Collection Progress</span>
                        <span className="text-sm text-gray-600">{collectedCount} of {totalBins} bins</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span className="font-medium">{Math.round(progressPercentage)}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  );
                })()}
                <div className="space-y-2 flex-1 overflow-y-auto flex flex-col">
                  {(() => {
                    if (!selectedRouteDriver) {
                      return (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p>Select a driver to see bins that need pickup</p>
                          </div>
                        </div>
                      );
                    }
                    
                    const driver = drivers.find(d => d.id === selectedRouteDriver);
                    if (!driver) return <div className="text-gray-500 italic">No driver selected</div>;
                    
                    const urgentBins = bins.filter(bin => 
                      driver.assignedBins.includes(bin.binNumber) &&
                      (bin.status === 'Almost Full' || bin.status === 'Full')
                    );
                    
                    if (urgentBins.length === 0) {
                      return <div className="text-gray-500 italic">No bins need pickup</div>;
                    }
                    
                    // Sort bins by distance if starting address is set
                    const sortedBins = sortBinsByDistance(urgentBins);
                    
                    return (
                      <>
                        {sortedBins.map((bin, index) => {
                        const isCollected = collectedBins.has(bin.id);
                        return (
                          <div key={bin.id} className={`bg-white border rounded p-3 transition-opacity ${isCollected ? 'opacity-50' : ''}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {startingCoordinates && (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-bold">
                                      {index + 1}
                                    </span>
                                  )}
                                  <span className={`inline-block w-2 h-2 rounded-full ${
                                    bin.status === 'Full' ? 'bg-red-500' : 'bg-yellow-500'
                                  }`} />
                                  <span className={`font-semibold text-sm ${isCollected ? 'line-through' : ''}`}>{bin.binNumber}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    bin.status === 'Full' 
                                      ? 'bg-red-100 text-red-700' 
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {bin.status}
                                  </span>
                                </div>
                                <div className={`text-sm text-gray-700 font-medium ${isCollected ? 'line-through' : ''}`}>{bin.locationName}</div>
                                <div className={`text-xs text-gray-500 mt-1 ${isCollected ? 'line-through' : ''}`}>{bin.address}</div>
                              </div>
                              <Button
                                variant={isCollected ? "default" : "outline"}
                                size="sm"
                                className={`h-8 w-8 p-0 ${isCollected ? 'bg-primary hover:bg-primary/90' : ''}`}
                                onClick={() => toggleBinCollected(bin.id)}
                                title={isCollected ? "Mark as not collected" : "Mark as collected"}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      </>
                    );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertData?.type === 'collect' ? 'Mark Bin as Collected' : 'Mark Bin as NOT Collected'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div>
                <strong>Bin #{alertData?.binNumber}</strong>
              </div>
              <div className="text-sm text-gray-600">
                {alertData?.binLocation}
              </div>
              <div className="mt-3">
                {alertData?.type === 'collect' 
                  ? 'This will mark the bin as collected and update your pickup progress.'
                  : 'This will mark the bin as NOT collected.'
                }
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertData(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {alertData?.type === 'collect' ? 'Mark as Collected' : 'Mark as Not Collected'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default RouteCreation;