import React, { useState, useRef } from 'react';
import { usePartnerApplications, DocumentEntry } from '@/contexts/PartnerApplicationsContextSupabase';
import { useBins } from '@/contexts/BinsContextSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building,
  Mail,
  Phone,
  Calendar,
  Users,
  Package,
  Truck,
  AlertCircle,
  FileText,
  Globe,
  MessageSquare,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  MapPin,
  X,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Image,
  File,
  MoreHorizontal,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';

const PartnerApplications = () => {
  const { applications, updateApplicationStatus, updateApplication, deleteApplication, addNoteToTimeline, assignBinToPartner, assignMultipleBinsToPartner, removeBinFromPartner, addDocuments, deleteDocument } = usePartnerApplications();
  const { bins } = useBins();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'reviewing' | 'approved' | 'rejected' | 'archived'>('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'approved' | 'rejected' | 'reviewing' | 'archived'>('reviewing');
  const [hoverCardNotes, setHoverCardNotes] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAssignBinsDialogOpen, setIsAssignBinsDialogOpen] = useState(false);
  const [selectedPartnerForBins, setSelectedPartnerForBins] = useState<any>(null);
  const [selectedBinsForAssignment, setSelectedBinsForAssignment] = useState<string[]>([]);
  const [binSearchTerm, setBinSearchTerm] = useState('');
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [detailsTabValue, setDetailsTabValue] = useState<string>('info');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{id: string, name: string} | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<any>(null);
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{
    isOpen: boolean;
    applicationId: string;
    applicationName: string;
    currentStatus: string;
    newStatus: string;
  } | null>(null);

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

  const sortedAndFilteredApplications = React.useMemo(() => {
    // First filter by tab
    let filtered = applications.filter(app => {
      if (activeTab === 'all') return true;
      return app.status === activeTab;
    });
    
    // Then filter by search
    filtered = filtered.filter(app => {
      if (!searchTerm.trim()) return true;
      
      const matchesSearch = 
        app.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Then sort
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        // Handle nested address fields
        if (sortColumn === 'location') {
          aValue = `${a.address.city}, ${a.address.state}`;
          bValue = `${b.address.city}, ${b.address.state}`;
        } else {
          aValue = a[sortColumn as keyof typeof a];
          bValue = b[sortColumn as keyof typeof b];
        }

        // Handle null/undefined values
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Compare values
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // For dates and numbers
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [applications, searchTerm, activeTab, sortColumn, sortDirection]);

  const handleStatusUpdate = () => {
    if (selectedApplication) {
      updateApplicationStatus(selectedApplication, newStatus, reviewNotes);
      setReviewModalOpen(false);
      setReviewNotes('');
    }
  };

  const handleAddNoteToTimeline = (applicationId: string) => {
    const noteText = hoverCardNotes[applicationId];
    
    if (noteText && noteText.trim()) {
      addNoteToTimeline(applicationId, noteText);
      setHoverCardNotes(prev => ({ ...prev, [applicationId]: '' }));
    }
  };

  const handleAssignBins = async () => {
    if (selectedPartnerForBins && selectedBinsForAssignment.length > 0) {
      await assignMultipleBinsToPartner(selectedPartnerForBins.id, selectedBinsForAssignment);
      setIsAssignBinsDialogOpen(false);
      setSelectedBinsForAssignment([]);
    }
  };

  // Get bins that are already assigned to this partner
  const assignedBins = React.useMemo(() => {
    if (!selectedPartnerForBins) return [];
    const assignedBinIds = selectedPartnerForBins.assignedBins || [];
    return bins.filter(bin => assignedBinIds.includes(bin.id));
  }, [selectedPartnerForBins, bins]);

  // Get available bins (not assigned to this partner)
  const availableBins = React.useMemo(() => {
    if (!selectedPartnerForBins) return bins;
    const assignedBinIds = selectedPartnerForBins.assignedBins || [];
    return bins.filter(bin => !assignedBinIds.includes(bin.id));
  }, [selectedPartnerForBins, bins]);

  // Filter available bins based on search
  const filteredAvailableBins = React.useMemo(() => {
    if (!binSearchTerm.trim()) return availableBins;
    
    const searchLower = binSearchTerm.toLowerCase();
    return availableBins.filter(bin =>
      bin.binNumber.toLowerCase().includes(searchLower) ||
      bin.locationName.toLowerCase().includes(searchLower) ||
      bin.address.toLowerCase().includes(searchLower) ||
      bin.status.toLowerCase().includes(searchLower)
    );
  }, [availableBins, binSearchTerm]);

  // Document management functions
  const processFiles = async (files: FileList, partnerId: string) => {
    if (files && partnerId) {
      setIsUploading(true);
      setUploadProgress(0);
      
      const totalFiles = files.length;
      const documentEntries: DocumentEntry[] = [];
      
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        setUploadProgress(Math.round((i / totalFiles) * 100));
        
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        documentEntries.push({
          id: `doc_${Date.now()}_${i}`,
          name: file.name,
          data: base64,
          uploadedAt: new Date().toISOString()
        });
      }
      
      setUploadProgress(100);
      
      // Add documents to the application
      await addDocuments(partnerId, documentEntries);
      
      // Reset upload state
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && selectedApplication) {
      await processFiles(files, selectedApplication);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && selectedApplication) {
      await processFiles(files, selectedApplication);
    }
  };

  const handleDeleteDocument = async (partnerId: string, documentId: string) => {
    await deleteDocument(partnerId, documentId);
    setDocumentToDelete(null);
  };

  const openDetailsDialog = (applicationId: string, tab?: string) => {
    setSelectedApplication(applicationId);
    setIsDetailsDialogOpen(true);
    if (tab) {
      setDetailsTabValue(tab);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="h-3 w-3" /> 
      },
      reviewing: { 
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <AlertCircle className="h-3 w-3" /> 
      },
      approved: { 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-3 w-3" /> 
      },
      rejected: { 
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="h-3 w-3" /> 
      },
      archived: { 
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <Package className="h-3 w-3" /> 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="px-6 pt-10 pb-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Partners</h1>
      </div>

      {/* Search and Tabs */}
      <div className="flex gap-4 mb-6">
        <div className="w-1/3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by organization, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="w-2/3 flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
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
              {applications.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
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
              {applications.filter(a => a.status === 'pending').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reviewing')}
            className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'reviewing'
                ? 'bg-background text-foreground shadow-sm'
                : ''
            }`}
          >
            Reviewing
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
              activeTab === 'reviewing'
                ? 'bg-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {applications.filter(a => a.status === 'reviewing').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'approved'
                ? 'bg-background text-foreground shadow-sm'
                : ''
            }`}
          >
            Approved
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
              activeTab === 'approved'
                ? 'bg-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {applications.filter(a => a.status === 'approved').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'rejected'
                ? 'bg-background text-foreground shadow-sm'
                : ''
            }`}
          >
            Rejected
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
              activeTab === 'rejected'
                ? 'bg-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {applications.filter(a => a.status === 'rejected').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'archived'
                ? 'bg-background text-foreground shadow-sm'
                : ''
            }`}
          >
            Archived
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
              activeTab === 'archived'
                ? 'bg-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {applications.filter(a => a.status === 'archived').length}
            </span>
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {(() => {
                const tabApplications = activeTab === 'all' 
                  ? applications 
                  : applications.filter(a => a.status === activeTab);
                
                if (searchTerm.trim()) {
                  return <>Showing {sortedAndFilteredApplications.length} of {tabApplications.length} {activeTab === 'all' ? '' : activeTab} partners</>;
                }
                return <>Showing {sortedAndFilteredApplications.length} {activeTab === 'all' ? 'total' : activeTab} partners</>;
              })()}
            </div>
          </div>
          
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:!bg-transparent">
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('organizationName')}
                >
                  <div className="flex items-center gap-1">
                    Organization
                    {getSortIcon('organizationName')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('contactPerson')}
                >
                  <div className="flex items-center gap-1">
                    Contact
                    {getSortIcon('contactPerson')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center gap-1">
                    Phone
                    {getSortIcon('phone')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center gap-1">
                    Location
                    {getSortIcon('location')}
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
                <TableHead 
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead className="w-32">Documents</TableHead>
                <TableHead className="w-28">Notes</TableHead>
                <TableHead className="w-36">Bins</TableHead>
                <TableHead className="text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No partners found
                  </TableCell>
                </TableRow>
              ) : (
                sortedAndFilteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.organizationName}</div>
                        {app.website && (
                          <div className="text-sm text-muted-foreground">
                            <Globe className="inline h-3 w-3 mr-1" />
                            <a 
                              href={app.website.startsWith('http') ? app.website : `https://${app.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary underline"
                            >
                              {app.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.contactPerson}</div>
                        <div className="text-sm text-muted-foreground">{app.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{app.phone || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${app.address.street}, ${app.address.city}, ${app.address.state} ${app.address.zipCode}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-primary transition-colors"
                      >
                        <div>{app.address.street}</div>
                        <div className="text-muted-foreground">{app.address.city}, {app.address.state} {app.address.zipCode}</div>
                      </a>
                    </TableCell>
                    <TableCell>
                      {format(new Date(app.submittedAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={app.status} 
                        onValueChange={(value) => {
                          // Show confirmation dialog for status change
                          setStatusChangeConfirm({
                            isOpen: true,
                            applicationId: app.id,
                            applicationName: app.organizationName,
                            currentStatus: app.status,
                            newStatus: value
                          });
                        }}
                      >
                        <SelectTrigger className="w-[140px] border border-gray-200 rounded-full px-2 py-1 h-auto focus:ring-1">
                          <SelectValue>
                            {getStatusBadge(app.status)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-left justify-start"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailsDialog(app.id, 'documents');
                        }}
                      >
                        <FileText className="w-4 h-4 text-gray-400 mr-1.5" />
                        <span className="text-xs">
                          {(() => {
                            const docs = app.documents || [];
                            const count = Array.isArray(docs) ? docs.length : 0;
                            return count > 0 ? `${count} file${count !== 1 ? 's' : ''}` : 'No files';
                          })()}
                        </span>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <PartnerApplicationNotesHoverCard 
                        application={app}
                        noteValue={hoverCardNotes[app.id] || ''}
                        onNoteChange={(value) => setHoverCardNotes(prev => ({ ...prev, [app.id]: value }))}
                        onAddNote={() => handleAddNoteToTimeline(app.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {(app.status === 'approved' || app.status === 'archived') ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPartnerForBins(app);
                            setIsAssignBinsDialogOpen(true);
                            setSelectedBinsForAssignment([]);
                            setBinSearchTerm('');
                          }}
                          className="flex items-center gap-1 w-full max-w-[130px]"
                        >
                          <Package className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Bins</span>
                          {app.assignedBins && app.assignedBins.length > 0 && (
                            <span className="ml-auto bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-xs flex-shrink-0">
                              {app.assignedBins.length}
                            </span>
                          )}
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
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
                          <DropdownMenuItem 
                            onClick={() => {
                              setEditingApplication(app);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDetailsDialog(app.id, 'info')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailsDialog(app.id, 'documents');
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Manage Documents
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      </Card>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Update the status and add notes for this application
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Review Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this application..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Bins Dialog */}
      <Dialog open={isAssignBinsDialogOpen} onOpenChange={(open) => {
        setIsAssignBinsDialogOpen(open);
        if (!open) {
          setBinSearchTerm(''); // Clear search when closing
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Bins to Partner</DialogTitle>
            <DialogDescription>
              Select bins to assign to {selectedPartnerForBins?.organizationName}
            </DialogDescription>
          </DialogHeader>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search bins by number, location, or address..."
              value={binSearchTerm}
              onChange={(e) => setBinSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            <div className="space-y-4">
              {/* Already Assigned Bins */}
              {assignedBins.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Currently Assigned ({assignedBins.length})</h4>
                  <div className="space-y-2">
                    {assignedBins.map((bin) => (
                      <div key={bin.id} className="flex items-center space-x-3 p-2 bg-blue-50 rounded">
                        <Checkbox
                          checked={true}
                          disabled
                          className="opacity-50"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{bin.binNumber}</span>
                            <Badge variant={bin.status === 'Available' ? 'default' : bin.status === 'Full' ? 'destructive' : 'secondary'} className="text-xs">
                              {bin.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {bin.locationName} - {bin.address}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={() => {
                            removeBinFromPartner(selectedPartnerForBins.id, bin.id);
                          }}
                          title="Remove from partner"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Available Bins */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Available to Assign ({filteredAvailableBins.length}
                  {binSearchTerm && ` of ${availableBins.length}`})
                </h4>
                {filteredAvailableBins.length > 0 ? (
                  <div className="space-y-2">
                    {filteredAvailableBins.map((bin) => (
                  <div 
                    key={bin.id} 
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => {
                      if (selectedBinsForAssignment.includes(bin.id)) {
                        setSelectedBinsForAssignment(
                          selectedBinsForAssignment.filter(id => id !== bin.id)
                        );
                      } else {
                        setSelectedBinsForAssignment([...selectedBinsForAssignment, bin.id]);
                      }
                    }}
                  >
                    <Checkbox
                      checked={selectedBinsForAssignment.includes(bin.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBinsForAssignment([...selectedBinsForAssignment, bin.id]);
                        } else {
                          setSelectedBinsForAssignment(
                            selectedBinsForAssignment.filter(id => id !== bin.id)
                          );
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{bin.binNumber}</span>
                        <Badge variant={bin.status === 'Available' ? 'default' : bin.status === 'Full' ? 'destructive' : 'secondary'} className="text-xs">
                          {bin.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {bin.locationName} - {bin.address}
                      </div>
                    </div>
                  </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {binSearchTerm ? 'No bins found matching your search' : 'No available bins to assign'}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="mt-4">
            <div className="flex justify-between w-full">
              <div className="text-sm text-gray-500">
                {selectedBinsForAssignment.length > 0 && (
                  <span>{selectedBinsForAssignment.length} bin(s) selected</span>
                )}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAssignBinsDialogOpen(false);
                    setSelectedBinsForAssignment([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignBins}
                  disabled={selectedBinsForAssignment.length === 0}
                >
                  Assign Selected Bins
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog with Documents Tab */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {applications.find(app => app.id === selectedApplication)?.organizationName || 'Application Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <Tabs value={detailsTabValue} onValueChange={setDetailsTabValue}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                {(() => {
                  const app = applications.find(a => a.id === selectedApplication);
                  if (!app) return null;
                  
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Organization</h4>
                        <p className="text-lg font-semibold">{app.organizationName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Contact Person</h4>
                        <p className="text-lg">{app.contactPerson}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                        <p className="text-lg">{app.email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                        <p className="text-lg">{app.phone}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Website</h4>
                        <p className="text-lg">{app.website || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                        <div>{getStatusBadge(app.status)}</div>
                      </div>
                      <div className="col-span-2">
                        <h4 className="text-sm font-medium text-gray-500">Address</h4>
                        <p className="text-lg">
                          {app.address.street}, {app.address.city}, {app.address.state} {app.address.zipCode}
                        </p>
                      </div>
                      {app.additionalInfo && (
                        <div className="col-span-2">
                          <h4 className="text-sm font-medium text-gray-500">Additional Information</h4>
                          <p className="text-sm">{app.additionalInfo}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-4">
                {(() => {
                  const app = applications.find(a => a.id === selectedApplication);
                  if (!app) return null;
                  
                  return (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {app.notesTimeline && app.notesTimeline.length > 0 ? (
                          app.notesTimeline.map((note) => (
                            <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm">{note.text}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(note.timestamp).toLocaleString()}
                                {note.user && ` by ${note.user}`}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500">No notes available</p>
                        )}
                      </div>
                    </ScrollArea>
                  );
                })()}
              </TabsContent>
              
              <TabsContent value="documents" className="mt-4">
                <div className="space-y-4 max-h-[calc(80vh-200px)] overflow-y-auto">
                  {/* Upload Section */}
                  <div 
                    className={`relative border-2 border-dashed rounded-lg text-center transition-all duration-200 cursor-pointer ${
                      isUploading 
                        ? 'border-blue-400 bg-blue-50/50 p-4' 
                        : 'border-gray-200 hover:border-blue-300 bg-gradient-to-b from-gray-50/50 to-white hover:from-blue-50/30 hover:to-white p-6'
                    }`}
                    onDragOver={(e) => {
                      handleDragOver(e);
                      e.currentTarget.classList.add('border-blue-400', 'bg-blue-50/50');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/50');
                    }}
                    onDragEnter={handleDragEnter}
                    onDrop={(e) => {
                      handleDrop(e);
                      e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/50');
                    }}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      disabled={isUploading}
                    />
                    
                    {/* Upload Icon */}
                    <div className="mb-3">
                      <Upload className={`w-10 h-10 mx-auto ${isUploading ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
                    </div>
                    
                    {/* Upload Text */}
                    {isUploading ? (
                      <div>
                        <p className="text-sm font-medium text-blue-600 mb-2">Uploading...</p>
                        <Progress value={uploadProgress} className="w-48 mx-auto h-2" />
                        <p className="text-xs text-gray-500 mt-2">{uploadProgress}% complete</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Drop files here or click to browse</p>
                        <p className="text-xs text-gray-500">Supports PDF, DOC, DOCX, TXT, JPG, JPEG, PNG</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Documents List */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 border-b">
                      <h4 className="text-xs font-medium text-gray-700">
                        Uploaded Documents ({applications.find(a => a.id === selectedApplication)?.documents?.length || 0})
                      </h4>
                    </div>
                    <ScrollArea className={`${isUploading ? 'h-[160px]' : 'h-[200px]'} transition-all duration-200`}>
                      {(() => {
                        const app = applications.find(a => a.id === selectedApplication);
                        const documents = app?.documents || [];
                        
                        if (documents.length > 0) {
                          return (
                            <div className="p-2 space-y-1">
                              {documents.map((doc: DocumentEntry) => {
                                // Get file extension from name
                                const getFileIcon = () => {
                                  const name = doc.name.toLowerCase();
                                  if (name.includes('.pdf')) return (
                                    <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center flex-shrink-0">
                                      <FileText className="w-4 h-4 text-red-600" />
                                    </div>
                                  );
                                  if (name.includes('.doc') || name.includes('.docx')) return (
                                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                                      <FileText className="w-4 h-4 text-blue-600" />
                                    </div>
                                  );
                                  if (name.includes('.jpg') || name.includes('.jpeg') || name.includes('.png')) return (
                                    <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center flex-shrink-0">
                                      <Image className="w-4 h-4 text-green-600" />
                                    </div>
                                  );
                                  return (
                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                      <File className="w-4 h-4 text-gray-600" />
                                    </div>
                                  );
                                };
                                
                                return (
                                  <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      {getFileIcon()}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {doc.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = doc.data;
                                          link.download = doc.name;
                                          link.click();
                                        }}
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </Button>
                                      
                                      {(doc.name.includes('.jpg') || doc.name.includes('.jpeg') || doc.name.includes('.png')) && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={() => window.open(doc.data, '_blank')}
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </Button>
                                      )}
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                        onClick={() => setDocumentToDelete({id: doc.id, name: doc.name})}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }
                        
                        return (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <FileText className="w-10 h-10 mb-2" />
                            <p className="text-xs font-medium">No documents uploaded</p>
                            <p className="text-xs mt-1">Upload documents to get started</p>
                          </div>
                        );
                      })()}
                    </ScrollArea>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Document Confirmation Dialog */}
      {documentToDelete && (
        <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{documentToDelete.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedApplication && documentToDelete) {
                    handleDeleteDocument(selectedApplication, documentToDelete.id);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Status Change Confirmation Dialog */}
      <AlertDialog 
        open={statusChangeConfirm?.isOpen || false} 
        onOpenChange={(open) => {
          if (!open) {
            setStatusChangeConfirm(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of <span className="font-semibold">"{statusChangeConfirm?.applicationName}"</span> from{' '}
              <span className="font-semibold capitalize">{statusChangeConfirm?.currentStatus}</span> to{' '}
              <span className="font-semibold capitalize">{statusChangeConfirm?.newStatus}</span>?
              {statusChangeConfirm?.newStatus === 'approved' && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  Approving this application will allow the partner to be assigned bins.
                </div>
              )}
              {statusChangeConfirm?.newStatus === 'rejected' && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  <XCircle className="inline h-3 w-3 mr-1" />
                  Rejecting this application will prevent the partner from being assigned bins.
                </div>
              )}
              {statusChangeConfirm?.newStatus === 'archived' && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                  <Package className="inline h-3 w-3 mr-1" />
                  Archiving this application will mark it as inactive but preserve all assigned bins.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statusChangeConfirm) {
                  updateApplicationStatus(
                    statusChangeConfirm.applicationId,
                    statusChangeConfirm.newStatus as any
                  );
                  setStatusChangeConfirm(null);
                }
              }}
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Partner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Partner Details</DialogTitle>
            <DialogDescription>
              Update the partner application information
            </DialogDescription>
          </DialogHeader>
          
          {editingApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-org">Organization Name</Label>
                  <Input
                    id="edit-org"
                    value={editingApplication.organizationName}
                    onChange={(e) => setEditingApplication({
                      ...editingApplication,
                      organizationName: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-contact">Contact Person</Label>
                  <Input
                    id="edit-contact"
                    value={editingApplication.contactPerson}
                    onChange={(e) => setEditingApplication({
                      ...editingApplication,
                      contactPerson: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingApplication.email}
                    onChange={(e) => setEditingApplication({
                      ...editingApplication,
                      email: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingApplication.phone}
                    onChange={(e) => setEditingApplication({
                      ...editingApplication,
                      phone: e.target.value
                    })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-website">Website</Label>
                  <Input
                    id="edit-website"
                    value={editingApplication.website || ''}
                    onChange={(e) => setEditingApplication({
                      ...editingApplication,
                      website: e.target.value
                    })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Address</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input
                      placeholder="Street"
                      value={editingApplication.address.street}
                      onChange={(e) => setEditingApplication({
                        ...editingApplication,
                        address: {
                          ...editingApplication.address,
                          street: e.target.value
                        }
                      })}
                    />
                  </div>
                  <Input
                    placeholder="City"
                    value={editingApplication.address.city}
                    onChange={(e) => setEditingApplication({
                      ...editingApplication,
                      address: {
                        ...editingApplication.address,
                        city: e.target.value
                      }
                    })}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="State"
                      className="w-1/3"
                      value={editingApplication.address.state}
                      onChange={(e) => setEditingApplication({
                        ...editingApplication,
                        address: {
                          ...editingApplication.address,
                          state: e.target.value
                        }
                      })}
                    />
                    <Input
                      placeholder="Zip Code"
                      className="w-2/3"
                      value={editingApplication.address.zipCode}
                      onChange={(e) => setEditingApplication({
                        ...editingApplication,
                        address: {
                          ...editingApplication.address,
                          zipCode: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-info">Additional Information</Label>
                <Textarea
                  id="edit-info"
                  value={editingApplication.additionalInfo || ''}
                  onChange={(e) => setEditingApplication({
                    ...editingApplication,
                    additionalInfo: e.target.value
                  })}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (editingApplication) {
                  await updateApplication(editingApplication.id, editingApplication);
                  setIsEditDialogOpen(false);
                  setEditingApplication(null);
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// PartnerApplicationNotesHoverCard component for displaying and adding notes
interface PartnerApplicationNotesHoverCardProps {
  application: any;
  noteValue: string;
  onNoteChange: (value: string) => void;
  onAddNote: () => void;
}

const PartnerApplicationNotesHoverCard = ({ application, noteValue, onNoteChange, onAddNote }: PartnerApplicationNotesHoverCardProps) => {
  const timelineNotes = application.notesTimeline?.length || 0;
  const hasAdditionalInfo = application.additionalInfo ? 1 : 0;
  const noteCount = timelineNotes + hasAdditionalInfo;
  const hasNotes = noteCount > 0;
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 px-3 text-left justify-start"
        >
          <MessageSquare className="w-4 h-4 text-gray-400 mr-1.5" />
          <span className="text-xs">{noteCount} notes</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="center" side="left" sideOffset={5}>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold text-sm">Notes Timeline</h4>
            <span className="text-xs text-gray-500">{application.organizationName}</span>
          </div>
          
          {/* Notes Timeline */}
          <ScrollArea className="h-48 pr-3">
            {hasNotes || application.additionalInfo ? (
              <div className="space-y-3">
                {/* Show additional info as the first note if it exists */}
                {application.additionalInfo && (
                  <div className="border-l-2 border-blue-200 pl-3 ml-1">
                    <p className="text-xs font-semibold text-blue-600 mb-1">Application Message</p>
                    <p className="text-sm text-gray-700">{application.additionalInfo}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted with application • {format(new Date(application.submittedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {application.notesTimeline?.map((note: any) => (
                  <div key={note.id} className="border-l-2 border-gray-200 pl-3 ml-1">
                    <p className="text-sm text-gray-700">{note.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(note.timestamp), 'MMM dd, yyyy h:mm a')}
                      {note.user && <span className="ml-2">by {note.user}</span>}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notes yet</p>
                <p className="text-xs">Add the first note below</p>
              </div>
            )}
          </ScrollArea>
          
          {/* Add New Note */}
          <div className="space-y-2 pt-2 border-t">
            <Textarea
              placeholder="Add a note..."
              value={noteValue}
              onChange={(e) => onNoteChange(e.target.value)}
              className="min-h-[60px] text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onAddNote();
                }
              }}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Cmd/Ctrl + Enter to add</span>
              <Button 
                size="sm" 
                onClick={onAddNote}
                disabled={!noteValue.trim()}
                className="h-7"
              >
                Add Note
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PartnerApplications;