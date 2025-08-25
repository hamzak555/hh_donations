import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePickupRequests } from '@/contexts/PickupRequestsContextSupabase';
import { useDrivers } from '@/contexts/DriversContextSupabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { format, isToday, isTomorrow, addDays, startOfDay, getDay } from 'date-fns';
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
import { MapPin, Truck, Navigation, Check, AlertCircle, Phone } from 'lucide-react';
import { useJsApiLoader, Autocomplete, GoogleMap, DirectionsRenderer, MarkerF } from '@react-google-maps/api';

const libraries: ("places")[] = ['places'];

function PickupRouteGenerator() {
  const { pickupRequests, updatePickupRequest } = usePickupRequests();
  const { drivers: contextDrivers } = useDrivers();
  
  // Check if current user is a driver
  const userRole = localStorage.getItem('userRole');
  const isDriverRole = userRole === 'driver';
  const driverId = localStorage.getItem('driverId');
  const currentDriverName = isDriverRole ? contextDrivers.find(d => d.id === driverId)?.name : null;
  
  // Use drivers from context
  const drivers = contextDrivers.filter(d => d.status === 'Active').map(d => d.name);
  
  const [selectedDriver, setSelectedDriver] = useState<string>(currentDriverName || '');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startingAddress, setStartingAddress] = useState<string>('');
  const [collectedRequests, setCollectedRequests] = useState<Set<string>>(new Set());
  const [startingCoordinates, setStartingCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // Alert dialog state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertData, setAlertData] = useState<{
    type: 'pickup' | 'unpickup' | 'cancel';
    requestId: string;
    requestName: string;
    requestAddress: string;
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

  // Get pickup requests for the selected date
  const getRequestsForDate = useCallback(() => {
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    return pickupRequests.filter(request => 
      (request.status === 'Pending' || request.status === 'Picked Up') && 
      request.date === selectedDateStr
    );
  }, [pickupRequests, selectedDate]);

  // Sort pickup requests by distance from starting point
  const sortRequestsByDistance = useCallback((requestsToSort: typeof pickupRequests) => {
    if (!startingCoordinates) return requestsToSort;
    
    return [...requestsToSort].sort((a, b) => {
      if (!a.location || !b.location) return 0;
      
      const distanceA = calculateDistance(
        startingCoordinates.lat, 
        startingCoordinates.lng, 
        a.location.lat, 
        a.location.lng
      );
      const distanceB = calculateDistance(
        startingCoordinates.lat, 
        startingCoordinates.lng, 
        b.location.lat, 
        b.location.lng
      );
      return distanceA - distanceB;
    });
  }, [startingCoordinates]);

  // Get display name for the selected date
  const getDateDisplayName = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  // Get available pickup days for the selected driver (Tuesdays and Thursdays) with pickup counts
  const getAvailablePickupDays = () => {
    if (!selectedDriver) return [];
    
    const days = [];
    const today = startOfDay(new Date());
    
    // Look ahead for the next 4 weeks (8 pickup days max)
    for (let i = 0; i < 28; i++) {
      const checkDate = addDays(today, i);
      const dayOfWeek = getDay(checkDate);
      
      // Only include Tuesdays (2) and Thursdays (4)
      if (dayOfWeek === 2 || dayOfWeek === 4) {
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        const pickupCount = pickupRequests.filter(request => 
          request.status === 'Pending' && 
          request.date === dateStr &&
          request.assignedDriver === selectedDriver
        ).length;
        
        // Only include days with pickups for this driver
        if (pickupCount > 0) {
          days.push({
            date: checkDate,
            dateStr,
            displayName: getDateDisplayName(checkDate),
            fullDisplayName: format(checkDate, 'EEEE, MMM d'),
            pickupCount
          });
        }
        
        // Stop after we have 8 days or 4 weeks
        if (days.length >= 8) break;
      }
    }
    
    return days;
  };

  const toggleRequestCollected = (requestId: string) => {
    const request = pickupRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const isCurrentlyCollected = collectedRequests.has(requestId) || 
      pickupRequests.find(req => req.id === requestId)?.status === 'Picked Up';
    
    // Show confirmation dialog
    setAlertData({
      type: isCurrentlyCollected ? 'unpickup' : 'pickup',
      requestId,
      requestName: request.name,
      requestAddress: request.address
    });
    setAlertOpen(true);
  };

  const cancelPickupRequest = (requestId: string) => {
    const request = pickupRequests.find(r => r.id === requestId);
    if (!request) return;
    
    // Show confirmation dialog for cancellation
    setAlertData({
      type: 'cancel',
      requestId,
      requestName: request.name,
      requestAddress: request.address
    });
    setAlertOpen(true);
  };

  const callPickupContact = (phoneNumber: string, customerName: string) => {
    // Create tel: URL to initiate phone call
    const telUrl = `tel:${phoneNumber.replace(/[^\d+]/g, '')}`; // Remove non-digit characters except +
    window.location.href = telUrl;
  };

  const handleConfirmAction = () => {
    if (!alertData) return;
    
    const { type, requestId } = alertData;
    
    if (type === 'pickup') {
      // Update the request status to "Picked Up"
      updatePickupRequest(requestId, { status: 'Picked Up' });
      
      // Add to collected set
      setCollectedRequests(prev => {
        const newSet = new Set(prev);
        newSet.add(requestId);
        return newSet;
      });
    } else if (type === 'unpickup') {
      // Update the request status back to "Pending"
      updatePickupRequest(requestId, { status: 'Pending' });
      
      // Remove from collected set
      setCollectedRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    } else if (type === 'cancel') {
      // Update the request status to "Cancelled"
      updatePickupRequest(requestId, { status: 'Cancelled' });
      
      // Remove from collected set if it was there
      setCollectedRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
    
    // Close dialog
    setAlertOpen(false);
    setAlertData(null);
  };

  // Calculate route when driver and starting address are set
  const calculateRoute = useCallback(() => {
    if (!isLoaded || !selectedDriver || !startingCoordinates) {
      setDirectionsResponse(null);
      return;
    }
    
    // Get pending requests for the selected date and driver with location data
    const dateRequests = getRequestsForDate();
    const driverRequests = dateRequests.filter(request => 
      request.assignedDriver === selectedDriver &&
      request.location
    );
    
    if (driverRequests.length === 0) return;
    
    const sortedRequests = sortRequestsByDistance(driverRequests);
    
    // Calculate route using DirectionsService
    const directionsService = new google.maps.DirectionsService();
    
    const waypoints = sortedRequests.slice(0, -1).map(request => ({
      location: request.location!,
      stopover: true
    }));
    
    const lastRequest = sortedRequests[sortedRequests.length - 1];
    
    directionsService.route(
      {
        origin: startingCoordinates,
        destination: lastRequest.location!,
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
  }, [isLoaded, selectedDriver, startingCoordinates, sortRequestsByDistance, getRequestsForDate]);
  
  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);


  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 w-full h-full flex flex-col">
      <Card className="w-full flex-1 flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex-1 flex flex-col space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              {isDriverRole ? 'My Optimized Pickup Route' : 'Create Optimized Pickup Route'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {isDriverRole 
                ? 'Enter a starting address to create an optimized route for your pending pickup requests.'
                : 'Select a driver and enter a starting address to create an optimized route for pending pickup requests.'
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
                    value={selectedDriver}
                    onValueChange={(value) => {
                      setSelectedDriver(value);
                      // Reset date selection when driver changes
                      setSelectedDate(new Date());
                    }}
                  >
                    <SelectTrigger id="route-driver">
                      <SelectValue placeholder="Choose a driver" />
                    </SelectTrigger>
                  <SelectContent>
                    {drivers.map(driverName => {
                      // Count total pending requests for this driver
                      const totalRequests = pickupRequests.filter(request => 
                        request.status === 'Pending' && 
                        request.assignedDriver === driverName
                      ).length;
                      
                      return (
                        <SelectItem key={driverName} value={driverName}>
                          {driverName} ({totalRequests} pending pickup{totalRequests !== 1 ? 's' : ''})
                        </SelectItem>
                      );
                    })}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label>Select Pickup Day</Label>
                {selectedDriver ? (
                  <div className="mt-2 space-y-2">
                    {getAvailablePickupDays().map((day) => {
                      const isSelected = format(selectedDate, 'yyyy-MM-dd') === day.dateStr;
                      return (
                        <Button
                          key={day.dateStr}
                          variant={isSelected ? "default" : "outline"}
                          className="w-full justify-between text-left h-auto p-3"
                          onClick={() => {
                            setSelectedDate(day.date);
                          }}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{day.fullDisplayName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {day.pickupCount} pickup{day.pickupCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </Button>
                      );
                    })}
                    {getAvailablePickupDays().length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        No pickup requests assigned to {selectedDriver} for upcoming Tuesday/Thursday dates
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-500 text-center py-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                    Select a driver first to see available pickup days
                  </div>
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
                    if (!selectedDriver || !startingAddress) {
                      alert('Please select a driver and enter a starting address');
                      return;
                    }
                    
                    const dateRequests = getRequestsForDate();
                    const driverRequests = dateRequests.filter(request => 
                      request.assignedDriver === selectedDriver
                    );
                    
                    // Filter for requests with location data for route generation
                    const requestsWithLocation = driverRequests.filter(r => r.location);
                    
                    if (requestsWithLocation.length === 0) {
                      alert('No pending requests with GPS location data found for this driver.');
                      return;
                    }
                    
                    // Sort requests by distance for optimal route
                    const sortedRequests = sortRequestsByDistance(requestsWithLocation);
                    
                    // Create Google Maps directions URL
                    const baseUrl = 'https://www.google.com/maps/dir/';
                    const waypoints = [
                      encodeURIComponent(startingAddress),
                      ...sortedRequests.map(request => encodeURIComponent(request.address))
                    ];
                    const mapsUrl = baseUrl + waypoints.join('/');
                    
                    // Open in new tab
                    window.open(mapsUrl, '_blank');
                  }}
                  disabled={!selectedDriver || !startingAddress}
                  className="flex-1"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Get Directions in Google Maps
                </Button>
              </div>

              {/* Route Preview Map */}
              {directionsResponse && selectedDriver && isLoaded && (
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
                      
                      {/* Numbered pickup markers */}
                      {(() => {
                        const dateRequests = getRequestsForDate();
                        const driverRequests = dateRequests.filter(request => 
                          request.assignedDriver === selectedDriver &&
                          request.location
                        );
                        
                        const sortedRequests = sortRequestsByDistance(driverRequests);
                        
                        return sortedRequests.map((request, index) => (
                          <MarkerF
                            key={request.id}
                            position={request.location!}
                            label={{
                              text: String(index + 1),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                            icon={{
                              path: google.maps.SymbolPath.CIRCLE,
                              scale: 10,
                              fillColor: '#3b82f6',
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

            {/* Right Column - Pickup Requests List */}
            <div className="flex flex-col h-full">
              <div className="bg-gray-50 border rounded-lg p-4 flex flex-col h-full">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-4 w-4" />
                  Pickup Requests to be Collected
                </h3>
                
                {/* Progress Bar */}
                {(() => {
                  const dateRequests = getRequestsForDate();
                  const driverRequests = selectedDriver ? dateRequests.filter(request => 
                    request.assignedDriver === selectedDriver
                  ) : [];
                  
                  const pickedUpCount = driverRequests.filter(r => 
                    collectedRequests.has(r.id) || 
                    pickupRequests.find(req => req.id === r.id)?.status === 'Picked Up'
                  ).length;
                  const totalRequests = driverRequests.length;
                  const progressPercentage = totalRequests > 0 ? (pickedUpCount / totalRequests) * 100 : 0;
                  
                  if (totalRequests === 0) return null;
                  
                  return (
                    <div className="mb-4 p-3 bg-white rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Pickup Progress</span>
                        <span className="text-sm text-gray-600">{pickedUpCount} of {totalRequests} requests</span>
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
                    if (!selectedDriver) {
                      return (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p>Select a driver to see pending pickup requests</p>
                          </div>
                        </div>
                      );
                    }
                    
                    const dateRequests = getRequestsForDate();
                    const allDriverRequests = dateRequests.filter(request => 
                      request.assignedDriver === selectedDriver
                    );
                    
                    if (allDriverRequests.length === 0) {
                      return <div className="text-gray-500 italic">No pending pickup requests</div>;
                    }
                    
                    const requestsWithLocation = allDriverRequests.filter(r => r.location);
                    const requestsWithoutLocation = allDriverRequests.filter(r => !r.location);
                    
                    // Sort requests with location by distance if starting address is set
                    const sortedRequestsWithLocation = startingCoordinates && requestsWithLocation.length > 0
                      ? sortRequestsByDistance(requestsWithLocation)
                      : requestsWithLocation;
                    
                    return (
                      <>
                        {sortedRequestsWithLocation.map((request, index) => {
                        const isCollected = collectedRequests.has(request.id) || 
                          pickupRequests.find(req => req.id === request.id)?.status === 'Picked Up';
                        return (
                          <div key={request.id} className={`bg-white border rounded p-3 transition-opacity ${isCollected ? 'opacity-50' : ''}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {startingCoordinates && (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                      {index + 1}
                                    </span>
                                  )}
                                  <span className={`font-semibold text-sm ${isCollected ? 'line-through' : ''}`}>
                                    {request.name}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                    {formatSelectedDate(selectedDate)}
                                  </span>
                                </div>
                                <div className={`text-xs text-gray-600 ${isCollected ? 'line-through' : ''}`}>
                                  {request.phone}
                                </div>
                                <div className={`text-xs text-gray-500 mt-1 ${isCollected ? 'line-through' : ''}`}>
                                  {request.address}
                                </div>
                                {request.additionalNotes && (
                                  <div className={`text-xs text-gray-600 mt-1 italic ${isCollected ? 'line-through' : ''}`}>
                                    Note: {request.additionalNotes}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => callPickupContact(request.phone, request.name)}
                                  title={`Call ${request.name} at ${request.phone}`}
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => toggleRequestCollected(request.id)}
                                  title={isCollected ? "Mark as not collected" : "Mark as collected"}
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => cancelPickupRequest(request.id)}
                                  title="Cancel pickup request"
                                >
                                  <AlertCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {requestsWithoutLocation.length > 0 && (
                        <>
                          {requestsWithLocation.length > 0 && (
                            <div className="text-xs text-gray-500 font-medium mt-2">Without GPS coordinates:</div>
                          )}
                          {requestsWithoutLocation.map(request => {
                            const isCollected = collectedRequests.has(request.id) || 
                          pickupRequests.find(req => req.id === request.id)?.status === 'Picked Up';
                            return (
                              <div key={request.id} className={`bg-gray-100 border border-gray-200 rounded p-3 opacity-75 ${isCollected ? 'opacity-50' : ''}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className={`font-semibold text-sm mb-1 ${isCollected ? 'line-through' : ''}`}>
                                      {request.name}
                                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                        {formatSelectedDate(selectedDate)}
                                      </span>
                                    </div>
                                    <div className={`text-xs text-gray-600 ${isCollected ? 'line-through' : ''}`}>
                                      {request.phone}
                                    </div>
                                    <div className={`text-xs text-gray-500 mt-1 ${isCollected ? 'line-through' : ''}`}>
                                      {request.address}
                                    </div>
                                    {request.additionalNotes && (
                                      <div className={`text-xs text-gray-600 mt-1 italic ${isCollected ? 'line-through' : ''}`}>
                                        Note: {request.additionalNotes}
                                      </div>
                                    )}
                                    <div className="text-xs text-red-600 mt-1">⚠️ No GPS coordinates</div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      onClick={() => callPickupContact(request.phone, request.name)}
                                      title={`Call ${request.name} at ${request.phone}`}
                                    >
                                      <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => toggleRequestCollected(request.id)}
                                      title={isCollected ? "Mark as not collected" : "Mark as collected"}
                                    >
                                      <Check className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => cancelPickupRequest(request.id)}
                                      title="Cancel pickup request"
                                    >
                                      <AlertCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
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
              {alertData?.type === 'pickup' && 'Mark Pickup as Completed'}
              {alertData?.type === 'unpickup' && 'Mark Pickup as NOT Completed'}
              {alertData?.type === 'cancel' && 'Cancel Pickup Request'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div>
                <strong>{alertData?.requestName}</strong>
              </div>
              <div className="text-sm text-gray-600">
                {alertData?.requestAddress}
              </div>
              <div className="mt-3">
                {alertData?.type === 'pickup' && 'This will change the status to "Picked Up" in the system.'}
                {alertData?.type === 'unpickup' && 'This will change the status back to "Pending" in the system.'}
                {alertData?.type === 'cancel' && 'This will change the status to "Cancelled" in the system. This action cannot be undone from this page.'}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertData(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className={alertData?.type === 'cancel' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {alertData?.type === 'pickup' && 'Mark as Picked Up'}
              {alertData?.type === 'unpickup' && 'Mark as Pending'}
              {alertData?.type === 'cancel' && 'Cancel Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PickupRouteGenerator;