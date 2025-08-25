import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useBins, BinLocation } from '@/contexts/BinsContext';
import { useDrivers } from '@/contexts/DriversContext';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, MoreHorizontal, Edit, Trash, MapPin, CalendarDays, FileText, Upload, ChevronUp, ChevronDown, ArrowUpDown, Search, Package, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

// Use the shared Bin type from context
type Bin = BinLocation;

function BinsManagement() {
  const [isLoading] = useState(false);
  const { bins, addBin, updateBin, deleteBin } = useBins();
  const { drivers, updateDriver, getActiveDrivers } = useDrivers();
  

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [binToDelete, setBinToDelete] = useState<Bin | null>(null);
  const [formData, setFormData] = useState({
    locationName: '',
    address: '',
    status: 'Available' as Bin['status'],
    assignedDriver: 'none'
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [addAutocomplete, setAddAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [editAutocomplete, setEditAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const addAddressRef = useRef<HTMLInputElement>(null);
  const editAddressRef = useRef<HTMLInputElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupFormData, setPickupFormData] = useState({
    driverName: '',
    pickupDate: '',
    pickupTime: '',
    loadType: 'B - Good' as 'A - Excellent' | 'B - Good' | 'C - Fair',
    estimatedWeight: 0
  });
  const [pickupDate, setPickupDate] = useState<Date>();
  const [selectedBins, setSelectedBins] = useState<Set<string>>(new Set());
  const [isBulkAssignDialogOpen, setIsBulkAssignDialogOpen] = useState(false);
  const [bulkDriverName, setBulkDriverName] = useState('');
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [, setCurrentTime] = useState(new Date());

  // Update current time every minute to refresh "time since full" display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to calculate time since bin became full
  const getTimeSinceFull = (fullSince: string | undefined): string | null => {
    if (!fullSince) return null;
    
    const now = new Date();
    const fullTime = new Date(fullSince);
    const diffMs = now.getTime() - fullTime.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Get only active drivers
  const activeDrivers = getActiveDrivers();

  // Handle autocomplete load for add dialog
  const onAddAutocompleteLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    console.log('Add autocomplete loaded:', autocompleteInstance);
    setAddAutocomplete(autocompleteInstance);
    
    // Add additional event listeners to ensure clicks are captured
    autocompleteInstance.addListener('place_changed', onAddPlaceChanged);
  };

  // Handle autocomplete load for edit dialog
  const onEditAutocompleteLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    console.log('Edit autocomplete loaded:', autocompleteInstance);
    setEditAutocomplete(autocompleteInstance);
    
    // Add additional event listeners to ensure clicks are captured
    autocompleteInstance.addListener('place_changed', onEditPlaceChanged);
  };

  // Handle place selection for add dialog
  const onAddPlaceChanged = () => {
    // Prevent any default behaviors that might close the dialog
    if (addAutocomplete) {
      const place = addAutocomplete.getPlace();
      console.log('Place selected:', place);
      
      if (place && place.formatted_address && place.geometry && place.geometry.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        console.log('Setting address and location:', place.formatted_address, newLocation);
        setFormData(prev => ({ ...prev, address: place.formatted_address || '' }));
        setSelectedLocation(newLocation);
        
        // Blur the input to close the dropdown
        if (addAddressRef.current) {
          addAddressRef.current.blur();
        }
      } else {
        console.log('No formatted address or location found');
      }
    }
  };

  // Handle place selection for edit dialog
  const onEditPlaceChanged = (e?: Event) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (editAutocomplete) {
      const place = editAutocomplete.getPlace();
      console.log('Edit place selected:', place);
      
      if (place && place.formatted_address) {
        console.log('Setting edit address to:', place.formatted_address);
        setFormData(prev => ({ ...prev, address: place.formatted_address || '' }));
      } else {
        console.log('No formatted address found in edit');
      }
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectBin = (binId: string, event?: React.MouseEvent) => {
    const filteredBins = getFilteredAndSortedBins();
    const clickedIndex = filteredBins.findIndex(b => b.id === binId);
    
    if (event?.shiftKey && lastSelectedIndex !== null) {
      // Shift-click: select range
      const start = Math.min(lastSelectedIndex, clickedIndex);
      const end = Math.max(lastSelectedIndex, clickedIndex);
      const newSelection = new Set(selectedBins);
      
      for (let i = start; i <= end; i++) {
        newSelection.add(filteredBins[i].id);
      }
      
      setSelectedBins(newSelection);
    } else {
      // Regular click: toggle selection
      const newSelection = new Set(selectedBins);
      if (newSelection.has(binId)) {
        newSelection.delete(binId);
      } else {
        newSelection.add(binId);
      }
      setSelectedBins(newSelection);
      setLastSelectedIndex(clickedIndex);
    }
  };

  const handleSelectAll = () => {
    const filteredBins = getFilteredAndSortedBins();
    const uniqueFilteredIds = Array.from(new Set(filteredBins.map(bin => bin.id)));
    
    if (selectedBins.size === uniqueFilteredIds.length) {
      setSelectedBins(new Set());
    } else {
      const newSelection = new Set(uniqueFilteredIds);
      setSelectedBins(newSelection);
    }
    setLastSelectedIndex(null);
  };

  const handleBulkAssignDriver = () => {
    if (bulkDriverName && selectedBins.size > 0) {
      // Collect bin numbers that will be assigned
      const binsToAssign: string[] = [];
      
      selectedBins.forEach(binId => {
        const bin = bins.find(b => b.id === binId);
        if (bin) {
          updateBin(binId, { 
            pickupStatus: 'Scheduled',
            assignedDriver: bulkDriverName 
          });
          binsToAssign.push(bin.binNumber);
          
        }
      });
      
      // Update the driver's assignedBins array
      const driver = drivers.find(d => d.name === bulkDriverName);
      if (driver) {
        const updatedAssignedBins = Array.from(new Set([...driver.assignedBins, ...binsToAssign]));
        updateDriver(driver.id, { assignedBins: updatedAssignedBins });
      }
      
      setIsBulkAssignDialogOpen(false);
      setSelectedBins(new Set());
      setBulkDriverName('');
      setLastSelectedIndex(null);
    }
  };

  const getFilteredAndSortedBins = () => {
    // First filter by search query
    let filteredBins = bins;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredBins = bins.filter(bin => 
        bin.binNumber.toLowerCase().includes(query) ||
        bin.locationName.toLowerCase().includes(query) ||
        bin.address.toLowerCase().includes(query) ||
        bin.status.toLowerCase().includes(query) ||
        (bin.assignedDriver && bin.assignedDriver.toLowerCase().includes(query))
      );
    }
    
    // Then sort the filtered results
    if (!sortColumn) return filteredBins;
    
    return [...filteredBins].sort((a, b) => {
      let aValue = a[sortColumn as keyof Bin];
      let bValue = b[sortColumn as keyof Bin];
      
      // Convert to strings for comparison
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

  const generateBinNumber = () => {
    const maxBinNumber = bins.reduce((max, bin) => {
      const num = parseInt(bin.binNumber.replace('BIN', ''));
      return num > max ? num : max;
    }, 0);
    return `BIN${String(maxBinNumber + 1).padStart(3, '0')}`;
  };

  const handleAddBin = () => {
    // Use selected location coordinates if available, otherwise use default Toronto coordinates
    const coordinates = selectedLocation || { lat: 43.6532, lng: -79.3832 };
    
    let newBin: Bin = {
      id: String(bins.length + 1),
      binNumber: generateBinNumber(),
      locationName: formData.locationName,
      address: formData.address,
      status: formData.status,
      pickupStatus: 'Not Scheduled',
      lat: coordinates.lat,
      lng: coordinates.lng,
      createdDate: new Date().toISOString().split('T')[0]
    };

    // Handle file upload if a file was selected
    if (uploadedFile) {
      // In production, you would upload the file to your server/cloud storage
      // For now, we'll simulate storing the file information
      const fileUrl = URL.createObjectURL(uploadedFile);
      newBin = {
        ...newBin,
        contractFile: fileUrl,
        contractFileName: uploadedFile.name,
        contractUploadDate: new Date().toISOString().split('T')[0]
      };
    }

    // Add assigned driver if selected
    if (formData.assignedDriver && formData.assignedDriver !== 'none') {
      newBin = {
        ...newBin,
        assignedDriver: formData.assignedDriver
      };
      
      // Update the driver's assignedBins array
      const driver = drivers.find(d => d.name === formData.assignedDriver);
      if (driver) {
        const updatedAssignedBins = [...driver.assignedBins, generateBinNumber()];
        updateDriver(driver.id, { assignedBins: updatedAssignedBins });
      }
    }

    addBin(newBin);
    setIsAddDialogOpen(false);
    setFormData({ locationName: '', address: '', status: 'Available', assignedDriver: 'none' });
    setUploadedFile(null);
    setSelectedLocation(null);
  };

  const handleEditBin = () => {
    if (selectedBin) {
      const oldDriverName = selectedBin.assignedDriver;
      const newDriverName = formData.assignedDriver === 'none' ? undefined : formData.assignedDriver;
      
      let updatedBin = { 
        ...selectedBin, 
        ...formData,
        assignedDriver: newDriverName
      };
      
      // Update driver assignments if driver has changed
      if (oldDriverName !== newDriverName) {
        // Remove bin from old driver's assignedBins
        if (oldDriverName) {
          const oldDriver = drivers.find(d => d.name === oldDriverName);
          if (oldDriver) {
            const updatedBins = oldDriver.assignedBins.filter(bin => bin !== selectedBin.binNumber);
            updateDriver(oldDriver.id, { assignedBins: updatedBins });
          }
        }
        
        // Add bin to new driver's assignedBins
        if (newDriverName) {
          const newDriver = drivers.find(d => d.name === newDriverName);
          if (newDriver) {
            const updatedBins = Array.from(new Set([...newDriver.assignedBins, selectedBin.binNumber]));
            updateDriver(newDriver.id, { assignedBins: updatedBins });
          }
        }
      }
      
      // Handle file upload if a new file was selected
      if (uploadedFile) {
        // In production, you would upload the file to your server/cloud storage
        // For now, we'll simulate storing the file information
        const fileUrl = URL.createObjectURL(uploadedFile);
        updatedBin = {
          ...updatedBin,
          contractFile: fileUrl,
          contractFileName: uploadedFile.name,
          contractUploadDate: new Date().toISOString().split('T')[0]
        };
      }
      
      updateBin(selectedBin.id, updatedBin);
      setIsEditDialogOpen(false);
      setSelectedBin(null);
      setFormData({ locationName: '', address: '', status: 'Available', assignedDriver: 'none' });
      setUploadedFile(null);
    }
  };

  const handleDeleteBin = (bin: Bin) => {
    setBinToDelete(bin);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBin = () => {
    if (binToDelete) {
      // If bin was assigned to a driver, remove it from driver's assignedBins
      if (binToDelete.assignedDriver) {
        const driver = drivers.find(d => d.name === binToDelete.assignedDriver);
        if (driver) {
          const updatedBins = driver.assignedBins.filter(bin => bin !== binToDelete.binNumber);
          updateDriver(driver.id, { assignedBins: updatedBins });
        }
      }
      
      deleteBin(binToDelete.id);
      setIsDeleteDialogOpen(false);
      setBinToDelete(null);
    }
  };

  const handleSchedulePickup = (bin: Bin) => {
    setSelectedBin(bin);
    setPickupFormData({
      driverName: '',
      pickupDate: '',
      pickupTime: '',
      loadType: 'B - Good',
      estimatedWeight: 0
    });
    setPickupDate(undefined);
    setIsScheduleDialogOpen(true);
  };

  const handleConfirmSchedulePickup = () => {
    if (selectedBin && pickupDate) {
      // Update bin status and assign driver
      updateBin(selectedBin.id, { 
        pickupStatus: 'Scheduled',
        assignedDriver: pickupFormData.driverName 
      });
      
      
      setIsScheduleDialogOpen(false);
      setSelectedBin(null);
      setPickupDate(undefined);
    } else if (!pickupDate) {
      alert('Please select a pickup date.');
    }
  };

  const openEditDialog = (bin: Bin) => {
    setSelectedBin(bin);
    setFormData({
      locationName: bin.locationName,
      address: bin.address,
      status: bin.status,
      assignedDriver: bin.assignedDriver || 'none'
    });
    setUploadedFile(null);
    setIsEditDialogOpen(true);
  };

  const handleViewOnMap = (bin: Bin) => {
    setSelectedBin(bin);
    setIsMapDialogOpen(true);
  };

  const getStatusBadge = (status: Bin['status'], fullSince?: string) => {
    const statusStyles = {
      'Available': 'bg-green-100 text-green-800 border-green-200',
      'Almost Full': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Full': 'bg-red-100 text-red-800 border-red-200',
      'Unavailable': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const timeSinceFull = status === 'Full' ? getTimeSinceFull(fullSince) : null;
    
    return (
      <Badge 
        variant="outline" 
        className={statusStyles[status]}
      >
        {status}
        {timeSinceFull && (
          <span className="ml-1 font-normal">({timeSinceFull})</span>
        )}
      </Badge>
    );
  };


  if (isLoading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <div className="px-6 pt-10 pb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Bins</h1>
        <div className="flex gap-2">
          {selectedBins.size > 0 && (
            <>
              <Button 
                onClick={() => setIsBulkAssignDialogOpen(true)}
                variant="outline"
              >
                <Users className="w-4 h-4 mr-2" />
                Assign Driver ({selectedBins.size})
              </Button>
              <Button 
                onClick={() => {
                  setSelectedBins(new Set());
                  setLastSelectedIndex(null);
                }}
                variant="ghost"
                size="sm"
              >
                Clear Selection
              </Button>
            </>
          )}
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Bin
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search bins by number, location, address, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-gray-600">
            {searchQuery.trim() ? (
              <>Showing {getFilteredAndSortedBins().length} of {bins.length} bins</>
            ) : (
              <>{bins.length} bins total</>
            )}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:!bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={(() => {
                      const filteredBins = getFilteredAndSortedBins();
                      const uniqueFilteredIds = Array.from(new Set(filteredBins.map(bin => bin.id)));
                      return selectedBins.size === uniqueFilteredIds.length && uniqueFilteredIds.length > 0;
                    })()}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('binNumber')}
                >
                  <div className="flex items-center gap-1">
                    Bin Number
                    {getSortIcon('binNumber')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('locationName')}
                >
                  <div className="flex items-center gap-1">
                    Location Name
                    {getSortIcon('locationName')}
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
                    Assigned Driver
                    {getSortIcon('assignedDriver')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredAndSortedBins().map((bin, index) => {
                return (
                  <TableRow key={`${bin.id}-${bin.binNumber}-${index}`} className="select-none">
                    <TableCell>
                      <Checkbox
                        checked={selectedBins.has(bin.id)}
                        onCheckedChange={() => {
                          // Use onClick for proper event handling with shift key
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBin(bin.id, e);
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{bin.binNumber}</TableCell>
                    <TableCell>{bin.locationName}</TableCell>
                    <TableCell>{bin.address}</TableCell>
                    <TableCell>{getStatusBadge(bin.status, bin.fullSince)}</TableCell>
                    <TableCell>
                      <Select
                        value={bin.assignedDriver || 'unassigned'}
                        onValueChange={(value) => {
                          const oldDriverName = bin.assignedDriver;
                          const newDriverName = value === 'unassigned' ? undefined : value;
                          
                          // Update the bin
                          updateBin(bin.id, { assignedDriver: newDriverName });
                          
                          // Update driver assignments
                          if (oldDriverName && oldDriverName !== newDriverName) {
                            // Remove bin from old driver's assignedBins
                            const oldDriver = drivers.find(d => d.name === oldDriverName);
                            if (oldDriver) {
                              const updatedBins = oldDriver.assignedBins.filter(b => b !== bin.binNumber);
                              updateDriver(oldDriver.id, { assignedBins: updatedBins });
                            }
                          }
                          
                          if (newDriverName && newDriverName !== 'unassigned') {
                            // Add bin to new driver's assignedBins
                            const newDriver = drivers.find(d => d.name === newDriverName);
                            if (newDriver) {
                              const updatedBins = Array.from(new Set([...newDriver.assignedBins, bin.binNumber]));
                              updateDriver(newDriver.id, { assignedBins: updatedBins });
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">
                            <span className="text-red-600">Unassigned</span>
                          </SelectItem>
                          {activeDrivers.map(driver => (
                            <SelectItem key={driver.id} value={driver.name}>
                              {driver.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(bin)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSchedulePickup(bin)}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Schedule Pickup
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewOnMap(bin)}>
                            <MapPin className="mr-2 h-4 w-4" />
                            View on Map
                          </DropdownMenuItem>
                          {bin.contractFile && (
                            <DropdownMenuItem onClick={() => window.open(bin.contractFile, '_blank')}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Contract
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteBin(bin)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add Bin Dialog */}
      <LoadScript 
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
        libraries={['places']}
        loadingElement={<div />}
      >
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      >
        <DialogContent 
          className="z-[9999]"
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking on autocomplete dropdown
            const target = e.target as HTMLElement;
            if (target.closest('.pac-container')) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            // Prevent closing when interacting with autocomplete
            const target = e.target as HTMLElement;
            if (target.closest('.pac-container')) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Add New Bin</DialogTitle>
            <DialogDescription>
              Add a new donation bin to the system.
            </DialogDescription>
          </DialogHeader>
          
          {/* Show the bin number that will be assigned */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Bin Number: {generateBinNumber()}
              </span>
            </div>
          </div>
          <div className="space-y-4 px-1 py-1">
            <div>
              <Label htmlFor="location">Location Name</Label>
              <Input
                id="location"
                value={formData.locationName}
                onChange={(e) => setFormData({...formData, locationName: e.target.value})}
                placeholder="e.g., Community Center"
              />
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <div 
                className="relative" 
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <Autocomplete
                  onLoad={onAddAutocompleteLoad}
                  onPlaceChanged={onAddPlaceChanged}
                  options={{
                    componentRestrictions: { country: 'ca' },
                    fields: ['formatted_address', 'geometry']
                  }}
                >
                  <Input
                    ref={addAddressRef}
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    placeholder="Enter bin location address"
                    className="pl-10"
                    required
                  />
                </Autocomplete>
              </div>
            </div>
            <div>
              <Label htmlFor="add-status">Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value as Bin['status']})}
              >
                <SelectTrigger id="add-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Almost Full">Almost Full</SelectItem>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="add-driver">Assign Driver (Optional)</Label>
              <Select 
                value={formData.assignedDriver}
                onValueChange={(value) => setFormData({...formData, assignedDriver: value})}
              >
                <SelectTrigger id="add-driver">
                  <SelectValue placeholder="Select a driver (optional)" />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  <SelectItem value="none">No driver assigned</SelectItem>
                  {activeDrivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.name}>{driver.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="contract-upload-add">Location Agreement Contract (PDF)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    id="contract-upload-add"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type === 'application/pdf') {
                        setUploadedFile(file);
                      } else {
                        alert('Please select a PDF file only');
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('contract-upload-add')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                  <span className="text-sm text-gray-600">
                    {uploadedFile ? uploadedFile.name : 'No file selected'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Upload the signed location agreement contract (PDF format only)
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setFormData({ locationName: '', address: '', status: 'Available', assignedDriver: 'none' });
              setUploadedFile(null);
              setSelectedLocation(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddBin}>Add Bin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </LoadScript>

      {/* Edit Bin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Bin</DialogTitle>
            <DialogDescription>
              Update the bin details below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 px-1 py-1">
            <div>
              <Label htmlFor="edit-location">Location Name</Label>
              <Input
                id="edit-location"
                value={formData.locationName}
                onChange={(e) => setFormData({...formData, locationName: e.target.value})}
                placeholder="e.g., Community Center"
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <Input
                  ref={editAddressRef}
                  id="edit-address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Enter bin location address"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value as Bin['status']})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Almost Full">Almost Full</SelectItem>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedBin && (
              <div>
                <Label>Created Date</Label>
                <div className="px-3 py-2 border rounded-md bg-gray-50 text-sm text-gray-600">
                  {selectedBin.createdDate ? 
                    new Date(selectedBin.createdDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 
                    'Unknown'
                  }
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="edit-driver">Assigned Driver</Label>
              <Select 
                value={formData.assignedDriver}
                onValueChange={(value) => setFormData({...formData, assignedDriver: value})}
              >
                <SelectTrigger id="edit-driver">
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  <SelectItem value="none">No driver assigned</SelectItem>
                  {activeDrivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.name}>{driver.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="contract-upload">Location Agreement Contract (PDF)</Label>
              <div className="space-y-2">
                {selectedBin?.contractFile && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      Current: {selectedBin.contractFileName}
                    </span>
                    <a 
                      href={selectedBin.contractFile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm ml-auto"
                    >
                      View
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    id="contract-upload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type === 'application/pdf') {
                        setUploadedFile(file);
                      } else {
                        alert('Please select a PDF file only');
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('contract-upload')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                  <span className="text-sm text-gray-600">
                    {uploadedFile ? uploadedFile.name : 'No file selected'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Upload the signed location agreement contract (PDF format only)
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBin}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Pickup Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Pickup</DialogTitle>
            <DialogDescription>
              Schedule a pickup for {selectedBin?.binNumber} - {selectedBin?.locationName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1 py-1">
            <div>
              <Label htmlFor="pickup-driver">Assign Driver</Label>
              <Select 
                value={pickupFormData.driverName}
                onValueChange={(value) => setPickupFormData({...pickupFormData, driverName: value})}
              >
                <SelectTrigger id="pickup-driver">
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  {activeDrivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.name}>{driver.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pickup Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {pickupDate ? format(pickupDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={pickupDate}
                      onSelect={setPickupDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="pickup-time">Pickup Time</Label>
                <Input
                  id="pickup-time"
                  type="text"
                  placeholder="e.g., 10:00 AM"
                  value={pickupFormData.pickupTime}
                  onChange={(e) => setPickupFormData({...pickupFormData, pickupTime: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="pickup-load">Load Type</Label>
              <Select 
                value={pickupFormData.loadType}
                onValueChange={(value) => setPickupFormData({...pickupFormData, loadType: value as typeof pickupFormData.loadType})}
              >
                <SelectTrigger id="pickup-load">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A - Excellent">A - Excellent Quality</SelectItem>
                  <SelectItem value="B - Good">B - Good Quality</SelectItem>
                  <SelectItem value="C - Fair">C - Fair Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pickup-weight">Estimated Weight (kg)</Label>
              <Input
                id="pickup-weight"
                type="number"
                value={pickupFormData.estimatedWeight}
                onChange={(e) => setPickupFormData({...pickupFormData, estimatedWeight: Number(e.target.value)})}
                placeholder="Enter estimated weight"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSchedulePickup}>Schedule Pickup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View on Map Dialog */}
      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bin Location on Map</DialogTitle>
            <DialogDescription>
              {selectedBin?.binNumber} - {selectedBin?.locationName}
            </DialogDescription>
          </DialogHeader>
          <div className="h-96 w-full">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={selectedBin ? { lat: selectedBin.lat, lng: selectedBin.lng } : { lat: 43.6532, lng: -79.3832 }}
              zoom={15}
            >
              {selectedBin && (
                <Marker 
                  position={{ lat: selectedBin.lat, lng: selectedBin.lng }}
                  title={`${selectedBin.binNumber} - ${selectedBin.locationName}`}
                />
              )}
            </GoogleMap>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Bin Number:</span>
                <span>{selectedBin?.binNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Location:</span>
                <span>{selectedBin?.locationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Address:</span>
                <span className="text-right">{selectedBin?.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Status:</span>
                <span>{selectedBin && getStatusBadge(selectedBin.status, selectedBin.fullSince)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => {
                if (selectedBin) {
                  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedBin.lat},${selectedBin.lng}&destination_place_id=${encodeURIComponent(selectedBin.locationName)}`;
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bin
              {binToDelete && (
                <span className="font-semibold"> "{binToDelete.binNumber} - {binToDelete.locationName}"</span>
              )}
              {' '}from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setBinToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBin}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Bin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Assign Driver Dialog */}
      <Dialog open={isBulkAssignDialogOpen} onOpenChange={setIsBulkAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Assign Driver</DialogTitle>
            <DialogDescription>
              Assign a driver to {selectedBins.size} selected bin{selectedBins.size !== 1 ? 's' : ''}.
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
                  {activeDrivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.name}>{driver.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                This will schedule pickups for all selected bins with the assigned driver.
                The pickup dates can be adjusted individually later.
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
    </div>
  );
}

export default BinsManagement;