import React, { useState } from 'react';
import { usePartnerApplications } from '@/contexts/PartnerApplicationsContextSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';

const PartnerApplications = () => {
  const { applications, updateApplicationStatus, deleteApplication, addNoteToTimeline } = usePartnerApplications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'reviewing' | 'approved' | 'rejected'>('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'approved' | 'rejected' | 'reviewing'>('reviewing');
  const [hoverCardNotes, setHoverCardNotes] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const selectedApp = applications.find(app => app.id === selectedApplication);

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
        <h1 className="text-3xl font-bold">Partner Applications</h1>
      </div>

      {/* Search and Tabs */}
      <div className="flex gap-4 mb-6">
        <div className="w-1/2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by organization, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="w-1/2 flex items-center gap-1 p-1 bg-muted rounded-lg">
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
        </div>
      </div>

      {/* Applications Table */}
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {(() => {
                const tabApplications = activeTab === 'all' 
                  ? applications 
                  : applications.filter(a => a.status === activeTab);
                
                if (searchTerm.trim()) {
                  return <>Showing {sortedAndFilteredApplications.length} of {tabApplications.length} {activeTab === 'all' ? '' : activeTab} applications</>;
                }
                return <>Showing {sortedAndFilteredApplications.length} {activeTab === 'all' ? 'total' : activeTab} applications</>;
              })()}
            </div>
          </div>
          
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
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No applications found
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
                        onValueChange={(value) => updateApplicationStatus(app.id, value as any)}
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
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <PartnerApplicationNotesHoverCard 
                        application={app}
                        noteValue={hoverCardNotes[app.id] || ''}
                        onNoteChange={(value) => setHoverCardNotes(prev => ({ ...prev, [app.id]: value }))}
                        onAddNote={() => handleAddNoteToTimeline(app.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedApp.organizationName}</span>
                  {getStatusBadge(selectedApp.status)}
                </DialogTitle>
                <DialogDescription>
                  Application submitted on {format(new Date(selectedApp.submittedAt), 'MMMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Organization Information */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Organization Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Organization Name:</span>
                      <span className="ml-2 font-medium">{selectedApp.organizationName}</span>
                    </div>
                    {selectedApp.website && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Website:</span>
                        <a href={selectedApp.website} target="_blank" rel="noopener noreferrer" 
                           className="ml-2 text-primary hover:underline">
                          {selectedApp.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Contact Person:</span>
                      <span className="ml-2">{selectedApp.contactPerson}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <span className="ml-2">{selectedApp.email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="ml-2">{selectedApp.phone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Address:</span>
                      <span className="ml-2">
                        {selectedApp.address.street}, {selectedApp.address.city}, 
                        {selectedApp.address.state} {selectedApp.address.zipCode}
                      </span>
                    </div>
                  </div>
                </div>


                {/* Additional Information */}
                {selectedApp.additionalInfo && (
                  <div>
                    <h3 className="font-semibold mb-3">Additional Information</h3>
                    <p className="text-sm bg-muted/50 p-3 rounded">{selectedApp.additionalInfo}</p>
                  </div>
                )}

                {/* Review Notes */}
                {selectedApp.reviewNotes && (
                  <div>
                    <h3 className="font-semibold mb-3">Review Notes</h3>
                    <p className="text-sm bg-muted/50 p-3 rounded">{selectedApp.reviewNotes}</p>
                    {selectedApp.reviewedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Reviewed on {format(new Date(selectedApp.reviewedAt), 'MMMM d, yyyy')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close
                </Button>
                {selectedApp.status !== 'approved' && selectedApp.status !== 'rejected' && (
                  <Button
                    onClick={() => {
                      setReviewModalOpen(true);
                      setNewStatus('reviewing');
                    }}
                  >
                    Review Application
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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