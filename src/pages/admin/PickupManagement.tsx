import React, { useState } from 'react';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useBins } from '@/contexts/BinsContext';
import { usePickups, Pickup } from '@/contexts/PickupsContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarDays, 
  Clock, 
  Truck, 
  Package, 
  MoreHorizontal, 
  Edit, 
  XCircle, 
  CheckCircle,
  Filter,
  Download,
  FileText,
  RotateCcw,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';


function PickupManagement() {
  const [isLoading] = useState(false);
  const { bins: contextBins } = useBins();
  const { getUpcomingPickups, getCompletedPickups, updatePickup, addPickup } = usePickups();
  
  const upcomingPickups = getUpcomingPickups();
  const completedPickups = getCompletedPickups();
  

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [filterDriver, setFilterDriver] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [formData, setFormData] = useState({
    binNumber: '',
    driverName: '',
    pickupDate: '',
    pickupTime: '',
    loadType: 'B - Good' as Pickup['loadType'],
    estimatedWeight: 0
  });
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [editDate, setEditDate] = useState<Date>();
  const [completeFormData, setCompleteFormData] = useState({
    actualWeight: 0,
    loadType: 'B - Good' as Pickup['loadType'],
    notes: ''
  });
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const drivers = ['John Smith', 'Sarah Johnson', 'Michael Brown'];
  // Get bin numbers from the actual bins in context
  const bins = contextBins.map(bin => bin.binNumber);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-gray-700" /> : 
      <ChevronDown className="w-4 h-4 text-gray-700" />;
  };

  const getSortedPickups = (pickups: Pickup[]) => {
    if (!sortColumn) return pickups;
    
    return [...pickups].sort((a, b) => {
      let aValue = a[sortColumn as keyof Pickup];
      let bValue = b[sortColumn as keyof Pickup];
      
      // Handle special cases
      if (sortColumn === 'estimatedWeight' || sortColumn === 'actualWeight') {
        const aWeight = sortColumn === 'actualWeight' ? (a.actualWeight || 0) : a.estimatedWeight;
        const bWeight = sortColumn === 'actualWeight' ? (b.actualWeight || 0) : b.estimatedWeight;
        return sortDirection === 'asc' 
          ? (aWeight - bWeight)
          : (bWeight - aWeight);
      }
      
      // Convert to strings for comparison
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      
      if (sortDirection === 'asc') {
        return (aValue as string).localeCompare(bValue as string);
      } else {
        return (bValue as string).localeCompare(aValue as string);
      }
    });
  };

  const handleSchedulePickup = () => {
    if (!scheduleDate) {
      alert('Please select a pickup date.');
      return;
    }

    // Find the actual bin to get its location name
    const selectedBin = contextBins.find(bin => bin.binNumber === formData.binNumber);
    const newPickup: Pickup = {
      id: String(Date.now()),
      binNumber: formData.binNumber,
      locationName: selectedBin ? selectedBin.locationName : 'Location ' + formData.binNumber,
      driverName: formData.driverName,
      pickupDate: format(scheduleDate, 'yyyy-MM-dd'),
      pickupTime: formData.pickupTime,
      loadType: formData.loadType,
      status: 'Scheduled',
      estimatedWeight: formData.estimatedWeight
    };
    addPickup(newPickup);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditPickup = () => {
    if (selectedPickup && editDate) {
      const updatedFormData = {
        ...formData,
        pickupDate: format(editDate, 'yyyy-MM-dd')
      };
      updatePickup(selectedPickup.id, updatedFormData);
      setIsEditDialogOpen(false);
      setSelectedPickup(null);
      resetForm();
    }
  };

  const handleMarkComplete = (pickup: Pickup) => {
    setSelectedPickup(pickup);
    setCompleteFormData({
      actualWeight: pickup.estimatedWeight,
      loadType: pickup.loadType,
      notes: pickup.notes || ''
    });
    setIsCompleteDialogOpen(true);
  };

  const handleConfirmComplete = () => {
    if (selectedPickup) {
      updatePickup(selectedPickup.id, {
        status: 'Completed' as const,
        actualWeight: completeFormData.actualWeight,
        loadType: completeFormData.loadType,
        notes: completeFormData.notes
      });
      setIsCompleteDialogOpen(false);
      setSelectedPickup(null);
    }
  };

  const handleMarkIncomplete = (pickup: Pickup) => {
    updatePickup(pickup.id, {
      status: 'Scheduled' as const,
      actualWeight: undefined
    });
  };

  const handleCancelPickup = (id: string) => {
    updatePickup(id, { status: 'Cancelled' as const });
  };

  const openEditDialog = (pickup: Pickup) => {
    setSelectedPickup(pickup);
    setFormData({
      binNumber: pickup.binNumber,
      driverName: pickup.driverName,
      pickupDate: pickup.pickupDate,
      pickupTime: pickup.pickupTime,
      loadType: pickup.loadType,
      estimatedWeight: pickup.estimatedWeight
    });
    // Parse existing date for the calendar
    setEditDate(pickup.pickupDate ? new Date(pickup.pickupDate) : undefined);
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      binNumber: '',
      driverName: '',
      pickupDate: '',
      pickupTime: '',
      loadType: 'B - Good',
      estimatedWeight: 0
    });
    setScheduleDate(undefined);
    setEditDate(undefined);
  };

  const getStatusBadge = (status: Pickup['status']) => {
    const statusStyles = {
      'Scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
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

  const getLoadTypeBadge = (loadType: Pickup['loadType']) => {
    const color = loadType.startsWith('A') ? 'text-green-600' : 
                  loadType.startsWith('B') ? 'text-yellow-600' : 'text-orange-600';
    return <span className={`font-medium ${color}`}>{loadType}</span>;
  };

  const filteredUpcoming = getSortedPickups(upcomingPickups.filter(pickup => 
    filterDriver === 'all' || pickup.driverName === filterDriver
  ));

  const filteredCompleted = getSortedPickups(completedPickups.filter(pickup => {
    const driverMatch = filterDriver === 'all' || pickup.driverName === filterDriver;
    const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';
    const dateMatch = (!startDateStr || pickup.pickupDate >= startDateStr) &&
                      (!endDateStr || pickup.pickupDate <= endDateStr);
    return driverMatch && dateMatch;
  }));

  if (isLoading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <div className="px-6 pt-10 pb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bin Pickups</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <CalendarDays className="w-4 h-4 mr-2" />
            Schedule Pickup
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Driver</Label>
              <Select value={filterDriver} onValueChange={setFilterDriver}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drivers</SelectItem>
                  {drivers.map(driver => (
                    <SelectItem key={driver} value={driver}>{driver}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Date Range (Start)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setDateRange(prev => ({ ...prev, start: date ? format(date, 'yyyy-MM-dd') : '' }));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <Label>Date Range (End)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setDateRange(prev => ({ ...prev, end: date ? format(date, 'yyyy-MM-dd') : '' }));
                    }}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">
            Upcoming Pickups ({filteredUpcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed Pickups ({filteredCompleted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
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
                        Location
                        {getSortIcon('locationName')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('driverName')}
                    >
                      <div className="flex items-center gap-1">
                        Driver Assigned
                        {getSortIcon('driverName')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('pickupDate')}
                    >
                      <div className="flex items-center gap-1">
                        Pickup Date & Time
                        {getSortIcon('pickupDate')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('loadType')}
                    >
                      <div className="flex items-center gap-1">
                        Load Type
                        {getSortIcon('loadType')}
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
                      onClick={() => handleSort('estimatedWeight')}
                    >
                      <div className="flex items-center gap-1">
                        Est. Weight (kg)
                        {getSortIcon('estimatedWeight')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredUpcoming.map((pickup) => (
                  <TableRow key={pickup.id}>
                    <TableCell className="font-medium">{pickup.binNumber}</TableCell>
                    <TableCell>{pickup.locationName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        {pickup.driverName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {pickup.pickupDate}
                        <Clock className="w-4 h-4 text-gray-400 ml-2" />
                        {pickup.pickupTime}
                      </div>
                    </TableCell>
                    <TableCell>{getLoadTypeBadge(pickup.loadType)}</TableCell>
                    <TableCell>{getStatusBadge(pickup.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-gray-400" />
                        {pickup.estimatedWeight} kg
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleMarkComplete(pickup)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(pickup)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCancelPickup(pickup.id)}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
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
        </TabsContent>

        <TabsContent value="completed">
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
                        Location
                        {getSortIcon('locationName')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('driverName')}
                    >
                      <div className="flex items-center gap-1">
                        Driver
                        {getSortIcon('driverName')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('pickupDate')}
                    >
                      <div className="flex items-center gap-1">
                        Pickup Date & Time
                        {getSortIcon('pickupDate')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('loadType')}
                    >
                      <div className="flex items-center gap-1">
                        Load Type
                        {getSortIcon('loadType')}
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
                      onClick={() => handleSort('estimatedWeight')}
                    >
                      <div className="flex items-center gap-1">
                        Est. Weight (kg)
                        {getSortIcon('estimatedWeight')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('actualWeight')}
                    >
                      <div className="flex items-center gap-1">
                        Actual Weight (kg)
                        {getSortIcon('actualWeight')}
                      </div>
                    </TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredCompleted.map((pickup) => (
                  <TableRow key={pickup.id}>
                    <TableCell className="font-medium">{pickup.binNumber}</TableCell>
                    <TableCell>{pickup.locationName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        {pickup.driverName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {pickup.pickupDate}
                        <Clock className="w-4 h-4 text-gray-400 ml-2" />
                        {pickup.pickupTime}
                      </div>
                    </TableCell>
                    <TableCell>{getLoadTypeBadge(pickup.loadType)}</TableCell>
                    <TableCell>{getStatusBadge(pickup.status)}</TableCell>
                    <TableCell>{pickup.estimatedWeight} kg</TableCell>
                    <TableCell className="font-medium">
                      {pickup.actualWeight ? `${pickup.actualWeight} kg` : '-'}
                    </TableCell>
                    <TableCell>
                      {pickup.notes ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-pointer">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{pickup.notes}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-gray-400 text-sm">No notes</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleMarkIncomplete(pickup)}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Mark Incomplete
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
        </TabsContent>
      </Tabs>

      {/* Schedule Pickup Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Pickup</DialogTitle>
            <DialogDescription>
              Schedule a pickup for a donation bin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1 py-1">
            <div>
              <Label htmlFor="bin">Bin Number</Label>
              <Select 
                value={formData.binNumber}
                onValueChange={(value) => setFormData({...formData, binNumber: value})}
              >
                <SelectTrigger id="bin">
                  <SelectValue placeholder="Select a bin" />
                </SelectTrigger>
                <SelectContent>
                  {bins.map(bin => (
                    <SelectItem key={bin} value={bin}>{bin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="driver">Assign Driver</Label>
              <Select 
                value={formData.driverName}
                onValueChange={(value) => setFormData({...formData, driverName: value})}
              >
                <SelectTrigger id="driver">
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
                      {scheduleDate ? format(scheduleDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
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
                <Label htmlFor="time">Pickup Time</Label>
                <Input
                  id="time"
                  type="text"
                  placeholder="e.g., 10:00 AM"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({...formData, pickupTime: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="load">Load Type</Label>
              <Select 
                value={formData.loadType}
                onValueChange={(value) => setFormData({...formData, loadType: value as Pickup['loadType']})}
              >
                <SelectTrigger id="load">
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
              <Label htmlFor="weight">Estimated Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.estimatedWeight}
                onChange={(e) => setFormData({...formData, estimatedWeight: Number(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedulePickup}>Schedule Pickup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pickup Dialog - Similar structure to Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pickup</DialogTitle>
            <DialogDescription>
              Update pickup details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1 py-1">
            <div>
              <Label htmlFor="edit-bin">Bin Number</Label>
              <Select 
                value={formData.binNumber}
                onValueChange={(value) => setFormData({...formData, binNumber: value})}
              >
                <SelectTrigger id="edit-bin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bins.map(bin => (
                    <SelectItem key={bin} value={bin}>{bin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-driver">Driver</Label>
              <Select 
                value={formData.driverName}
                onValueChange={(value) => setFormData({...formData, driverName: value})}
              >
                <SelectTrigger id="edit-driver">
                  <SelectValue />
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
                      {editDate ? format(editDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={setEditDate}
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
                <Label htmlFor="edit-time">Pickup Time</Label>
                <Input
                  id="edit-time"
                  type="text"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({...formData, pickupTime: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-load">Load Type</Label>
              <Select 
                value={formData.loadType}
                onValueChange={(value) => setFormData({...formData, loadType: value as Pickup['loadType']})}
              >
                <SelectTrigger id="edit-load">
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
              <Label htmlFor="edit-weight">Estimated Weight (kg)</Label>
              <Input
                id="edit-weight"
                type="number"
                value={formData.estimatedWeight}
                onChange={(e) => setFormData({...formData, estimatedWeight: Number(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPickup}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Pickup Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Pickup</DialogTitle>
            <DialogDescription>
              Confirm the pickup details for {selectedPickup?.binNumber} - {selectedPickup?.locationName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1 py-1">
            <div>
              <Label htmlFor="complete-weight">Actual Weight (kg)</Label>
              <Input
                id="complete-weight"
                type="number"
                value={completeFormData.actualWeight}
                onChange={(e) => setCompleteFormData({...completeFormData, actualWeight: Number(e.target.value)})}
                placeholder="Enter actual weight"
              />
            </div>
            <div>
              <Label htmlFor="complete-load">Final Load Type</Label>
              <Select 
                value={completeFormData.loadType}
                onValueChange={(value) => setCompleteFormData({...completeFormData, loadType: value as Pickup['loadType']})}
              >
                <SelectTrigger id="complete-load">
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
              <Label htmlFor="complete-notes">Notes (Optional)</Label>
              <Input
                id="complete-notes"
                type="text"
                value={completeFormData.notes}
                onChange={(e) => setCompleteFormData({...completeFormData, notes: e.target.value})}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmComplete}>Complete Pickup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PickupManagement;