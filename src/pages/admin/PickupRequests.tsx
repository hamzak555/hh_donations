import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { usePickupRequests, PickupRequest } from '@/contexts/PickupRequestsContext';
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
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Clock,
  User,
  ChevronUp, 
  ChevronDown, 
  ArrowUpDown, 
  Search 
} from 'lucide-react';

function PickupRequests() {
  const [isLoading] = useState(false);
  const { pickupRequests, updatePickupRequest, deletePickupRequest, addPickupRequest } = usePickupRequests();
  
  console.log('PickupRequests admin page - Current requests:', pickupRequests);
  console.log('LocalStorage pickupRequests:', localStorage.getItem('pickupRequests'));
  
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<PickupRequest | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [editFormData, setEditFormData] = useState({
    status: 'Pending' as PickupRequest['status'],
    assignedDriver: '',
    adminNotes: ''
  });

  const drivers = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis'];

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
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredRequests = pickupRequests.filter(request => 
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

  const openEditDialog = (request: PickupRequest) => {
    setSelectedRequest(request);
    setEditFormData({
      status: request.status,
      assignedDriver: request.assignedDriver || '',
      adminNotes: request.adminNotes || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleEditRequest = () => {
    if (selectedRequest) {
      updatePickupRequest(selectedRequest.id, editFormData);
      setIsEditDialogOpen(false);
      setSelectedRequest(null);
    }
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

  const handleViewOnMap = (request: PickupRequest) => {
    setSelectedRequest(request);
    setIsMapDialogOpen(true);
  };

  const getStatusBadge = (status: PickupRequest['status']) => {
    const statusStyles = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-orange-100 text-orange-800 border-orange-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <div className="px-6 pt-10 pb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pickup Requests</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              // Manually check localStorage
              const stored = localStorage.getItem('pickupRequests');
              console.log('Current localStorage data:', stored);
              if (stored) {
                try {
                  const parsed = JSON.parse(stored);
                  console.log('Parsed data:', parsed);
                  console.log('Number of requests:', parsed.length);
                } catch (e) {
                  console.error('Error parsing localStorage data:', e);
                }
              }
            }}
          >
            Check Storage
          </Button>
          <Button 
            onClick={() => {
              // Add a test request
              const testRequest = {
                name: 'Test User',
                email: 'test@example.com',
                phone: '(416) 555-0000',
                address: '123 Test Street, Toronto, ON',
                date: new Date().toISOString().split('T')[0],
                time: '10:00 AM - 2:00 PM',
                additionalNotes: 'This is a test request',
                submittedAt: new Date().toISOString(),
                status: 'Pending' as const
              };
              addPickupRequest(testRequest);
              console.log('Added test request:', testRequest);
            }}
          >
            Add Test Request
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              console.log('Refreshing page...');
              window.location.reload();
            }}
          >
            Refresh
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
              placeholder="Search by name, email, phone, address, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-gray-600">
            {searchQuery.trim() ? (
              <>Showing {getFilteredAndSortedRequests().length} of {pickupRequests.length} requests</>
            ) : (
              <>{pickupRequests.length} requests total</>
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
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-1">
                    Contact
                    {getSortIcon('email')}
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
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Pickup Date
                    {getSortIcon('date')}
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
                  onClick={() => handleSort('assignedDriver')}
                >
                  <div className="flex items-center gap-1">
                    Driver
                    {getSortIcon('assignedDriver')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('submittedAt')}
                >
                  <div className="flex items-center gap-1">
                    Submitted
                    {getSortIcon('submittedAt')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredAndSortedRequests().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No pickup requests found. Submit a request from the frontend to see it here.
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredAndSortedRequests().map((request) => (
                <TableRow key={request.id}>
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
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{formatDate(request.date)}</div>
                      <div className="text-xs text-gray-500">{request.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    {request.assignedDriver || (
                      <span className="text-gray-400 text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(request.submittedAt)}</TableCell>
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
                        <DropdownMenuItem onClick={() => openEditDialog(request)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Status
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
                </TableRow>
              )))}
            </TableBody>
          </Table>
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

      {/* Edit Status Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Request</DialogTitle>
            <DialogDescription>
              Update the status and assignment for this pickup request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1 py-1">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={editFormData.status}
                onValueChange={(value) => setEditFormData({...editFormData, status: value as PickupRequest['status']})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="driver">Assigned Driver</Label>
              <Select 
                value={editFormData.assignedDriver}
                onValueChange={(value) => setEditFormData({...editFormData, assignedDriver: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {drivers.map(driver => (
                    <SelectItem key={driver} value={driver}>{driver}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <textarea
                id="adminNotes"
                value={editFormData.adminNotes}
                onChange={(e) => setEditFormData({...editFormData, adminNotes: e.target.value})}
                placeholder="Add internal notes about this request..."
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px] resize-vertical"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRequest}>Save Changes</Button>
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