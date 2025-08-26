import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { usePickupRequests, PickupRequest } from '@/contexts/PickupRequestsContextSupabase';
import { useDrivers } from '@/contexts/DriversContextSupabase';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  MoreHorizontal, 
  Eye, 
  Trash, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon, 
  Clock,
  User,
  Users,
  ChevronUp, 
  ChevronDown, 
  ArrowUpDown, 
  Search,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const libraries: ("places")[] = ['places'];

function PickupRequests() {
  const [isLoading] = useState(false);
  const { pickupRequests, updatePickupRequest, deletePickupRequest } = usePickupRequests();
  const { drivers: contextDrivers } = useDrivers();
  
  // Check if current user is a driver
  const userRole = localStorage.getItem('userRole');
  const isDriverRole = userRole === 'driver';
  const driverId = localStorage.getItem('driverId');
  const currentDriverName = isDriverRole ? contextDrivers.find(d => d.id === driverId)?.name : null;
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [isBulkAssignDialogOpen, setIsBulkAssignDialogOpen] = useState(false);
  const [bulkDriverName, setBulkDriverName] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'overdue' | 'picked-up' | 'cancelled'>('pending');
  
  // Route generation states
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
  const [selectedDriverForRoute, setSelectedDriverForRoute] = useState<string>('');
  const [startingAddress, setStartingAddress] = useState<string>('');
  const [startingCoordinates, setStartingCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // Default driver states
  const [isDefaultDriverDialogOpen, setIsDefaultDriverDialogOpen] = useState(false);
  const [defaultDriver, setDefaultDriver] = useState<string>('');
  const [tempDefaultDriver, setTempDefaultDriver] = useState<string>('');
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries
  });
  
  // Load default driver from localStorage on mount
  useEffect(() => {
    const storedDefaultDriver = localStorage.getItem('defaultPickupDriver');
    if (storedDefaultDriver) {
      setDefaultDriver(storedDefaultDriver);
    }
  }, []);

  // Auto-update overdue pickup requests
  useEffect(() => {
    const checkAndUpdateOverdueRequests = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day
      const todayStr = today.toISOString().split('T')[0];
      
      pickupRequests.forEach(request => {
        if (request.status === 'Pending' && request.date < todayStr) {
          updatePickupRequest(request.id, { status: 'Overdue' });
        }
      });
    };

    checkAndUpdateOverdueRequests();
    
    // Check for overdue requests every minute
    const interval = setInterval(checkAndUpdateOverdueRequests, 60000);
    
    return () => clearInterval(interval);
  }, [pickupRequests, updatePickupRequest]);
  
  // Auto-assign default driver to new pending requests without a driver
  useEffect(() => {
    if (defaultDriver) {
      pickupRequests.forEach(request => {
        if (request.status === 'Pending' && !request.assignedDriver) {
          updatePickupRequest(request.id, { assignedDriver: defaultDriver });
        }
      });
    }
  }, [defaultDriver, pickupRequests, updatePickupRequest]);
  
  
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<PickupRequest | null>(null);
  const [openDatePicker, setOpenDatePicker] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Use drivers from context
  const drivers = contextDrivers.filter(d => d.status === 'Active').map(d => d.name);
  
  // Route generation functions
  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setStartingAddress(place.formatted_address);
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
  
  // Sort pickup requests by distance from starting point
  const sortRequestsByDistance = useCallback((requestsToSort: PickupRequest[]) => {
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
  
  // Calculate route when driver and starting address are set
  const calculateRoute = useCallback(() => {
    if (!isLoaded || !selectedDriverForRoute || !startingCoordinates) {
      setDirectionsResponse(null);
      return;
    }
    
    // Get pending requests for the selected driver (only those with location data)
    const driverRequests = pickupRequests.filter(request => 
      request.status === 'Pending' &&
      request.assignedDriver === selectedDriverForRoute &&
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
  }, [isLoaded, selectedDriverForRoute, startingCoordinates, pickupRequests, sortRequestsByDistance]);
  
  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);
  
  const openRouteDialog = () => {
    // Check if there are any pending requests with assigned drivers
    const pendingWithDrivers = pickupRequests.filter(
      r => r.status === 'Pending' && r.assignedDriver
    );
    
    if (pendingWithDrivers.length === 0) {
      alert('No pending requests with assigned drivers found. Please assign drivers to pending requests first.');
      return;
    }
    
    setIsRouteDialogOpen(true);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getFilteredAndSortedRequests = () => {
    let filteredRequests = pickupRequests;
    
    // First filter by driver assignment if in driver role
    if (isDriverRole && currentDriverName) {
      filteredRequests = filteredRequests.filter(request => 
        request.assignedDriver === currentDriverName
      );
    }
    
    // Filter by tab status
    if (activeTab !== 'all') {
      const statusMap: Record<string, string> = {
        'pending': 'Pending',
        'overdue': 'Overdue',
        'picked-up': 'Picked Up',
        'cancelled': 'Cancelled'
      };
      filteredRequests = filteredRequests.filter(request => 
        request.status === statusMap[activeTab]
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredRequests = filteredRequests.filter(request => 
        request.name.toLowerCase().includes(query) ||
        request.email.toLowerCase().includes(query) ||
        request.phone.toLowerCase().includes(query) ||
        request.address.toLowerCase().includes(query) ||
        request.status.toLowerCase().includes(query) ||
        (request.assignedDriver && request.assignedDriver.toLowerCase().includes(query))
      );
    }
    
    if (!sortColumn) return filteredRequests;
    
    return [...filteredRequests].sort((a, b) => {
      let aValue = a[sortColumn as keyof PickupRequest];
      let bValue = b[sortColumn as keyof PickupRequest];
      
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-gray-700" /> : 
      <ChevronDown className="w-4 h-4 text-gray-700" />;
  };

  const openViewDialog = (request: PickupRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };


  const handleDeleteRequest = (request: PickupRequest) => {
    setRequestToDelete(request);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRequest = () => {
    if (requestToDelete) {
      deletePickupRequest(requestToDelete.id);
      setIsDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedRequests.size === getFilteredAndSortedRequests().length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(getFilteredAndSortedRequests().map(r => r.id)));
    }
  };

  const handleSelectRequest = (requestId: string, event?: React.MouseEvent) => {
    const filteredRequests = getFilteredAndSortedRequests();
    const clickedIndex = filteredRequests.findIndex(r => r.id === requestId);
    
    if (event?.shiftKey && lastSelectedIndex !== null) {
      // Shift-click: select range
      const start = Math.min(lastSelectedIndex, clickedIndex);
      const end = Math.max(lastSelectedIndex, clickedIndex);
      const newSelection = new Set(selectedRequests);
      
      for (let i = start; i <= end; i++) {
        newSelection.add(filteredRequests[i].id);
      }
      
      setSelectedRequests(newSelection);
    } else {
      // Regular click: toggle selection
      const newSelection = new Set(selectedRequests);
      if (newSelection.has(requestId)) {
        newSelection.delete(requestId);
      } else {
        newSelection.add(requestId);
      }
      setSelectedRequests(newSelection);
      setLastSelectedIndex(clickedIndex);
    }
  };

  const handleBulkAssignDriver = () => {
    if (bulkDriverName && selectedRequests.size > 0) {
      selectedRequests.forEach(requestId => {
        updatePickupRequest(requestId, { 
          assignedDriver: bulkDriverName
        });
      });
      setSelectedRequests(new Set());
      setIsBulkAssignDialogOpen(false);
      setBulkDriverName('');
    }
  };

  const handleViewOnMap = (request: PickupRequest) => {
    setSelectedRequest(request);
    setIsMapDialogOpen(true);
  };

  const getStatusBadge = (status: PickupRequest['status']) => {
    const statusConfig: Record<string, { className: string; icon: React.ReactElement }> = {
      'Pending': { 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="h-3 w-3" />
      },
      'Overdue': { 
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertCircle className="h-3 w-3" />
      },
      'Picked Up': { 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-3 w-3" />
      },
      'Cancelled': { 
        className: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <XCircle className="h-3 w-3" />
      }
    };
    
    const config = statusConfig[status] || { 
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <Clock className="h-3 w-3" />
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 ${config.className}`}
      >
        {config.icon}
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    // Parse the date string as Eastern Time
    // When date is in 'yyyy-MM-dd' format, create date in ET
    const [year, month, day] = dateString.split('-');
    const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return localDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/New_York' // Eastern Time
    });
  };

  // Check if a date is Tuesday (2) or Thursday (4)
  const isTuesdayOrThursday = (date: Date) => {
    const day = date.getDay();
    return day === 2 || day === 4;
  };

  // Handle date change from calendar
  const handleDateChange = (requestId: string, newDate: Date | undefined) => {
    if (newDate) {
      const formattedDate = format(newDate, 'yyyy-MM-dd');
      updatePickupRequest(requestId, { date: formattedDate });
      setOpenDatePicker(null);
    }
  };

  const getStatusCounts = () => {
    return {
      all: pickupRequests.length,
      pending: pickupRequests.filter(r => r.status === 'Pending').length,
      overdue: pickupRequests.filter(r => r.status === 'Overdue').length,
      pickedUp: pickupRequests.filter(r => r.status === 'Picked Up').length,
      cancelled: pickupRequests.filter(r => r.status === 'Cancelled').length
    };
  };

  if (isLoading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <div className="pt-10 pb-6 w-full">
      <div className="flex justify-between items-center mb-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">{isDriverRole ? 'My Assigned Pickup Requests' : 'Pickup Requests'}</h1>
        <div className="flex gap-2">
          {!isDriverRole && activeTab === 'pending' && (
            <>
              <Button 
                onClick={() => {
                  setTempDefaultDriver(defaultDriver || "");
                  setIsDefaultDriverDialogOpen(true);
                }}
                variant="outline"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Default Driver {defaultDriver && `(${defaultDriver})`}
              </Button>
            </>
          )}
          {selectedRequests.size > 0 && !isDriverRole && (
            <>
              <Button 
                onClick={() => setIsBulkAssignDialogOpen(true)}
                variant="outline"
              >
                <Users className="w-4 h-4 mr-2" />
                Assign Driver ({selectedRequests.size})
              </Button>
              <Button 
                onClick={() => {
                  setSelectedRequests(new Set());
                  setLastSelectedIndex(null);
                }}
                variant="ghost"
                size="sm"
              >
                Clear Selection
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex gap-4 mb-6 px-4 sm:px-6 lg:px-8">
        <div className="w-1/3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, phone, address, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="w-2/3 flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => {
              setActiveTab('pending');
              setSelectedRequests(new Set());
              setLastSelectedIndex(null);
            }}
            className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'pending'
                ? 'bg-background text-foreground shadow-sm'
                : ''
            }`}
          >
            Pending
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
              activeTab === 'pending'
                ? 'bg-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {getStatusCounts().pending}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('overdue');
              setSelectedRequests(new Set());
              setLastSelectedIndex(null);
            }}
            className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'overdue'
                ? 'bg-background text-foreground shadow-sm'
                : ''
            }`}
          >
            Overdue
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
              activeTab === 'overdue'
                ? 'bg-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {getStatusCounts().overdue}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('picked-up');
              setSelectedRequests(new Set());
              setLastSelectedIndex(null);
            }}
            className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'picked-up'
                ? 'bg-background text-foreground shadow-sm'
                : ''
            }`}
          >
            Picked Up
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
              activeTab === 'picked-up'
                ? 'bg-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {getStatusCounts().pickedUp}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('cancelled');
              setSelectedRequests(new Set());
              setLastSelectedIndex(null);
            }}
            className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'cancelled'
                ? 'bg-background text-foreground shadow-sm'
                : ''
            }`}
          >
            Cancelled
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
              activeTab === 'cancelled'
                ? 'bg-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {getStatusCounts().cancelled}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedRequests(new Set());
              setLastSelectedIndex(null);
            }}
            className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : ''
            }`}
          >
            All
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
              activeTab === 'all'
                ? 'bg-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {getStatusCounts().all}
            </span>
          </button>
        </div>
      </div>

      {/* Pickup Requests Table */}
      <Card className="overflow-hidden mx-4 sm:mx-6 lg:mx-8">
        <div className="p-6">
          <div className="overflow-x-auto -mx-6">
            <div className="inline-block min-w-full align-middle px-6">
              <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {!isDriverRole && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRequests.size === getFilteredAndSortedRequests().length && getFilteredAndSortedRequests().length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-1">
                    Contact
                    {getSortIcon('email')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('address')}
                >
                  <div className="flex items-center gap-1">
                    Address
                    {getSortIcon('address')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Pickup Date
                    {getSortIcon('date')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('assignedDriver')}
                >
                  <div className="flex items-center gap-1">
                    Driver
                    {getSortIcon('assignedDriver')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('submittedAt')}
                >
                  <div className="flex items-center gap-1">
                    Submitted
                    {getSortIcon('submittedAt')}
                  </div>
                </TableHead>
                {!isDriverRole && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredAndSortedRequests().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No pickup requests found. Submit a request from the frontend to see it here.
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredAndSortedRequests().map((request) => (
                <TableRow 
                  key={request.id}
                  className={`cursor-pointer select-none ${
                    selectedRequests.has(request.id) ? 'bg-primary/5' : ''
                  }`}
                  onClick={(e) => {
                    // Don't select if clicking on action buttons or dropdowns
                    const target = e.target as HTMLElement;
                    if (
                      target.closest('button') || 
                      target.closest('[role="combobox"]') ||
                      target.closest('[role="listbox"]')
                    ) {
                      return;
                    }
                    handleSelectRequest(request.id, e);
                  }}
                >
                  {!isDriverRole && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRequests.has(request.id)}
                        onCheckedChange={() => {
                          // Use onClick for proper event handling with shift key
                        }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRequest(request.id, e);
                      }}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{request.email}</div>
                      <div className="text-xs text-gray-500">{request.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={request.address}>
                      {request.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Popover 
                      open={openDatePicker === request.id} 
                      onOpenChange={(open) => setOpenDatePicker(open ? request.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "justify-start text-left font-normal h-auto p-2 hover:bg-primary/5",
                            !request.date && "text-muted-foreground"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span className="text-sm font-medium">{formatDate(request.date)}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(request.date + 'T00:00:00')}
                          onSelect={(date) => handleDateChange(request.id, date)}
                          initialFocus
                          disabled={(date) => {
                            // Disable all dates except Tuesday and Thursday
                            return !isTuesdayOrThursday(date) || date < new Date(new Date().setHours(0, 0, 0, 0));
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={request.status}
                      onValueChange={(value) => {
                        updatePickupRequest(request.id, { 
                          status: value as PickupRequest['status']
                        });
                      }}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue>
                          {getStatusBadge(request.status)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        </SelectItem>
                        <SelectItem value="Overdue">
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Overdue
                          </Badge>
                        </SelectItem>
                        <SelectItem value="Picked Up">
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Picked Up
                          </Badge>
                        </SelectItem>
                        <SelectItem value="Cancelled">
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Cancelled
                          </Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {isDriverRole ? (
                      <span className="text-sm font-medium">{request.assignedDriver || 'Unassigned'}</span>
                    ) : (
                      <Select 
                        value={request.assignedDriver || "unassigned"}
                        onValueChange={(value) => {
                          updatePickupRequest(request.id, { 
                            assignedDriver: value === "unassigned" ? "" : value 
                          });
                        }}
                      >
                        <SelectTrigger className="w-40 h-8">
                          <SelectValue>
                            {request.assignedDriver || <span className="text-gray-400">Unassigned</span>}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">
                            <span className="text-gray-400">Unassigned</span>
                          </SelectItem>
                          {drivers.map(driver => (
                            <SelectItem key={driver} value={driver}>{driver}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(request.submittedAt)}</TableCell>
                  {!isDriverRole && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(request)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {request.location && (
                            <DropdownMenuItem onClick={() => handleViewOnMap(request)}>
                              <MapPin className="mr-2 h-4 w-4" />
                              View on Map
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRequest(request)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              )))}
            </TableBody>
          </Table>
            </div>
          </div>
        </div>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pickup Request Details</DialogTitle>
            <DialogDescription>
              Request submitted on {selectedRequest && formatDate(selectedRequest.submittedAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      Contact Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Name:</strong> {selectedRequest.name}</div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {selectedRequest.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedRequest.phone}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      Pickup Schedule
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Date:</strong> {formatDate(selectedRequest.date)}</div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedRequest.time}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </h4>
                    <div className="text-sm">
                      {selectedRequest.address}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Status</h4>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedRequest.status)}
                      {selectedRequest.assignedDriver && (
                        <span className="text-sm text-gray-600">
                          Assigned to: {selectedRequest.assignedDriver}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedRequest.additionalNotes && (
                <div>
                  <h4 className="font-semibold mb-2">Additional Notes</h4>
                  <div className="text-sm bg-gray-50 p-3 rounded">
                    {selectedRequest.additionalNotes}
                  </div>
                </div>
              )}
              
              {selectedRequest.adminNotes && (
                <div>
                  <h4 className="font-semibold mb-2">Admin Notes</h4>
                  <div className="text-sm bg-blue-50 p-3 rounded">
                    {selectedRequest.adminNotes}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* View on Map Dialog */}
      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pickup Location</DialogTitle>
            <DialogDescription>
              {selectedRequest?.name} - {selectedRequest?.address}
            </DialogDescription>
          </DialogHeader>
          <div className="h-96 w-full">
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''} loadingElement={<div />}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={selectedRequest?.location || { lat: 43.6532, lng: -79.3832 }}
                zoom={15}
              >
                {selectedRequest?.location && (
                  <Marker 
                    position={selectedRequest.location}
                    title={`${selectedRequest.name} - Pickup Location`}
                    icon={{
                      url: '/images/hh map pin icon.png',
                      scaledSize: new google.maps.Size(30, 30),
                      origin: new google.maps.Point(0, 0),
                      anchor: new google.maps.Point(15, 30)
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => {
                if (selectedRequest?.location) {
                  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedRequest.location.lat},${selectedRequest.location.lng}&destination_place_id=${encodeURIComponent(selectedRequest.address)}`;
                  window.open(googleMapsUrl, '_blank');
                }
              }}
            >
              Get Directions
            </Button>
            <Button onClick={() => setIsMapDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Driver Dialog */}
      <Dialog open={isBulkAssignDialogOpen} onOpenChange={setIsBulkAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Assign Driver</DialogTitle>
            <DialogDescription>
              Assign a driver to {selectedRequests.size} selected request{selectedRequests.size !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-driver">Select Driver</Label>
              <Select 
                value={bulkDriverName}
                onValueChange={setBulkDriverName}
              >
                <SelectTrigger id="bulk-driver">
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map(driver => (
                    <SelectItem key={driver} value={driver}>{driver}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                This will assign the selected driver to all chosen pickup requests.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsBulkAssignDialogOpen(false);
                setBulkDriverName('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAssignDriver}
              disabled={!bulkDriverName}
            >
              Assign Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Default Driver Dialog */}
      <Dialog open={isDefaultDriverDialogOpen} onOpenChange={setIsDefaultDriverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Default Driver</DialogTitle>
            <DialogDescription>
              Choose a default driver who will be automatically assigned to all new pending pickup requests.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="default-driver">Default Driver</Label>
              <Select 
                value={tempDefaultDriver || "none"}
                onValueChange={(value) => setTempDefaultDriver(value === "none" ? "" : value)}
              >
                <SelectTrigger id="default-driver">
                  <SelectValue placeholder="Select a default driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No default driver</SelectItem>
                  {drivers.map(driverName => (
                    <SelectItem key={driverName} value={driverName}>
                      {driverName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-2">
                {tempDefaultDriver 
                  ? `New pending requests will be automatically assigned to ${tempDefaultDriver}.`
                  : 'New pending requests will remain unassigned until manually assigned.'}
              </p>
            </div>
            
            {defaultDriver && defaultDriver !== tempDefaultDriver && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Changing the default driver will not affect existing requests. 
                  Only new incoming requests will be assigned to the new default driver.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDefaultDriverDialogOpen(false);
                setTempDefaultDriver(defaultDriver || "");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setDefaultDriver(tempDefaultDriver);
                if (tempDefaultDriver) {
                  localStorage.setItem('defaultPickupDriver', tempDefaultDriver);
                } else {
                  localStorage.removeItem('defaultPickupDriver');
                }
                setIsDefaultDriverDialogOpen(false);
                
                // Auto-assign to existing unassigned pending requests
                if (tempDefaultDriver) {
                  const unassignedPending = pickupRequests.filter(
                    r => r.status === 'Pending' && !r.assignedDriver
                  );
                  if (unassignedPending.length > 0) {
                    const confirmAssign = window.confirm(
                      `Do you want to assign ${tempDefaultDriver} to ${unassignedPending.length} existing unassigned pending request${unassignedPending.length !== 1 ? 's' : ''}?`
                    );
                    if (confirmAssign) {
                      unassignedPending.forEach(request => {
                        updatePickupRequest(request.id, { assignedDriver: tempDefaultDriver });
                      });
                    }
                  }
                }
              }}
            >
              Save Default Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the pickup request from
              {requestToDelete && (
                <span className="font-semibold"> "{requestToDelete.name}"</span>
              )}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setRequestToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRequest}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PickupRequests;