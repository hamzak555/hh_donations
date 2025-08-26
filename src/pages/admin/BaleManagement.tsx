import React, { useState, useRef, useEffect } from 'react';
import { useBales, Bale, BaleQuality, BaleStatus, PaymentMethod } from '@/contexts/BalesContextSupabase';
import { useContainers } from '@/contexts/ContainersContextSupabase';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, MoreHorizontal, Edit, Trash, Printer, DollarSign, ArrowUpDown, ChevronUp, ChevronDown, Search, MessageSquare, Send, Camera, ChevronLeft, ChevronRight, X, Undo2 } from 'lucide-react';
import { format } from 'date-fns';

// Safe date formatter to handle invalid dates
const safeFormatDate = (dateValue: string | null | undefined, formatStr: string = 'MMM dd, yyyy'): string => {
  if (!dateValue) return '-';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '-';
    return format(date, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error, 'for value:', dateValue);
    return '-';
  }
};

// Photo Lightbox Component
interface LightboxProps {
  photos: {id: string, data: string}[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  onDelete?: (photoId: string) => Promise<void>;
}

const PhotoLightbox = ({ photos, isOpen, onClose, initialIndex = 0, onDelete }: LightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  if (!isOpen || !photos || photos.length === 0) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleDelete = async () => {
    if (!onDelete || photos.length === 0) return;
    
    if (window.confirm('Are you sure you want to delete this photo?')) {
      setDeleting(true);
      try {
        await onDelete(photos[currentIndex].id);
        // If this was the last photo, close the lightbox
        if (photos.length === 1) {
          onClose();
        } else {
          // Adjust current index if we deleted the last photo
          if (currentIndex >= photos.length - 1) {
            setCurrentIndex(0);
          }
        }
      } catch (error) {
        console.error('Failed to delete photo:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center" onClick={onClose}>
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
        onClick={onClose}
      >
        <X className="w-8 h-8" />
      </button>
      
      {photos.length > 1 && (
        <>
          <button
            className="absolute left-4 text-white hover:text-gray-300 z-50"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            className="absolute right-4 text-white hover:text-gray-300 z-50"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}
      
      <div className="flex items-center justify-center w-full h-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={photos[currentIndex]?.data}
          alt={`Bale ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>
      
      {onDelete && (
        <button
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash className="w-4 h-4" />
          {deleting ? 'Deleting...' : 'Delete Photo'}
        </button>
      )}
    </div>
  );
};

// Photos Preview Component
interface PhotosPreviewProps {
  bale: Bale;
  onAddPhotos: (photoFiles: File[]) => Promise<void>;
}

const PhotosPreview = ({ bale, onAddPhotos }: PhotosPreviewProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [actualPhotos, setActualPhotos] = useState<{id: string, data: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { getPhotosWithIds, repairPhotoIntegrity, removePhoto } = useBales();
  
  // Load actual photo data from IndexedDB
  useEffect(() => {
    const loadPhotos = async () => {
      if (bale.photos && bale.photos.length > 0) {
        setLoading(true);
        try {
          const photoData = await getPhotosWithIds(bale.id);
          setActualPhotos(photoData);
          
          // Check for photo mismatch and auto-repair
          if (photoData.length !== bale.photos.length) {
            console.warn(`Bale ${bale.baleNumber}: Expected ${bale.photos.length} photos, but loaded ${photoData.length} from IndexedDB - attempting repair`);
            await repairPhotoIntegrity(bale.id);
          }
        } catch (error) {
          console.error('Failed to load photos:', error);
          setActualPhotos([]);
        } finally {
          setLoading(false);
        }
      } else {
        setActualPhotos([]);
      }
    };
    
    loadPhotos();
  }, [bale.photos, bale.id, getPhotosWithIds, repairPhotoIntegrity]);
  
  const photoIds = bale.photos || [];
  const photoCount = actualPhotos.length; // Use actual loaded photos count
  const displayPhotos = actualPhotos.slice(0, 2);
  const remainingCount = photoCount > 2 ? photoCount - 2 : 0;
  const hasMismatch = photoIds.length !== photoCount;

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setLoading(true);
      try {
        await onAddPhotos(Array.from(files));
        // Reload photos after upload
        const photoData = await getPhotosWithIds(bale.id);
        setActualPhotos(photoData);
      } catch (error) {
        console.error('Failed to upload photos:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    setLoading(true);
    try {
      await removePhoto(bale.id, photoId);
      // Reload photos after deletion
      const photoData = await getPhotosWithIds(bale.id);
      setActualPhotos(photoData);
    } catch (error) {
      console.error('Failed to delete photo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {hasMismatch && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 mr-1" title="Photo count mismatch - auto-repairing">
            ⚠
          </span>
        )}
        {photoCount === 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-500 hover:text-gray-700"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-4 h-4 mr-1" />
            <span className="text-sm">Add</span>
          </Button>
        ) : (
          <>
            {displayPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="w-8 h-8 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
                onClick={() => handlePhotoClick(index)}
              >
                <img
                  src={photo.data}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {remainingCount > 0 && (
              <button
                className="w-8 h-8 rounded bg-gray-100 text-xs font-medium hover:bg-gray-200 flex items-center justify-center"
                onClick={() => handlePhotoClick(2)}
              >
                +{remainingCount}
              </button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
      <PhotoLightbox
        photos={actualPhotos}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
        onDelete={handleDeletePhoto}
      />
    </>
  );
};

// Move NotesHoverCard outside of the main component to prevent re-renders
interface NotesHoverCardProps {
  bale: Bale;
  noteValue: string;
  onNoteChange: (value: string) => void;
  onAddNote: () => void;
}

const NotesHoverCard = ({ bale, noteValue, onNoteChange, onAddNote }: NotesHoverCardProps) => {
  const noteCount = bale.notesTimeline?.length || 0;
  const hasNotes = noteCount > 0;
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 px-2 hover:bg-gray-100"
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          <span className="text-sm">{noteCount}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="center" side="left" sideOffset={5}>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold text-sm">Notes Timeline</h4>
            <span className="text-xs text-gray-500">{bale.baleNumber}</span>
          </div>
          
          {/* Notes Timeline */}
          <ScrollArea className="h-48 pr-3">
            {hasNotes ? (
              <div className="space-y-3">
                {bale.notesTimeline?.map((note) => (
                  <div key={note.id} className="border-l-2 border-gray-200 pl-3 ml-1">
                    <p className="text-sm text-gray-700">{note.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {safeFormatDate(note.timestamp, 'MMM dd, yyyy h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
            )}
          </ScrollArea>
          
          {/* Add Note Input */}
          <div className="border-t pt-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a note..."
                value={noteValue}
                onChange={(e) => onNoteChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddNote();
                  }
                }}
                className="text-sm flex-1"
              />
              <Button
                size="sm"
                onClick={onAddNote}
                disabled={!noteValue?.trim()}
                className="h-9 px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

function BaleManagement() {
  const { bales, addBale, updateBale, deleteBale, markAsSold, revertToActive, addNoteToTimeline, addPhotos } = useBales();
  const { containers } = useContainers();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSoldDialogOpen, setIsSoldDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false);
  const [selectedBale, setSelectedBale] = useState<Bale | null>(null);
  const [baleToDelete, setBaleToDelete] = useState<Bale | null>(null);
  const [baleToRevert, setBaleToRevert] = useState<Bale | null>(null);
  
  const [formData, setFormData] = useState({
    contents: 'A-Quality' as BaleQuality,
    weight: '' as any,
    status: 'Warehouse' as BaleStatus,
    notes: ''
  });
  
  const [soldFormData, setSoldFormData] = useState({
    salePrice: 0,
    paymentMethod: 'Cash' as PaymentMethod
  });
  
  const [isEditSoldDialogOpen, setIsEditSoldDialogOpen] = useState(false);
  const [editSoldFormData, setEditSoldFormData] = useState({
    salePrice: 0,
    paymentMethod: 'Cash' as PaymentMethod
  });
  
  const [sortColumn, setSortColumn] = useState<string | null>('createdDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [hoverCardNotes, setHoverCardNotes] = useState<{ [baleId: string]: string }>({});
  const [statsPeriod, setStatsPeriod] = useState<'7d' | '14d' | '30d'>('7d');
  
  const printRef = useRef<HTMLDivElement>(null);

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

  const getFilteredAndSortedBales = (status: 'active' | 'sold') => {
    // Filter by status
    let filteredBales = bales.filter(bale => 
      status === 'sold' ? bale.status === 'Sold' : bale.status !== 'Sold'
    );
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredBales = filteredBales.filter(bale => 
        bale.baleNumber.toLowerCase().includes(query) ||
        bale.contents.toLowerCase().includes(query) ||
        bale.status.toLowerCase().includes(query) ||
        (bale.notes && bale.notes.toLowerCase().includes(query))
      );
    }
    
    // Sort the filtered results
    if (!sortColumn) return filteredBales;
    
    return [...filteredBales].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      // Special handling for location column
      if (sortColumn === 'location') {
        aValue = getBaleLocation(a);
        bValue = getBaleLocation(b);
      } else {
        aValue = a[sortColumn as keyof Bale];
        bValue = b[sortColumn as keyof Bale];
      }
      
      // Handle different data types
      if (sortColumn === 'weight' || sortColumn === 'salePrice') {
        aValue = Number(aValue || 0);
        bValue = Number(bValue || 0);
        return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
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

  const handleAddBale = () => {
    addBale({...formData, weight: parseFloat(formData.weight) || 0});
    setIsAddDialogOpen(false);
    setFormData({ contents: 'A-Quality', weight: '', status: 'Warehouse', notes: '' });
  };

  const handleEditBale = () => {
    if (selectedBale) {
      updateBale(selectedBale.id, formData);
      setIsEditDialogOpen(false);
      setSelectedBale(null);
      setFormData({ contents: 'A-Quality', weight: '', status: 'Warehouse', notes: '' });
    }
  };

  const handleMarkAsSold = () => {
    if (selectedBale) {
      markAsSold(selectedBale.id, soldFormData.salePrice, soldFormData.paymentMethod);
      setIsSoldDialogOpen(false);
      setSelectedBale(null);
      setSoldFormData({ salePrice: 0, paymentMethod: 'Cash' });
    }
  };

  const handleDeleteBale = (bale: Bale) => {
    setBaleToDelete(bale);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBale = () => {
    if (baleToDelete) {
      deleteBale(baleToDelete.id);
      setIsDeleteDialogOpen(false);
      setBaleToDelete(null);
    }
  };

  // Helper function to get location for a bale
  const getBaleLocation = (bale: Bale) => {
    // Check if bale has a container
    if (bale.containerNumber) {
      // Case-insensitive container matching with trim
      const container = containers.find(c => 
        c.containerNumber?.trim().toLowerCase() === bale.containerNumber?.trim().toLowerCase()
      );
      
      // Debug logging for CONT002
      if (bale.containerNumber.toLowerCase().includes('cont002')) {
        console.log('Looking for container:', bale.containerNumber);
        console.log('Available containers:', containers.map(c => ({ num: c.containerNumber, dest: c.destination })));
        console.log('Found container:', container);
      }
      
      if (container && container.destination) {
        return container.destination;
      }
      // If no destination set, show container number
      return bale.containerNumber;
    }
    
    // For bales not in a container
    return 'In Warehouse';
  };

  const handleRevertBale = (bale: Bale) => {
    setBaleToRevert(bale);
    setIsRevertDialogOpen(true);
  };

  const confirmRevertBale = () => {
    if (baleToRevert) {
      revertToActive(baleToRevert.id);
      setIsRevertDialogOpen(false);
      setBaleToRevert(null);
    }
  };

  const openEditDialog = (bale: Bale) => {
    setSelectedBale(bale);
    setFormData({
      contents: bale.contents,
      weight: bale.weight,
      status: bale.status,
      notes: bale.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const openSoldDialog = (bale: Bale) => {
    setSelectedBale(bale);
    setSoldFormData({ salePrice: 0, paymentMethod: 'Cash' });
    setIsSoldDialogOpen(true);
  };

  const openPrintDialog = (bale: Bale) => {
    setSelectedBale(bale);
    setIsPrintDialogOpen(true);
  };
  
  const openEditSoldDialog = (bale: Bale) => {
    setSelectedBale(bale);
    setEditSoldFormData({
      salePrice: bale.salePrice || 0,
      paymentMethod: bale.paymentMethod || 'Cash'
    });
    setIsEditSoldDialogOpen(true);
  };
  
  const handleEditSoldBale = () => {
    if (selectedBale) {
      updateBale(selectedBale.id, {
        salePrice: editSoldFormData.salePrice,
        paymentMethod: editSoldFormData.paymentMethod
      });
      setIsEditSoldDialogOpen(false);
      setSelectedBale(null);
      setEditSoldFormData({ salePrice: 0, paymentMethod: 'Cash' });
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      // Create a style element for print-specific CSS
      const printStyles = `
        <style>
          @media print {
            @page {
              size: 4in 6in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              width: 4in;
              height: 6in;
            }
            * {
              box-sizing: border-box;
            }
          }
        </style>
      `;
      
      // Set up the print content with styles
      document.body.innerHTML = printStyles + printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const getStatusBadge = (status: BaleStatus, containerNumber?: string) => {
    const statusStyles = {
      'Warehouse': 'bg-blue-100 text-blue-800 border-blue-200',
      'Container': 'bg-orange-100 text-orange-800 border-orange-200',
      'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
      'Sold': 'bg-green-100 text-green-800 border-green-200'
    };
    
    let displayText: string = status;
    // Show container number for both Container and Shipped statuses
    if ((status === 'Container' || status === 'Shipped') && containerNumber) {
      displayText = `${status} (${containerNumber})`;
    }
    
    return (
      <Badge variant="outline" className={statusStyles[status]}>
        {displayText}
      </Badge>
    );
  };

  const handleAddNoteToTimeline = (baleId: string) => {
    const noteText = hoverCardNotes[baleId];
    if (noteText && noteText.trim()) {
      addNoteToTimeline(baleId, noteText);
      setHoverCardNotes(prev => ({ ...prev, [baleId]: '' }));
    }
  };

  // Format number with commas for thousands
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculate statistics for sold bales
  const calculateStats = (days: number) => {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const soldBalesInPeriod = bales.filter(bale => {
      if (bale.status !== 'Sold' || !bale.soldDate) return false;
      if (!bale.soldDate) return false;
      const soldDate = new Date(bale.soldDate);
      return !isNaN(soldDate.getTime()) && soldDate >= cutoffDate;
    });
    
    const count = soldBalesInPeriod.length;
    const revenue = soldBalesInPeriod.reduce((sum, bale) => sum + (bale.salePrice || 0), 0);
    const avgPrice = count > 0 ? revenue / count : 0;
    
    return { count, revenue, avgPrice };
  };
  
  const stats7d = calculateStats(7);
  const stats14d = calculateStats(14);
  const stats30d = calculateStats(30);

  const getQualityBadge = (quality: BaleQuality | string) => {
    // Handle both old format (A, B, C) and new format (A-Quality, B-Quality, C-Quality)
    const qualityMap: { [key: string]: string } = {
      'A': 'A-Quality',
      'B': 'B-Quality',
      'C': 'C-Quality',
      'A-Quality': 'A-Quality',
      'B-Quality': 'B-Quality',
      'C-Quality': 'C-Quality',
      'Creme': 'Creme',
      'Shoes': 'Shoes'
    };
    
    const displayQuality = qualityMap[quality] || quality;
    
    const qualityStyles: { [key: string]: string } = {
      'A-Quality': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'B-Quality': 'bg-blue-100 text-blue-800 border-blue-200',
      'C-Quality': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Creme': 'bg-pink-100 text-pink-800 border-pink-200',
      'Shoes': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const styleClass = qualityStyles[displayQuality] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    return (
      <Badge variant="outline" className={styleClass}>
        {displayQuality}
      </Badge>
    );
  };

  return (
    <div className="h-screen flex flex-col pt-10 pb-6">
      <div className="flex justify-between items-center mb-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Bales</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Bale
        </Button>
      </div>

      {/* Search Bar, Tabs and Statistics Layout */}
      <div className="mb-6 flex items-start gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex-1 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search bales by number, contents, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full max-w-md">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === 'active'
                  ? 'bg-background text-foreground shadow-sm'
                  : ''
              }`}
            >
              Active Bales
              <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
                activeTab === 'active'
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {bales.filter(b => b.status !== 'Sold').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === 'sold'
                  ? 'bg-background text-foreground shadow-sm'
                  : ''
              }`}
            >
              Sold Bales
              <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
                activeTab === 'sold'
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {bales.filter(b => b.status === 'Sold').length}
              </span>
            </button>
          </div>
        </div>

        {/* Statistics Card - Only show on sold tab */}
        {activeTab === 'sold' && (
          <Card className="p-3 h-[88px] flex items-center" style={{ width: '450px' }}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center justify-evenly flex-1">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Bales</span>
                  <span className="text-lg font-semibold">
                    {statsPeriod === '7d' ? stats7d.count : statsPeriod === '14d' ? stats14d.count : stats30d.count}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Revenue</span>
                  <span className="text-lg font-semibold text-green-600">
                    ${formatNumber(statsPeriod === '7d' ? stats7d.revenue : statsPeriod === '14d' ? stats14d.revenue : stats30d.revenue)}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Average</span>
                  <span className="text-lg font-semibold">
                    ${formatNumber(statsPeriod === '7d' ? stats7d.avgPrice : statsPeriod === '14d' ? stats14d.avgPrice : stats30d.avgPrice)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col bg-gray-100 rounded-lg p-0.5 gap-0.5 ml-4">
                <button
                  onClick={() => setStatsPeriod('7d')}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
                    statsPeriod === '7d' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  7d
                </button>
                <button
                  onClick={() => setStatsPeriod('14d')}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
                    statsPeriod === '14d' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  14d
                </button>
                <button
                  onClick={() => setStatsPeriod('30d')}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
                    statsPeriod === '30d' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  30d
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8">
        <TabsContent value="active" className="flex-1 flex flex-col data-[state=inactive]:hidden">
          <Card className="overflow-hidden flex-1 flex flex-col">
            <div className="flex-1 overflow-auto p-6">
              <Table className="select-none">
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('baleNumber')}
                    >
                      <div className="flex items-center gap-1">
                        Bale Number
                        {getSortIcon('baleNumber')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('contents')}
                    >
                      <div className="flex items-center gap-1">
                        Contents
                        {getSortIcon('contents')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('weight')}
                    >
                      <div className="flex items-center gap-1">
                        Weight (Kg)
                        {getSortIcon('weight')}
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
                      onClick={() => handleSort('location')}
                    >
                      <div className="flex items-center gap-1">
                        Location
                        {getSortIcon('location')}
                      </div>
                    </TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('createdDate')}
                    >
                      <div className="flex items-center gap-1">
                        Created Date
                        {getSortIcon('createdDate')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="select-none">
                  {getFilteredAndSortedBales('active').map((bale) => (
                    <TableRow key={bale.id} className="select-none">
                      <TableCell className="font-medium">{bale.baleNumber}</TableCell>
                      <TableCell>{getQualityBadge(bale.contents)}</TableCell>
                      <TableCell>{bale.weight} Kg</TableCell>
                      <TableCell>{getStatusBadge(bale.status, bale.containerNumber)}</TableCell>
                      <TableCell>
                        <span className={`text-sm ${getBaleLocation(bale) === 'In Warehouse' ? 'text-gray-500' : ''}`}>
                          {getBaleLocation(bale)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <NotesHoverCard 
                          bale={bale}
                          noteValue={hoverCardNotes[bale.id] || ''}
                          onNoteChange={(value) => setHoverCardNotes(prev => ({
                            ...prev,
                            [bale.id]: value
                          }))}
                          onAddNote={() => handleAddNoteToTimeline(bale.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <PhotosPreview 
                          bale={bale}
                          onAddPhotos={async (photoFiles) => {
                            try {
                              await addPhotos(bale.id, photoFiles);
                            } catch (error) {
                              console.error('Failed to add photos:', error);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {safeFormatDate(bale.createdDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(bale)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openSoldDialog(bale)}>
                              <DollarSign className="mr-2 h-4 w-4" />
                              Mark as Sold
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPrintDialog(bale)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Label
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBale(bale)}
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
        </TabsContent>

        <TabsContent value="sold" className="flex-1 flex flex-col data-[state=inactive]:hidden">
          <Card className="overflow-hidden flex-1 flex flex-col">
            <div className="flex-1 overflow-auto p-6">
              <Table className="select-none">
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('baleNumber')}
                    >
                      <div className="flex items-center gap-1">
                        Bale Number
                        {getSortIcon('baleNumber')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('contents')}
                    >
                      <div className="flex items-center gap-1">
                        Contents
                        {getSortIcon('contents')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('weight')}
                    >
                      <div className="flex items-center gap-1">
                        Weight (Kg)
                        {getSortIcon('weight')}
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
                      onClick={() => handleSort('salePrice')}
                    >
                      <div className="flex items-center gap-1">
                        Sale Price (USD)
                        {getSortIcon('salePrice')}
                      </div>
                    </TableHead>
                    <TableHead>
                      Price/Kg
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('paymentMethod')}
                    >
                      <div className="flex items-center gap-1">
                        Payment Method
                        {getSortIcon('paymentMethod')}
                      </div>
                    </TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead 
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('soldDate')}
                    >
                      <div className="flex items-center gap-1">
                        Sold Date
                        {getSortIcon('soldDate')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="select-none">
                  {getFilteredAndSortedBales('sold').map((bale) => (
                    <TableRow key={bale.id} className="select-none">
                      <TableCell className="font-medium">{bale.baleNumber}</TableCell>
                      <TableCell>{getQualityBadge(bale.contents)}</TableCell>
                      <TableCell>{bale.weight} Kg</TableCell>
                      <TableCell>
                        <span className={`text-sm ${getBaleLocation(bale) === 'In Warehouse' ? 'text-gray-500' : ''}`}>
                          {getBaleLocation(bale)}
                        </span>
                      </TableCell>
                      <TableCell>${bale.salePrice ? formatNumber(bale.salePrice) : '0.00'}</TableCell>
                      <TableCell>
                        ${bale.salePrice && bale.weight ? formatNumber(bale.salePrice / bale.weight) : '0.00'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          {bale.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <NotesHoverCard 
                          bale={bale}
                          noteValue={hoverCardNotes[bale.id] || ''}
                          onNoteChange={(value) => setHoverCardNotes(prev => ({
                            ...prev,
                            [bale.id]: value
                          }))}
                          onAddNote={() => handleAddNoteToTimeline(bale.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <PhotosPreview 
                          bale={bale}
                          onAddPhotos={async (photoFiles) => {
                            try {
                              await addPhotos(bale.id, photoFiles);
                            } catch (error) {
                              console.error('Failed to add photos:', error);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {safeFormatDate(bale.soldDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditSoldDialog(bale)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Sale Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRevertBale(bale)}>
                              <Undo2 className="mr-2 h-4 w-4" />
                              Revert to Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPrintDialog(bale)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Label
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBale(bale)}
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
        </TabsContent>
      </Tabs>

      {/* Add Bale Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Bale</DialogTitle>
            <DialogDescription>
              Add a new bale to the inventory system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1 py-1">
            <div>
              <Label htmlFor="add-contents">Contents</Label>
              <Select 
                value={formData.contents}
                onValueChange={(value) => setFormData({...formData, contents: value as BaleQuality})}
              >
                <SelectTrigger id="add-contents">
                  <SelectValue placeholder="Select contents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A-Quality">A-Quality</SelectItem>
                  <SelectItem value="B-Quality">B-Quality</SelectItem>
                  <SelectItem value="C-Quality">C-Quality</SelectItem>
                  <SelectItem value="Creme">Creme</SelectItem>
                  <SelectItem value="Shoes">Shoes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="add-weight">Weight (Kg)</Label>
              <Input
                id="add-weight"
                type="number"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="Enter weight in kilograms..."
              />
            </div>
            <div>
              <Label htmlFor="add-notes">Notes (Optional)</Label>
              <Textarea
                id="add-notes"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, notes: e.target.value})}
                placeholder="Enter any additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setFormData({ contents: 'A-Quality', weight: '', status: 'Warehouse', notes: '' });
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddBale}>Create Bale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bale Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bale</DialogTitle>
            <DialogDescription>
              Update the bale details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1 py-1">
            <div>
              <Label htmlFor="edit-contents">Contents</Label>
              <Select 
                value={formData.contents}
                onValueChange={(value) => setFormData({...formData, contents: value as BaleQuality})}
              >
                <SelectTrigger id="edit-contents">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A-Quality">A-Quality</SelectItem>
                  <SelectItem value="B-Quality">B-Quality</SelectItem>
                  <SelectItem value="C-Quality">C-Quality</SelectItem>
                  <SelectItem value="Creme">Creme</SelectItem>
                  <SelectItem value="Shoes">Shoes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-weight">Weight (Kg)</Label>
              <Input
                id="edit-weight"
                type="number"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value as BaleStatus})}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Container">Container</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBale}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Sold Dialog */}
      <Dialog open={isSoldDialogOpen} onOpenChange={setIsSoldDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Bale as Sold</DialogTitle>
            <DialogDescription>
              Enter the sale details for {selectedBale?.baleNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1 py-1">
            {selectedBale && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bale Weight:</span>
                  <span className="font-medium">{selectedBale.weight} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quality:</span>
                  <span className="font-medium">{selectedBale.contents}</span>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="sale-price">Sale Price (USD)</Label>
              <Input
                id="sale-price"
                type="number"
                min="0"
                step="0.01"
                value={soldFormData.salePrice}
                onChange={(e) => setSoldFormData({...soldFormData, salePrice: parseFloat(e.target.value) || 0})}
                placeholder="Enter sale price in USD"
              />
              {soldFormData.salePrice > 0 && selectedBale && (
                <div className="mt-2 text-sm text-gray-600">
                  Price per kg: <span className="font-medium text-gray-900">
                    ${formatNumber(soldFormData.salePrice / selectedBale.weight)}/kg
                  </span>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select 
                value={soldFormData.paymentMethod}
                onValueChange={(value) => setSoldFormData({...soldFormData, paymentMethod: value as PaymentMethod})}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Wire">Wire Transfer</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSoldDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsSold}>Mark as Sold</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sale Details Dialog */}
      <Dialog open={isEditSoldDialogOpen} onOpenChange={setIsEditSoldDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sale Details</DialogTitle>
            <DialogDescription>
              Update the sale details for {selectedBale?.baleNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-1 py-1">
            {selectedBale && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bale Weight:</span>
                  <span className="font-medium">{selectedBale.weight} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quality:</span>
                  <span className="font-medium">{selectedBale.contents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sold Date:</span>
                  <span className="font-medium">{safeFormatDate(selectedBale.soldDate)}</span>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="edit-sale-price">Sale Price (USD)</Label>
              <Input
                id="edit-sale-price"
                type="number"
                min="0"
                step="0.01"
                value={editSoldFormData.salePrice}
                onChange={(e) => setEditSoldFormData({...editSoldFormData, salePrice: parseFloat(e.target.value) || 0})}
                placeholder="Enter sale price in USD"
              />
              {editSoldFormData.salePrice > 0 && selectedBale && (
                <div className="mt-2 text-sm text-gray-600">
                  Price per kg: <span className="font-medium text-gray-900">
                    ${formatNumber(editSoldFormData.salePrice / selectedBale.weight)}/kg
                  </span>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="edit-payment-method">Payment Method</Label>
              <Select 
                value={editSoldFormData.paymentMethod}
                onValueChange={(value) => setEditSoldFormData({...editSoldFormData, paymentMethod: value as PaymentMethod})}
              >
                <SelectTrigger id="edit-payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Wire">Wire Transfer</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSoldDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSoldBale}>Update Sale Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Print Bale Label</DialogTitle>
            <DialogDescription>
              4x6 label for {selectedBale?.baleNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="border p-4 bg-white">
            <div ref={printRef} className="w-96 h-64 p-4 border-2 border-black bg-white text-black flex flex-col justify-between" style={{ width: '4in', height: '6in' }}>
              <div className="text-center border-b-2 border-black pb-2 mb-2">
                <h2 className="text-2xl font-bold">H&H DONATIONS</h2>
                <p className="text-base">Bale Label</p>
              </div>
              
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div className="text-center">
                  <p className="font-semibold text-lg">Bale Number</p>
                  <p className="text-3xl font-bold mt-2">{selectedBale?.baleNumber}</p>
                </div>
                
                <div className="text-center">
                  <p className="font-semibold text-lg">Contents</p>
                  <p className="text-2xl font-bold mt-2">{selectedBale?.contents}</p>
                </div>
                
                <div className="text-center">
                  <p className="font-semibold text-lg">Weight</p>
                  <p className="text-2xl font-bold mt-2">{selectedBale?.weight} Kg</p>
                </div>
                
                <div className="text-center">
                  <p className="font-semibold text-base">Created Date</p>
                  <p className="text-lg mt-1">{safeFormatDate(selectedBale?.createdDate)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Label
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
              This action cannot be undone. This will permanently delete the bale
              {baleToDelete && (
                <span className="font-semibold"> "{baleToDelete.baleNumber}"</span>
              )}
              {' '}from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setBaleToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBale}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Bale
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revert to Active Confirmation Dialog */}
      <AlertDialog open={isRevertDialogOpen} onOpenChange={setIsRevertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert Bale to Active?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revert bale
              {baleToRevert && (
                <span className="font-semibold"> "{baleToRevert.baleNumber}"</span>
              )}
              {' '}back to active status. The sale price and payment information will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsRevertDialogOpen(false);
              setBaleToRevert(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRevertBale}
              className="bg-red-600 hover:bg-red-700"
            >
              Revert to Active
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default BaleManagement;