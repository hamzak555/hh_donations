import React, { useState } from 'react';
import { useDrivers, Driver } from '@/contexts/DriversContextSupabase';
import { useBins } from '@/contexts/BinsContextSupabase';
import LoadingSkeleton from '@/components/LoadingSkeleton';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MoreHorizontal, Edit, Trash, Phone, Mail, Truck, ChevronUp, ChevronDown, ArrowUpDown, Package, MapPin, Key, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Pickup {
  id: string;
  binNumber: string;
  locationName: string;
  pickupDate: string;
  pickupTime: string;
  status: 'Upcoming' | 'Completed' | 'In Progress';
  loadType: 'A - Excellent' | 'B - Good' | 'C - Fair';
  estimatedWeight: number;
  actualWeight?: number;
}

function DriversManagement() {
  const [isLoading] = useState(false);
  const { drivers, setDrivers, addDriver: addDriverToContext, updateDriver: updateDriverInContext, deleteDriver: deleteDriverFromContext, generateCredentials, changePassword } = useDrivers();
  const { bins, updateBin } = useBins();
  
  // Remove the problematic sync - we'll handle consistency in the action handlers instead

  // Mock pickup data for each driver
  const driverPickups: Record<string, Pickup[]> = {
    '1': [
      {
        id: 'p1',
        binNumber: 'BIN001',
        locationName: 'Community Center',
        pickupDate: '2024-01-25',
        pickupTime: '10:00 AM',
        status: 'Upcoming',
        loadType: 'B - Good',
        estimatedWeight: 45
      },
      {
        id: 'p2',
        binNumber: 'BIN002',
        locationName: 'Shopping Mall',
        pickupDate: '2024-01-20',
        pickupTime: '2:00 PM',
        status: 'Completed',
        loadType: 'A - Excellent',
        estimatedWeight: 38,
        actualWeight: 42
      }
    ],
    '2': [
      {
        id: 'p3',
        binNumber: 'BIN003',
        locationName: 'Public Library',
        pickupDate: '2024-01-26',
        pickupTime: '11:30 AM',
        status: 'Upcoming',
        loadType: 'B - Good',
        estimatedWeight: 32
      },
      {
        id: 'p4',
        binNumber: 'BIN003',
        locationName: 'Public Library',
        pickupDate: '2024-01-18',
        pickupTime: '9:00 AM',
        status: 'Completed',
        loadType: 'C - Fair',
        estimatedWeight: 28,
        actualWeight: 30
      }
    ],
    '3': [
      {
        id: 'p5',
        binNumber: 'BIN004',
        locationName: 'Recreation Center',
        pickupDate: '2024-01-24',
        pickupTime: '8:30 AM',
        status: 'In Progress',
        loadType: 'A - Excellent',
        estimatedWeight: 52
      },
      {
        id: 'p6',
        binNumber: 'BIN005',
        locationName: 'School Campus',
        pickupDate: '2024-01-22',
        pickupTime: '1:00 PM',
        status: 'Completed',
        loadType: 'B - Good',
        estimatedWeight: 40,
        actualWeight: 38
      }
    ],
    '4': []
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  // Store passwords temporarily in memory for copy functionality (cleared on page refresh)
  const [driverPasswords, setDriverPasswords] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active' as Driver['status']
  });
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortedDrivers = () => {
    if (!sortColumn) return drivers;
    
    return [...drivers].sort((a, b) => {
      let aValue = a[sortColumn as keyof Driver];
      let bValue = b[sortColumn as keyof Driver];
      
      // Handle special cases
      
      if (sortColumn === 'assignedBins') {
        aValue = a.assignedBins.length;
        bValue = b.assignedBins.length;
        return sortDirection === 'asc' 
          ? (aValue as number - (bValue as number))
          : ((bValue as number) - (aValue as number));
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

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-gray-700" /> : 
      <ChevronDown className="w-4 h-4 text-gray-700" />;
  };

  // Generate a proper UUID for Supabase
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleAddDriver = () => {
    const newDriver: Driver = {
      id: generateUUID(), // Generate proper UUID for Supabase
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      assignedBins: [],
      status: 'Active',
      totalPickups: 0
    };
    addDriverToContext(newDriver);
    setIsAddDialogOpen(false);
    setFormData({ name: '', email: '', phone: '', status: 'Active' });
    setExpandedDriver(null); // Clear any expanded driver
  };

  const handleEditDriver = () => {
    if (selectedDriver) {
      // If marking driver as inactive, unassign from all bins
      if (formData.status === 'Inactive' && selectedDriver.status === 'Active' && selectedDriver.assignedBins.length > 0) {
        const driverName = selectedDriver.name;
        bins.forEach(bin => {
          if (bin.assignedDriver === driverName) {
            updateBin(bin.id, { assignedDriver: undefined });
          }
        });
        // Clear assigned bins for the driver
        updateDriverInContext(selectedDriver.id, { ...formData, assignedBins: [] });
      } else {
        updateDriverInContext(selectedDriver.id, formData);
      }
      setIsEditDialogOpen(false);
      setSelectedDriver(null);
      setFormData({ name: '', email: '', phone: '', status: 'Active' });
    }
  };


  const handleDeleteDriver = (driver: Driver) => {
    setDriverToDelete(driver);
    setIsDeleteDialogOpen(true);
  };

  const handleGenerateCredentials = async (driver: Driver) => {
    // Check if driver has an email address
    if (!driver.email || driver.email.trim() === '') {
      alert('This driver does not have an email address. Please edit the driver and add an email address first.');
      return;
    }
    
    try {
      const credentials = await generateCredentials(driver.id);
      setGeneratedCredentials(credentials);
      setSelectedDriver(driver);
      setIsCredentialsDialogOpen(true);
      // Store the password temporarily for copy functionality
      setDriverPasswords(prev => ({ ...prev, [driver.id]: credentials.password }));
    } catch (error) {
      console.error('Failed to generate credentials:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate credentials');
    }
  };

  const copyToClipboard = (text: string, label?: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label || 'Text'} copied to clipboard`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const handleChangePassword = (driver: Driver) => {
    if (!driver.email || driver.email.trim() === '') {
      alert('This driver does not have an email address.');
      return;
    }
    
    setSelectedDriver(driver);
    setNewPassword('');
    setIsChangePasswordDialogOpen(true);
  };

  const confirmChangePassword = async () => {
    if (!selectedDriver || !selectedDriver.email) return;
    
    try {
      // Generate new password or use the one provided
      const password = newPassword || generateRandomPassword();
      
      // Use the context's changePassword function to update in Supabase
      const credentials = await changePassword(selectedDriver.id, password);
      
      // Show the new credentials
      setGeneratedCredentials(credentials);
      setIsChangePasswordDialogOpen(false);
      setIsCredentialsDialogOpen(true);
      // Store the password temporarily for copy functionality
      setDriverPasswords(prev => ({ ...prev, [selectedDriver.id]: password }));
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  // Helper function to generate random password
  const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const confirmDeleteDriver = () => {
    if (driverToDelete) {
      // Unassign driver from all bins
      if (driverToDelete.assignedBins.length > 0) {
        const driverName = driverToDelete.name;
        bins.forEach(bin => {
          if (bin.assignedDriver === driverName) {
            updateBin(bin.id, { assignedDriver: undefined });
          }
        });
      }
      deleteDriverFromContext(driverToDelete.id);
      setIsDeleteDialogOpen(false);
      setDriverToDelete(null);
      setExpandedDriver(null); // Clear any expanded driver
    }
  };

  const openEditDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      status: driver.status
    });
    setIsEditDialogOpen(true);
  };


  const getStatusBadge = (status: Driver['status']) => {
    const statusStyles = {
      'Active': 'bg-green-100 text-green-800 border-green-200',
      'Inactive': 'bg-gray-100 text-gray-800 border-gray-200'
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

  const getPickupStatusBadge = (status: Pickup['status']) => {
    const statusStyles = {
      'Upcoming': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-orange-100 text-orange-800 border-orange-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200'
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
    <div className="px-4 sm:px-6 lg:px-8 pt-10 pb-6 w-full min-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Drivers</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Driver
        </Button>
      </div>

      {/* Drivers Table */}
      <Card className="w-full mb-6">
        <div className="p-6">
          <div className="w-full overflow-x-auto">
            <Table 
              className="w-full table-fixed" 
              style={{
                tableLayout: 'fixed', 
                width: '100%', 
                minWidth: '1200px'
              }}
            >
            <TableHeader>
              <TableRow style={{width: '100%'}} className="hover:bg-transparent">
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                  style={{width: '20%'}}
                >
                  <div className="flex items-center gap-1">
                    Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead style={{width: '20%'}}>Email</TableHead>
                <TableHead style={{width: '15%'}}>Phone</TableHead>
                <TableHead style={{width: '12%'}}>Login Status</TableHead>
                <TableHead style={{width: '15%'}}>Password</TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('assignedBins')}
                  style={{width: '18%'}}
                >
                  <div className="flex items-center gap-1">
                    Assigned Bins
                    {getSortIcon('assignedBins')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('status')}
                  style={{width: '10%'}}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead className="text-right" style={{width: '5%'}}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {getSortedDrivers().map((driver, index) => {
              const driverPickupList = driverPickups[driver.id] || [];
              const upcomingPickups = driverPickupList.filter(p => p.status === 'Upcoming' || p.status === 'In Progress');
              const completedPickups = driverPickupList.filter(p => p.status === 'Completed');
              const isExpanded = expandedDriver !== null && expandedDriver === driver.id;
              
              return (
                <React.Fragment key={driver.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-gray-50" 
                    style={{width: '100%'}}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedDriver(prevExpanded => {
                        // Use strict comparison and ensure same type
                        const newValue = (prevExpanded === driver.id) ? null : driver.id;
                        return newValue;
                      });
                    }}
                  >
                    <TableCell className="font-medium" style={{width: '20%'}}>
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                        {driver.name}
                      </div>
                    </TableCell>
                    <TableCell style={{width: '20%'}}>
                      <div className="flex items-center gap-2 text-sm">
                        {driver.email && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(driver.email, 'Email');
                            }}
                            title="Copy email"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                        <div className="flex-1 min-w-0">
                          {driver.email || <span className="text-red-500 italic">No email</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell style={{width: '15%'}}>
                      <div className="text-sm">
                        {driver.phone}
                      </div>
                    </TableCell>
                    <TableCell style={{width: '12%'}}>
                      {driver.hasCredentials ? (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <Key className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                          No Login
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell style={{width: '15%'}}>
                      {driver.hasCredentials ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Copy the password if we have it stored temporarily
                              const password = driverPasswords[driver.id];
                              if (password) {
                                copyToClipboard(password, 'Password');
                              } else {
                                copyToClipboard('Password not available - use Change Password to generate a new one', 'Notice');
                              }
                            }}
                            title="Copy current password info"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-gray-500 font-mono">••••••••••••</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No password set</span>
                      )}
                    </TableCell>
                    <TableCell style={{width: '18%'}}>
                      {driver.assignedBins.length > 0 ? (
                        <div className="flex flex-wrap gap-1 items-center">
                          {driver.assignedBins.slice(0, 2).map(bin => (
                            <Badge key={bin} variant="outline">{bin}</Badge>
                          ))}
                          {driver.assignedBins.length > 2 && (
                            <span className="text-sm text-gray-600 font-medium">
                              +{driver.assignedBins.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">None assigned</span>
                      )}
                    </TableCell>
                    <TableCell style={{width: '10%'}}>{getStatusBadge(driver.status)}</TableCell>
                    <TableCell className="text-right" style={{width: '5%'}} onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(driver)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {!driver.hasCredentials ? (
                            <DropdownMenuItem onClick={() => handleGenerateCredentials(driver)}>
                              <Key className="mr-2 h-4 w-4" />
                              Generate Credentials
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleChangePassword(driver)}>
                              <Key className="mr-2 h-4 w-4" />
                              Change Password
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteDriver(driver)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`expanded-${driver.id}`} style={{width: '100%'}}>
                      <TableCell colSpan={8} className="p-0" style={{width: '100%'}}>
                        <div className="bg-gray-50 p-4">
                          {driver.assignedBins.length > 0 ? (
                            <div>
                              <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                <Package className="w-4 h-4 text-gray-600" />
                                Assigned Bins ({driver.assignedBins.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {driver.assignedBins.map(binNumber => {
                                  const bin = bins.find(b => b.binNumber === binNumber);
                                  if (!bin) return null;
                                  
                                  const getStatusColor = (status: string) => {
                                    switch(status) {
                                      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
                                      case 'Almost Full': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                                      case 'Full': return 'bg-red-100 text-red-800 border-red-200';
                                      case 'Unavailable': return 'bg-gray-100 text-gray-800 border-gray-200';
                                      default: return 'bg-gray-100 text-gray-800 border-gray-200';
                                    }
                                  };
                                  
                                  return (
                                    <div key={binNumber} className="border rounded-lg p-3 bg-white">
                                      <div className="flex justify-between items-start mb-2">
                                        <div>
                                          <span className="font-semibold text-sm">{bin.binNumber}</span>
                                          <Badge 
                                            variant="outline" 
                                            className={`ml-2 text-xs ${getStatusColor(bin.status)}`}
                                          >
                                            {bin.status}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-600 space-y-1">
                                        <div className="font-medium">{bin.locationName}</div>
                                        <div className="flex items-start gap-1">
                                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                          <span className="break-words">{bin.address}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 italic text-sm">
                              No bins assigned to this driver
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
            </TableBody>
            </Table>
          </div>
        </div>
      </Card>


      {/* Add Driver Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>
              Add a new driver to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1 py-1">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., John Smith"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="e.g., john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="e.g., (416) 555-0123"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDriver}>Add Driver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>
              Update the driver details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1 py-1">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., John Smith"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="e.g., john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="e.g., (416) 555-0123"
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value as Driver['status']})}
              >
                <SelectTrigger id="edit-status" className="border border-gray-200 rounded-full px-3 py-1 focus:ring-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {formData.status === 'Inactive' && selectedDriver?.status === 'Active' && selectedDriver?.assignedBins.length > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> Marking this driver as inactive will unassign them from {selectedDriver.assignedBins.length} bin{selectedDriver.assignedBins.length > 1 ? 's' : ''}.
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDriver}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>
                  This action cannot be undone. This will permanently delete the driver
                  {driverToDelete && (
                    <span className="font-semibold"> "{driverToDelete.name}"</span>
                  )}
                  {' '}and remove them from the system.
                </p>
                {driverToDelete && driverToDelete.assignedBins.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> This driver is currently assigned to {driverToDelete.assignedBins.length} bin{driverToDelete.assignedBins.length > 1 ? 's' : ''}. 
                      Deleting this driver will unassign them from all bins.
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setDriverToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDriver}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Driver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Credentials Dialog */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Driver Login Credentials Generated</DialogTitle>
            <DialogDescription>
              Save these credentials securely. The driver can use them to log in and view their assigned routes.
            </DialogDescription>
          </DialogHeader>
          {generatedCredentials && selectedDriver && (
            <div className="space-y-4 px-1 py-1">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-3">
                  <strong>Important:</strong> Share these credentials securely with {selectedDriver.name}. 
                  The password can be changed after first login.
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Email (Username)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={generatedCredentials.email} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedCredentials.email, 'Email')}
                      title="Copy email"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Temporary Password</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={generatedCredentials.password} 
                      readOnly 
                      className="font-mono text-sm"
                      type="text"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedCredentials.password, 'Password')}
                      title="Copy password"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Driver Dashboard Access:</strong>
                  <br />• View assigned bin routes
                  <br />• View assigned pickup routes
                  <br />• Update route status
                  <br />• View route details and navigation
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => {
                setIsCredentialsDialogOpen(false);
                setGeneratedCredentials(null);
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Driver Password</DialogTitle>
            <DialogDescription>
              Generate a new password for {selectedDriver?.name}. Leave blank to auto-generate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1 py-1">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Current Email:</strong> {selectedDriver?.email}
              </p>
            </div>
            
            <div>
              <Label htmlFor="new-password">New Password (Optional)</Label>
              <Input
                id="new-password"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to auto-generate"
              />
              <p className="text-xs text-gray-500 mt-1">
                If left blank, a secure random password will be generated.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsChangePasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmChangePassword}>
              {newPassword ? 'Set Password' : 'Generate New Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DriversManagement;