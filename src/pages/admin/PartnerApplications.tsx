import React, { useState } from 'react';
import { usePartnerApplications } from '@/contexts/PartnerApplicationsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { 
  Search, 
  Eye, 
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
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

const PartnerApplications = () => {
  const { applications, updateApplicationStatus, deleteApplication } = usePartnerApplications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'approved' | 'rejected' | 'reviewing'>('reviewing');

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const selectedApp = applications.find(app => app.id === selectedApplication);

  const handleStatusUpdate = () => {
    if (selectedApplication) {
      updateApplicationStatus(selectedApplication, newStatus, reviewNotes);
      setReviewModalOpen(false);
      setReviewNotes('');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: <Clock className="h-3 w-3" /> },
      reviewing: { variant: 'default' as const, icon: <AlertCircle className="h-3 w-3" /> },
      approved: { variant: 'success' as const, icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { variant: 'destructive' as const, icon: <XCircle className="h-3 w-3" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="px-6 pt-10 pb-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Partner Applications</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Under Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.reviewing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by organization, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.organizationName}</div>
                        {app.website && (
                          <div className="text-sm text-muted-foreground">
                            <Globe className="inline h-3 w-3 mr-1" />
                            Website
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
                      <div className="text-sm">
                        <div>{app.address.city}, {app.address.state}</div>
                        <div className="text-muted-foreground">{app.address.zipCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(app.submittedAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(app.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedApplication(app.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
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
                    {selectedApp.taxId && (
                      <div>
                        <span className="text-muted-foreground">Tax ID:</span>
                        <span className="ml-2">{selectedApp.taxId}</span>
                      </div>
                    )}
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
                  <SelectItem value="reviewing">Under Review</SelectItem>
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

export default PartnerApplications;