import React, { useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useBins, BinLocation } from '@/contexts/BinsContext';
import { usePickups, Pickup } from '@/contexts/PickupsContext';
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
import { Plus, MoreHorizontal, Edit, Trash, MapPin, CalendarDays, FileText, Upload, ChevronUp, ChevronDown, ArrowUpDown, Search, Package } from 'lucide-react';
import { format } from 'date-fns';

// Use the shared Bin type from context
type Bin = BinLocation;

function BinsManagement() {
  const [isLoading] = useState(false);
  const { bins, addBin, updateBin, deleteBin } = useBins();
  const { addPickup } = usePickups();
  

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
    status: 'Available' as Bin['status']
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Mock drivers list - in production, this would come from your backend
  const drivers = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis'];

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
        bin.pickupStatus.toLowerCase().includes(query) ||
        (bin.lastPickup && bin.lastPickup.includes(query)) ||
        (bin.contractFileName && bin.contractFileName.toLowerCase().includes(query))
      );
    }
    
    // Then sort the filtered results
    if (!sortColumn) return filteredBins;
    
    return [...filteredBins].sort((a, b) => {
      let aValue = a[sortColumn as keyof Bin];
      let bValue = b[sortColumn as keyof Bin];
      
      // Handle special cases
      if (sortColumn === 'contractFile') {
        aValue = a.contractFile ? 'Yes' : 'No';
        bValue = b.contractFile ? 'Yes' : 'No';
      }
      
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
      lng: coordinates.lng
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

    addBin(newBin);
    setIsAddDialogOpen(false);
    setFormData({ locationName: '', address: '', status: 'Available' });
    setUploadedFile(null);
    setSelectedLocation(null);
  };

  const handleEditBin = () => {
    if (selectedBin) {
      let updatedBin = { ...selectedBin, ...formData };
      
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
      setFormData({ locationName: '', address: '', status: 'Available' });
      setUploadedFile(null);
    }
  };

  const handleDeleteBin = (bin: Bin) => {
    setBinToDelete(bin);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBin = () => {
    if (binToDelete) {
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
      // Update bin status
      updateBin(selectedBin.id, { pickupStatus: 'Scheduled' });
      
      // Create pickup record
      const newPickup: Pickup = {
        id: String(Date.now()), // Simple ID generation
        binNumber: selectedBin.binNumber,
        locationName: selectedBin.locationName,
        driverName: pickupFormData.driverName,
        pickupDate: format(pickupDate, 'yyyy-MM-dd'),
        pickupTime: pickupFormData.pickupTime,
        loadType: pickupFormData.loadType,
        status: 'Scheduled',
        estimatedWeight: pickupFormData.estimatedWeight
      };
      
      addPickup(newPickup);
      
      setIsScheduleDialogOpen(false);
      setSelectedBin(null);
      setPickupDate(undefined);
      console.log('Pickup scheduled:', newPickup);
    } else if (!pickupDate) {
      alert('Please select a pickup date.');
    }
  };

  const openEditDialog = (bin: Bin) => {
    setSelectedBin(bin);
    setFormData({
      locationName: bin.locationName,
      address: bin.address,
      status: bin.status
    });
    setUploadedFile(null);
    setIsEditDialogOpen(true);
  };

  const handleViewOnMap = (bin: Bin) => {
    setSelectedBin(bin);
    setIsMapDialogOpen(true);
  };

  const getStatusBadge = (status: Bin['status']) => {
    const statusStyles = {
      'Available': 'bg-green-100 text-green-800 border-green-200',
      'Unavailable': 'bg-gray-100 text-gray-800 border-gray-200',
      'Full': 'bg-red-100 text-red-800 border-red-200'
    };
    return (
      <Badge 
        variant="outline" 
        className={statusStyles[status]}
      >
        {status}
      </Badge>
    );
  };

  const getPickupBadge = (status: Bin['pickupStatus']) => {
    const statusStyles = {
      'Scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'Not Scheduled': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Completed': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return (
      <Badge 
        variant="outline" 
        className={statusStyles[status]}
      >
        {status}
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
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Bin
        </Button>
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
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('binNumber')}
                >
                  <div className="flex items-center gap-1">
                    Bin Number
                    {getSortIcon('binNumber')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('locationName')}
                >
                  <div className="flex items-center gap-1">
                    Location Name
                    {getSortIcon('locationName')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('address')}
                >
                  <div className="flex items-center gap-1">
                    Address
                    {getSortIcon('address')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('pickupStatus')}
                >
                  <div className="flex items-center gap-1">
                    Pickup Status
                    {getSortIcon('pickupStatus')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('contractFile')}
                >
                  <div className="flex items-center gap-1">
                    Contract
                    {getSortIcon('contractFile')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('lastPickup')}
                >
                  <div className="flex items-center gap-1">
                    Last Pickup
                    {getSortIcon('lastPickup')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {getFilteredAndSortedBins().map((bin) => (
              <TableRow key={bin.id}>
                <TableCell className="font-medium">{bin.binNumber}</TableCell>
                <TableCell>{bin.locationName}</TableCell>
                <TableCell>{bin.address}</TableCell>
                <TableCell>{getStatusBadge(bin.status)}</TableCell>
                <TableCell>{getPickupBadge(bin.pickupStatus)}</TableCell>
                <TableCell>
                  {bin.contractFile ? (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <a 
                        href={bin.contractFile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Contract
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No contract</span>
                  )}
                </TableCell>
                <TableCell>{bin.lastPickup || '-'}</TableCell>
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
            ))}
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
        onOpenChange={() => {
          // Completely disable auto-closing - only allow manual close via buttons
          console.log('Dialog close attempt blocked');
        }}
      >
        <DialogContent className="z-[9999]">
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
              setFormData({ locationName: '', address: '', status: 'Available' });
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
      <LoadScript 
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
        libraries={['places']}
        loadingElement={<div />}
      >
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
                <Autocomplete
                  onLoad={onEditAutocompleteLoad}
                  onPlaceChanged={onEditPlaceChanged}
                  options={{
                    componentRestrictions: { country: 'ca' },
                    fields: ['formatted_address', 'geometry']
                  }}
                >
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
                </Autocomplete>
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
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                  <SelectItem value="Full">Full</SelectItem>
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
      </LoadScript>

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
                  {drivers.map(driver => (
                    <SelectItem key={driver} value={driver}>{driver}</SelectItem>
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
      <LoadScript 
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
        libraries={['places']}
        loadingElement={<div />}
      >
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
                <span>{selectedBin && getStatusBadge(selectedBin.status)}</span>
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
      </LoadScript>

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
    </div>
  );
}

export default BinsManagement;