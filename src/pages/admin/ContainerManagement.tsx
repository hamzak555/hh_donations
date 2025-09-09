import { useState, useRef, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { useContainers } from '@/contexts/ContainersContextSupabase';
import { useBales } from '@/contexts/BalesContextSupabase';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash,
  Package, 
  Ship, 
  Calendar as CalendarIcon,
  MapPin,
  FileText,
  Clock,
  Eye,
  Download,
  Upload,
  X,
  Search,
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Undo2,
  Image as ImageIcon,
  FileCheck,
  ArrowUpDown,
  ChevronUp,
  Settings2
} from 'lucide-react';
import { format } from 'date-fns';
import { Bale, BaleStatus } from '@/contexts/BalesContextSupabase';
import { DocumentEntry } from '@/contexts/ContainersContextSupabase';
import { Progress } from "@/components/ui/progress";

// Photo Lightbox Component
interface LightboxProps {
  photos: {id: string, data: string}[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const PhotoLightbox = ({ photos, isOpen, onClose, initialIndex = 0 }: LightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

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
          alt={`Photo ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>
    </div>
  );
};

// Simple photo preview component for container assignment dialog
interface BalePhotosPreviewProps {
  bale: Bale;
}

const BalePhotosPreview = ({ bale }: BalePhotosPreviewProps) => {
  const [actualPhotos, setActualPhotos] = useState<{id: string, data: string}[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { getPhotosWithIds } = useBales();
  
  useEffect(() => {
    const loadPhotos = async () => {
      if (bale.photos && bale.photos.length > 0) {
        try {
          const photoData = await getPhotosWithIds(bale.id);
          setActualPhotos(photoData.slice(0, 3)); // Show max 3 photos
        } catch (error) {
          console.error('Failed to load photos:', error);
          setActualPhotos([]);
        }
      } else {
        setActualPhotos([]);
      }
    };
    
    loadPhotos();
  }, [bale.photos, bale.id, getPhotosWithIds]);

  const photoCount = bale.photos?.length || 0;
  const displayPhotos = actualPhotos.slice(0, 2);
  const remainingCount = photoCount > 2 ? photoCount - 2 : 0;

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (photoCount === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-1 ml-2">
        {displayPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="w-6 h-6 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
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
          <div 
            className="w-6 h-6 rounded bg-gray-100 text-xs font-medium flex items-center justify-center cursor-pointer hover:bg-gray-200"
            onClick={() => handlePhotoClick(2)}
          >
            +{remainingCount}
          </div>
        )}
      </div>
      
      {/* Lightbox for this bale's photos */}
      {lightboxOpen && (
        <PhotoLightbox
          photos={actualPhotos}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          initialIndex={lightboxIndex}
        />
      )}
    </>
  );
};

interface ContainerFormData {
  destination: string;
  shipmentDate?: Date;
  estimatedArrivalDate?: Date;
  status: 'Warehouse' | 'Shipped';
  sealNumber?: string;
  shippingLine?: string;
  vesselName?: string;
  billOfLading?: string;
  notes?: string;
}

// Quality badge color scheme (same as BaleManagement)
const getQualityBadge = (quality: string) => {
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
    <Badge variant="outline" className={`${styleClass} border`}>
      {displayQuality}
    </Badge>
  );
};

// Get bale status badge for assignment dialog
const getBaleStatusBadge = (status: BaleStatus) => {
  if (status === 'Sold') {
    return (
      <Badge className="text-xs bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
        Sold
      </Badge>
    );
  }
  return null;
};

// Column visibility configuration
const COLUMN_IDS = {
  containerNumber: 'Container Number',
  destination: 'Destination',
  bales: 'Bales',
  totalWeight: 'Total Weight',
  shipmentDate: 'Shipment Date',
  status: 'Status',
  documents: 'Documents',
  notes: 'Notes'
} as const;

type ColumnId = keyof typeof COLUMN_IDS;

function ContainerManagement() {
  const { 
    containers, 
    isLoading: containersLoading,
    isCreating,
    error: containersError,
    addContainer, 
    updateContainer, 
    deleteContainer,
    generateContainerNumber,
    assignBaleToContainer,
    removeBaleFromContainer,
    addNoteToTimeline,
    markAsShipped,
    unmarkAsShipped,
    addDocuments,
    deleteDocument
  } = useContainers();
  
  const { 
    bales, 
    updateBale,
    assignToContainer: assignBaleToContainerInBales,
    removeFromContainer: removeBaleFromContainerInBales,
    getBalesByContainer 
  } = useBales();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'warehouse' | 'shipped'>('all');
  const [sortColumn, setSortColumn] = useState<string | null>('createdDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAssignBalesDialogOpen, setIsAssignBalesDialogOpen] = useState(false);
  const [isMarkShippedDialogOpen, setIsMarkShippedDialogOpen] = useState(false);
  const [isUnmarkShippedDialogOpen, setIsUnmarkShippedDialogOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<any>(null);
  const [selectedContainers, setSelectedContainers] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [detailsTabValue, setDetailsTabValue] = useState<string>('details');
  const [formData, setFormData] = useState<ContainerFormData>({
    destination: '',
    status: 'Warehouse'
  });
  const [selectedBalesForAssignment, setSelectedBalesForAssignment] = useState<string[]>([]);
  const [baleSearchTerm, setBaleSearchTerm] = useState('');
  const [newNote, setNewNote] = useState('');
  const [hoverCardNotes, setHoverCardNotes] = useState<{ [containerId: string]: string }>({});
  const destinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const editDestinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{id: string, name: string} | null>(null);
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnId>>(() => {
    const savedColumns = localStorage.getItem('containersTableColumns');
    if (savedColumns) {
      try {
        const parsed = JSON.parse(savedColumns);
        // Filter out any invalid column IDs that don't exist in current COLUMN_IDS
        const validColumns = parsed.filter((col: string) => col in COLUMN_IDS);
        return new Set(validColumns as ColumnId[]);
      } catch {
        // If parsing fails, return default
      }
    }
    // Default visible columns
    return new Set(Object.keys(COLUMN_IDS) as ColumnId[]);
  });
  
  // Save column visibility preferences
  const handleColumnVisibilityChange = (columnId: ColumnId, visible: boolean) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (visible) {
        newSet.add(columnId);
      } else {
        newSet.delete(columnId);
      }
      // Save to localStorage
      localStorage.setItem('containersTableColumns', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  // Handle Google Places Autocomplete for create dialog
  const onDestinationLoad = (autocomplete: google.maps.places.Autocomplete) => {
    destinationAutocompleteRef.current = autocomplete;
    // Configure for cities only, no country restrictions
    autocomplete.setOptions({
      types: ['(cities)'],
      // No componentRestrictions to allow international locations
    });
    
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.address_components) {
        // Extract city and country
        let city = '';
        let country = '';
        
        for (const component of place.address_components) {
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
            if (!city) city = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
        }
        
        const formattedDestination = city && country ? `${city}, ${country}` : place.formatted_address || '';
        setFormData(prev => ({...prev, destination: formattedDestination}));
      }
    });
  };

  const onDestinationPlaceChanged = () => {
    if (destinationAutocompleteRef.current) {
      const place = destinationAutocompleteRef.current.getPlace();
      if (place.address_components) {
        // Extract city and country
        let city = '';
        let country = '';
        
        for (const component of place.address_components) {
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
            if (!city) city = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
        }
        
        const formattedDestination = city && country ? `${city}, ${country}` : place.formatted_address || '';
        setFormData(prev => ({...prev, destination: formattedDestination}));
      }
    }
  };

  // Handle Google Places Autocomplete for edit dialog
  const onEditDestinationLoad = (autocomplete: google.maps.places.Autocomplete) => {
    editDestinationAutocompleteRef.current = autocomplete;
    // Configure for cities only, no country restrictions
    autocomplete.setOptions({
      types: ['(cities)'],
      // No componentRestrictions to allow international locations
    });
    
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.address_components) {
        // Extract city and country
        let city = '';
        let country = '';
        
        for (const component of place.address_components) {
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
            if (!city) city = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
        }
        
        const formattedDestination = city && country ? `${city}, ${country}` : place.formatted_address || '';
        setFormData(prev => ({...prev, destination: formattedDestination}));
      }
    });
  };

  const onEditDestinationPlaceChanged = () => {
    if (editDestinationAutocompleteRef.current) {
      const place = editDestinationAutocompleteRef.current.getPlace();
      if (place.address_components) {
        // Extract city and country
        let city = '';
        let country = '';
        
        for (const component of place.address_components) {
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
            if (!city) city = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
        }
        
        const formattedDestination = city && country ? `${city}, ${country}` : place.formatted_address || '';
        setFormData(prev => ({...prev, destination: formattedDestination}));
      }
    }
  };

  // Function to get the actual count of bales assigned to a container
  const getActualBaleCount = (containerNumber: string) => {
    // Only count non-sold bales to avoid counting historical assignments
    return bales.filter(bale => 
      bale.containerNumber === containerNumber && bale.status !== 'Sold'
    ).length;
  };

  // Function to calculate total weight of bales in a container
  const getContainerTotalWeight = (containerNumber: string) => {
    // Only count non-sold bales to avoid counting historical assignments
    const containerBales = bales.filter(bale => 
      bale.containerNumber === containerNumber && bale.status !== 'Sold'
    );
    return containerBales.reduce((total, bale) => total + (bale.weight || 0), 0);
  };

  // Handle sorting
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

  // Filter and sort containers based on search, status, and sorting
  const getFilteredContainers = () => {
    let filtered = containers;
    
    // Filter by tab
    if (activeTab === 'warehouse') {
      filtered = filtered.filter(container => container.status === 'Warehouse');
    } else if (activeTab === 'shipped') {
      filtered = filtered.filter(container => container.status === 'Shipped');
    }
    
    // Filter by search
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(container => 
        container.containerNumber.toLowerCase().includes(query) ||
        container.destination.toLowerCase().includes(query)
      );
    }
    
    // Sort the filtered results
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        // Handle special columns
        if (sortColumn === 'bales') {
          aValue = getActualBaleCount(a.containerNumber);
          bValue = getActualBaleCount(b.containerNumber);
        } else if (sortColumn === 'totalWeight') {
          aValue = getContainerTotalWeight(a.containerNumber);
          bValue = getContainerTotalWeight(b.containerNumber);
        } else if (sortColumn === 'documents') {
          aValue = a.documents?.length || 0;
          bValue = b.documents?.length || 0;
        } else if (sortColumn === 'notes') {
          aValue = a.notesTimeline?.length || 0;
          bValue = b.notesTimeline?.length || 0;
        } else {
          aValue = a[sortColumn as keyof typeof a];
          bValue = b[sortColumn as keyof typeof b];
        }
        
        // Handle null/undefined values
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';
        
        // Numeric comparison for numbers
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // String comparison for everything else
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }
    
    return filtered;
  };
  
  const filteredContainers = getFilteredContainers();

  // Clean up orphaned ACTIVE bales (bales assigned to non-existent containers)
  // Don't clean up sold bales - we want to keep their container history
  useEffect(() => {
    const validContainerNumbers = containers.map(c => c.containerNumber);
    const orphanedBales = bales.filter(bale => 
      bale.containerNumber && 
      !validContainerNumbers.includes(bale.containerNumber) &&
      bale.status !== 'Sold'  // Only clean up active bales, not sold ones
    );
    
    if (orphanedBales.length > 0) {
      console.log(`Found ${orphanedBales.length} orphaned active bales, cleaning up...`);
      orphanedBales.forEach(bale => {
        console.log(`Removing container reference ${bale.containerNumber} from active bale ${bale.baleNumber}`);
        updateBale(bale.id, { containerNumber: null });
      });
    }
  }, [containers, bales, updateBale]);

  // Get available bales for assignment (not already in containers and not sold)
  // Match the logic from BaleManagement: Active bales are those that are not sold
  const availableBales = bales.filter(bale => 
    !bale.containerNumber && bale.status !== 'Sold'
  );
  
  // Filter available bales by search term
  const filteredAvailableBales = availableBales.filter(bale => {
    if (!baleSearchTerm) return true;
    const searchLower = baleSearchTerm.toLowerCase();
    return (
      bale.baleNumber.toLowerCase().includes(searchLower) ||
      bale.contents.toLowerCase().includes(searchLower) ||
      bale.weight.toString().includes(searchLower)
    );
  });
  
  // Get bales already assigned to the selected container (reactive)
  const getAssignedBales = () => {
    if (!selectedContainer) return [];
    // Only return non-sold bales to avoid showing historical assignments
    return bales.filter(bale => 
      bale.containerNumber === selectedContainer.containerNumber && bale.status !== 'Sold'
    );
  };
  
  const [assignedBalesState, setAssignedBalesState] = useState<Bale[]>([]);
  
  // Update assigned bales when dialog opens or bales change
  useEffect(() => {
    if (isAssignBalesDialogOpen && selectedContainer) {
      const assigned = bales.filter(bale => 
        bale.containerNumber === selectedContainer.containerNumber && bale.status !== 'Sold'
      );
      setAssignedBalesState(assigned);
    }
  }, [selectedContainer, bales, isAssignBalesDialogOpen]);
  
  // Keep selectedContainer in sync with containers context when documents are added
  useEffect(() => {
    if (selectedContainer && isDetailsDialogOpen) {
      const updated = containers.find(c => c.id === selectedContainer.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedContainer)) {
        setSelectedContainer(updated);
      }
    }
  }, [containers]);

  const handleCreateContainer = async () => {
    try {
      const containerData = {
        destination: formData.destination,
        status: formData.status,
        shipmentDate: formData.shipmentDate ? formData.shipmentDate.toISOString().split('T')[0] : undefined,
        estimatedArrivalDate: formData.estimatedArrivalDate ? formData.estimatedArrivalDate.toISOString().split('T')[0] : undefined,
        sealNumber: formData.sealNumber,
        shippingLine: formData.shippingLine,
        vesselName: formData.vesselName,
        billOfLading: formData.billOfLading,
        notes: formData.notes,
        assignedBales: []
      };
      
      await addContainer(containerData);
      
      setIsCreateDialogOpen(false);
      setFormData({ destination: '', status: 'Warehouse' });
    } catch (error) {
      console.error('Failed to create container:', error);
      
      // Close dialog anyway to avoid getting stuck
      setIsCreateDialogOpen(false);
      setFormData({ destination: '', status: 'Warehouse' });
      
      // You could show an error toast here
      alert('Failed to create container. Please try again.');
    }
  };

  const handleEditContainer = () => {
    if (selectedContainer) {
      const containerData = {
        destination: formData.destination,
        status: formData.status,
        shipmentDate: formData.shipmentDate ? formData.shipmentDate.toISOString().split('T')[0] : undefined,
        estimatedArrivalDate: formData.estimatedArrivalDate ? formData.estimatedArrivalDate.toISOString().split('T')[0] : undefined,
        sealNumber: formData.sealNumber,
        shippingLine: formData.shippingLine,
        vesselName: formData.vesselName,
        billOfLading: formData.billOfLading
      };
      updateContainer(selectedContainer.id, containerData);
      setIsEditDialogOpen(false);
      setSelectedContainer(null);
      setFormData({ destination: '', status: 'Warehouse' });
    }
  };

  const handleDeleteContainer = () => {
    if (selectedContainer) {
      // First remove all bales from container - check both assignedBales and containerNumber
      // Handle bales in assignedBales array
      selectedContainer.assignedBales?.forEach((baleId: string) => {
        removeBaleFromContainerInBales(baleId);
      });
      
      // Clear containerNumber from ALL bales to prevent orphaned references
      // when a new container with the same number is created
      const allAffectedBales = bales.filter(b => 
        b.containerNumber === selectedContainer.containerNumber
      );
      
      allAffectedBales.forEach(bale => {
        if (bale.status === 'Sold') {
          // For sold bales, keep the containerNumber for display purposes
          // The deleted container won't exist so it won't conflict with new containers
          // The location field preserves the destination history
          // No update needed for sold bales
        } else {
          // For active bales, clear containerNumber and reset status to Warehouse
          updateBale(bale.id, { 
            containerNumber: null, 
            status: 'Warehouse' 
          });
        }
      });
      
      deleteContainer(selectedContainer.id);
      setIsDeleteDialogOpen(false);
      setSelectedContainer(null);
    }
  };

  const handleSelectAll = () => {
    const currentContainers = getFilteredContainers();
    if (selectedContainers.size === currentContainers.length) {
      setSelectedContainers(new Set());
    } else {
      setSelectedContainers(new Set(currentContainers.map(c => c.id)));
    }
  };

  const handleSelectContainer = (containerId: string, event?: React.MouseEvent) => {
    const filteredContainers = getFilteredContainers();
    const clickedIndex = filteredContainers.findIndex(c => c.id === containerId);
    
    if (event?.shiftKey && lastSelectedIndex !== null) {
      // Shift-click: select range
      const start = Math.min(lastSelectedIndex, clickedIndex);
      const end = Math.max(lastSelectedIndex, clickedIndex);
      const newSelection = new Set(selectedContainers);
      
      for (let i = start; i <= end; i++) {
        newSelection.add(filteredContainers[i].id);
      }
      
      setSelectedContainers(newSelection);
    } else {
      // Regular click: toggle selection
      const newSelection = new Set(selectedContainers);
      if (newSelection.has(containerId)) {
        newSelection.delete(containerId);
      } else {
        newSelection.add(containerId);
      }
      setSelectedContainers(newSelection);
      setLastSelectedIndex(clickedIndex);
    }
  };

  const handleBulkDelete = async () => {
    try {
      // Delete all selected containers
      const deletePromises = Array.from(selectedContainers).map(containerId => {
        const container = containers.find(c => c.id === containerId);
        if (container) {
          // First remove all bales from container - check both assignedBales and containerNumber
          // Handle bales in assignedBales array
          container.assignedBales?.forEach((baleId: string) => {
            removeBaleFromContainerInBales(baleId);
          });
          
          // Clear containerNumber from ALL bales to prevent orphaned references
          // when a new container with the same number is created
          const allAffectedBales = bales.filter(b => 
            b.containerNumber === container.containerNumber
          );
          
          allAffectedBales.forEach(bale => {
            if (bale.status === 'Sold') {
              // For sold bales, keep the containerNumber for display purposes
              // The deleted container won't exist so it won't conflict with new containers
              // The location field preserves the destination history
              // No update needed for sold bales
            } else {
              // For active bales, clear containerNumber and reset status to Warehouse
              updateBale(bale.id, { 
                containerNumber: null, 
                status: 'Warehouse' 
              });
            }
          });
        }
        return deleteContainer(containerId);
      });
      
      await Promise.all(deletePromises);
      
      // Clear selection after successful deletion
      setSelectedContainers(new Set());
      setLastSelectedIndex(null);
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting containers:', error);
    }
  };

  const handleMarkAsShipped = () => {
    if (selectedContainer) {
      markAsShipped(selectedContainer.id);
      // Update all bales in this container to Shipped status
      const containerBales = bales.filter(b => 
        b.containerNumber === selectedContainer.containerNumber && b.status !== 'Sold'
      );
      containerBales.forEach(bale => {
        updateBale(bale.id, { status: 'Shipped' });
      });
      setIsMarkShippedDialogOpen(false);
      setSelectedContainer(null);
    }
  };

  const handleUnmarkAsShipped = () => {
    if (selectedContainer) {
      unmarkAsShipped(selectedContainer.id);
      // Update all bales in this container back to Container status
      const containerBales = bales.filter(b => 
        b.containerNumber === selectedContainer.containerNumber && b.status !== 'Sold'
      );
      containerBales.forEach(bale => {
        updateBale(bale.id, { status: 'Container' });
      });
      setIsUnmarkShippedDialogOpen(false);
      setSelectedContainer(null);
    }
  };

  const handleAssignBales = () => {
    if (selectedContainer && selectedBalesForAssignment.length > 0) {
      selectedBalesForAssignment.forEach(baleId => {
        assignBaleToContainer(selectedContainer.id, baleId);
        assignBaleToContainerInBales(baleId, selectedContainer.containerNumber);
      });
      
      // Update container total weight
      const assignedBales = [...(selectedContainer.assignedBales || []), ...selectedBalesForAssignment];
      const totalWeight = assignedBales.reduce((sum, baleId) => {
        const bale = bales.find(b => b.id === baleId);
        return sum + (bale?.weight || 0);
      }, 0);
      
      updateContainer(selectedContainer.id, { totalWeight });
      setIsAssignBalesDialogOpen(false);
      setSelectedBalesForAssignment([]);
    }
  };

  const handleRemoveBaleFromContainer = (containerId: string, baleId: string) => {
    removeBaleFromContainer(containerId, baleId);
    removeBaleFromContainerInBales(baleId);
    
    // Update container total weight
    const container = containers.find(c => c.id === containerId);
    if (container) {
      const remainingBales = container.assignedBales.filter(id => id !== baleId);
      const totalWeight = remainingBales.reduce((sum, id) => {
        const bale = bales.find(b => b.id === id);
        return sum + (bale?.weight || 0);
      }, 0);
      updateContainer(containerId, { totalWeight });
    }
  };

  const handleAddNote = () => {
    if (selectedContainer && newNote.trim()) {
      addNoteToTimeline(selectedContainer.id, newNote);
      setNewNote('');
      // Refresh selected container
      const updated = containers.find(c => c.id === selectedContainer.id);
      setSelectedContainer(updated);
    }
  };

  const handleAddNoteToTimeline = (containerId: string) => {
    const noteText = hoverCardNotes[containerId];
    
    if (noteText && noteText.trim()) {
      addNoteToTimeline(containerId, noteText);
      setHoverCardNotes(prev => ({ ...prev, [containerId]: '' }));
    }
  };

  const processFiles = async (files: FileList) => {
    if (files && selectedContainer) {
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
      addDocuments(selectedContainer.id, documentEntries);
      
      // Reset upload state
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(files);
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
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  const openEditDialog = (container: any) => {
    setSelectedContainer(container);
    setFormData({
      destination: container.destination,
      shipmentDate: container.shipmentDate ? new Date(container.shipmentDate) : undefined,
      estimatedArrivalDate: container.estimatedArrivalDate ? new Date(container.estimatedArrivalDate) : undefined,
      status: container.status,
      sealNumber: container.sealNumber,
      shippingLine: container.shippingLine,
      vesselName: container.vesselName,
      billOfLading: container.billOfLading,
      notes: container.notes
    });
    setIsEditDialogOpen(true);
  };

  const openDetailsDialog = (container: any, tab: string = 'details') => {
    console.log('Opening details dialog with tab:', tab);
    setSelectedContainer(container);
    setDetailsTabValue(tab);
    setIsDetailsDialogOpen(true);
  };

  const openAssignBalesDialog = (container: any) => {
    setSelectedContainer(container);
    setIsAssignBalesDialogOpen(true);
  };

  const handleDeleteDocument = () => {
    if (selectedContainer && documentToDelete) {
      deleteDocument(selectedContainer.id, documentToDelete.id);
      setDocumentToDelete(null);
      // Refresh selected container
      const updated = containers.find(c => c.id === selectedContainer.id);
      setSelectedContainer(updated);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Warehouse': 'bg-blue-100 text-blue-800 border-blue-200',
      'Shipped': 'bg-green-100 text-green-800 border-green-200',
      'In Transit': 'bg-green-100 text-green-800 border-green-200',
      'Delivered': 'bg-green-100 text-green-800 border-green-200'
    };
    return (
      <Badge variant="outline" className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {status}
      </Badge>
    );
  };

  const exportManifest = (container: any) => {
    // Create CSV header
    const csvHeaders = [
      'Container Number',
      'Destination',
      'Status',
      'Shipment Date',
      'Estimated Arrival',
      'Total Weight (kg)',
      'Total Bales',
      'Seal Number',
      'Shipping Line',
      'Vessel Name',
      'Bill of Lading',
      'Bale Number',
      'Bale Contents',
      'Bale Weight (kg)',
      'Generated Date'
    ];

    // Get container data
    const containerData = {
      containerNumber: container.containerNumber,
      destination: container.destination,
      status: container.status,
      shipmentDate: container.shipmentDate || '',
      estimatedArrival: container.estimatedArrivalDate || '',
      totalWeight: getContainerTotalWeight(container.containerNumber),
      totalBales: getActualBaleCount(container.containerNumber),
      sealNumber: container.sealNumber || '',
      shippingLine: container.shippingLine || '',
      vesselName: container.vesselName || '',
      billOfLading: container.billOfLading || '',
      generatedDate: new Date().toISOString()
    };

    // Get assigned bales data
    const assignedBalesData = container.assignedBales?.map((baleId: string) => {
      const bale = bales.find(b => b.id === baleId);
      if (bale) {
        return {
          baleNumber: bale.baleNumber,
          baleContents: bale.contents,
          baleWeight: bale.weight
        };
      }
      return null;
    }).filter(Boolean) || [];

    // Create CSV rows
    const csvRows = [];
    csvRows.push(csvHeaders.join(','));

    // If there are bales, create a row for each bale
    if (assignedBalesData.length > 0) {
      assignedBalesData.forEach((bale: any, index: number) => {
        const row = [
          containerData.containerNumber,
          `"${containerData.destination}"`,
          containerData.status,
          containerData.shipmentDate,
          containerData.estimatedArrival,
          containerData.totalWeight,
          containerData.totalBales,
          containerData.sealNumber,
          `"${containerData.shippingLine}"`,
          `"${containerData.vesselName}"`,
          containerData.billOfLading,
          bale.baleNumber,
          bale.baleContents,
          bale.baleWeight,
          index === 0 ? containerData.generatedDate : ''
        ];
        csvRows.push(row.join(','));
      });
    } else {
      // If no bales, create one row with container info only
      const row = [
        containerData.containerNumber,
        `"${containerData.destination}"`,
        containerData.status,
        containerData.shipmentDate,
        containerData.estimatedArrival,
        containerData.totalWeight,
        containerData.totalBales,
        containerData.sealNumber,
        `"${containerData.shippingLine}"`,
        `"${containerData.vesselName}"`,
        containerData.billOfLading,
        '',
        '',
        '',
        containerData.generatedDate
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${container.containerNumber}_manifest.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-10 pb-20 w-full">
      <div className="mb-6 px-4 sm:px-6 lg:px-8">
        {/* Title - always on its own line on mobile */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Containers</h1>
          
          {/* Action buttons - wrap on mobile */}
          <div className="flex flex-wrap gap-2">
            {selectedContainers.size > 0 && (
              <>
                <Button 
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 text-sm"
                >
                  <Trash className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                  <span className="sm:hidden">Del</span> ({selectedContainers.size})
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedContainers(new Set());
                    setLastSelectedIndex(null);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Clear
                </Button>
              </>
            )}
            {/* Column Visibility Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`text-sm ${visibleColumns.size < Object.keys(COLUMN_IDS).length ? "border-green-300 bg-green-50 hover:bg-green-100" : ""}`}
                >
                  <Settings2 className={`h-4 w-4 ${visibleColumns.size < Object.keys(COLUMN_IDS).length ? "text-green-600" : ""}`} />
                  <span className="ml-1 sm:ml-2">Columns</span>
                  <span className={`ml-1 text-xs font-medium ${visibleColumns.size < Object.keys(COLUMN_IDS).length ? "text-green-600" : "text-gray-500"}`}>
                    ({visibleColumns.size}/{Object.keys(COLUMN_IDS).length})
                  </span>
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <div className="px-2 py-1.5 text-sm font-semibold">Toggle columns</div>
              {Object.entries(COLUMN_IDS).map(([id, label]) => (
                <DropdownMenuItem
                  key={id}
                  className="flex items-center space-x-2"
                  onSelect={(e) => {
                    e.preventDefault(); // Prevent dropdown from closing
                  }}
                >
                  <Checkbox
                    id={id}
                    checked={visibleColumns.has(id as ColumnId)}
                    onCheckedChange={(checked) => {
                      handleColumnVisibilityChange(id as ColumnId, checked as boolean);
                    }}
                  />
                  <label
                    htmlFor={id}
                    className="flex-1 cursor-pointer select-none text-sm"
                  >
                    {label}
                  </label>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            variant="outline"
            className="text-sm"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            Create Container
          </Button>
          </div>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Tabs */}
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full sm:flex-1 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedContainers(new Set());
              setLastSelectedIndex(null);
            }}
            className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-sm px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : ''
            }`}
          >
            <span className="truncate">All</span>
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
              activeTab === 'all'
                ? 'bg-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {containers.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('warehouse');
              setSelectedContainers(new Set());
              setLastSelectedIndex(null);
            }}
            className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-sm px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'warehouse'
                ? 'bg-background text-foreground shadow-sm'
                : ''
            }`}
          >
            <span className="truncate">Warehouse</span>
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
              activeTab === 'warehouse'
                ? 'bg-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {containers.filter(c => c.status === 'Warehouse').length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('shipped');
              setSelectedContainers(new Set());
              setLastSelectedIndex(null);
            }}
            className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-sm px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'shipped'
                ? 'bg-background text-foreground shadow-sm'
                : ''
            }`}
          >
            <span className="truncate">Shipped</span>
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
              activeTab === 'shipped'
                ? 'bg-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {containers.filter(c => c.status === 'Shipped').length}
            </span>
          </button>
        </div>
      </div>

      {/* Containers Table */}
      <div className="mx-4 sm:mx-6 lg:mx-8">
        <Card className="overflow-x-auto">
          <div className="p-6">
          {/* Results Count */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {(() => {
                const tabContainers = activeTab === 'all' 
                  ? containers 
                  : activeTab === 'warehouse' 
                    ? containers.filter(c => c.status === 'Warehouse')
                    : containers.filter(c => c.status === 'Shipped');
                
                if (searchTerm.trim()) {
                  return <>Showing {filteredContainers.length} of {tabContainers.length} {activeTab === 'all' ? '' : activeTab} containers</>;
                }
                return <>Showing {filteredContainers.length} {activeTab === 'all' ? 'total' : activeTab} containers</>;
              })()}
            </div>
          </div>
          
            <div className="inline-block min-w-full align-middle">
              <Table className="min-w-[1000px] focus:outline-none" tabIndex={-1}>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedContainers.size === getFilteredContainers().length && getFilteredContainers().length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                {visibleColumns.has('containerNumber') && (
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('containerNumber')}
                  >
                    <div className="flex items-center gap-1">
                      Container Number
                      {getSortIcon('containerNumber')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.has('destination') && (
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('destination')}
                  >
                    <div className="flex items-center gap-1">
                      Destination
                      {getSortIcon('destination')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.has('bales') && (
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('bales')}
                  >
                    <div className="flex items-center gap-1">
                      Bales
                      {getSortIcon('bales')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.has('totalWeight') && (
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('totalWeight')}
                  >
                    <div className="flex items-center gap-1">
                      Total Weight
                      {getSortIcon('totalWeight')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.has('shipmentDate') && (
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('shipmentDate')}
                  >
                    <div className="flex items-center gap-1">
                      Shipment Date
                      {getSortIcon('shipmentDate')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.has('status') && (
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.has('documents') && (
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('documents')}
                  >
                    <div className="flex items-center gap-1">
                      Documents
                      {getSortIcon('documents')}
                    </div>
                  </TableHead>
                )}
                {visibleColumns.has('notes') && (
                  <TableHead 
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('notes')}
                  >
                    <div className="flex items-center gap-1">
                      Notes
                      {getSortIcon('notes')}
                    </div>
                  </TableHead>
                )}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="focus:outline-none">
              {containersLoading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={visibleColumns.size + 2} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading containers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredContainers.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={visibleColumns.size + 2} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Package className="w-12 h-12 text-gray-300" />
                      <div className="space-y-1">
                        <p className="text-gray-500 font-medium">
                          {searchTerm ? 'No containers found matching your search' : 'No containers yet'}
                        </p>
                        {!searchTerm && (
                          <p className="text-sm text-gray-400">
                            Click the "Create Container" button above to add your first container
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContainers.map((container) => (
                <TableRow 
                  key={`${container.id}-${container.containerNumber}`}
                  className={`cursor-pointer select-none focus:outline-none ${
                    selectedContainers.has(container.id) ? 'bg-primary/5' : ''
                  } ${container.status === 'Shipped' ? 'bg-green-50 hover:bg-green-100' : ''}`}
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
                    handleSelectContainer(container.id, e);
                  }}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedContainers.has(container.id)}
                      onCheckedChange={() => {
                        // Use onClick for proper event handling with shift key
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectContainer(container.id, e);
                      }}
                    />
                  </TableCell>
                  {visibleColumns.has('containerNumber') && (
                    <TableCell className="font-medium">{container.containerNumber}</TableCell>
                  )}
                  {visibleColumns.has('destination') && (
                    <TableCell>
                      {container.destination}
                    </TableCell>
                  )}
                  {visibleColumns.has('bales') && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-left justify-start"
                        onClick={() => openAssignBalesDialog(container)}
                      >
                        <Package className="w-4 h-4 text-gray-400 mr-1.5" />
                        <span className="text-xs">{getActualBaleCount(container.containerNumber)} bales</span>
                      </Button>
                    </TableCell>
                  )}
                  {visibleColumns.has('totalWeight') && (
                    <TableCell>{getContainerTotalWeight(container.containerNumber)} Kg</TableCell>
                  )}
                  {visibleColumns.has('shipmentDate') && (
                    <TableCell>
                      {container.shipmentDate ? (
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-gray-400" />
                          {format(new Date(container.shipmentDate), 'MMM dd, yyyy')}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.has('status') && (
                    <TableCell>{getStatusBadge(container.status)}</TableCell>
                  )}
                  {visibleColumns.has('documents') && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-left justify-start"
                        onClick={() => openDetailsDialog(container, 'documents')}
                      >
                        <FileText className="w-4 h-4 text-gray-400 mr-1.5" />
                        <span className="text-xs">
                          {(() => {
                            const docs = container.documents || [];
                            const count = Array.isArray(docs) ? docs.length : 0;
                            return count > 0 ? `${count} file${count !== 1 ? 's' : ''}` : 'No files';
                          })()}
                        </span>
                      </Button>
                    </TableCell>
                  )}
                  {visibleColumns.has('notes') && (
                    <TableCell>
                      <ContainerNotesHoverCard 
                        container={container}
                        noteValue={hoverCardNotes[container.id] || ''}
                        onNoteChange={(value) => setHoverCardNotes(prev => ({
                          ...prev,
                          [container.id]: value
                        }))}
                        onAddNote={() => handleAddNoteToTimeline(container.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="z-50"
                      >
                        <DropdownMenuItem onClick={() => openDetailsDialog(container)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(container)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Container
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openAssignBalesDialog(container)}>
                          <Package className="mr-2 h-4 w-4" />
                          Assign Bales
                        </DropdownMenuItem>
                        {container.status === 'Warehouse' && (
                          <DropdownMenuItem onClick={() => {
                            setSelectedContainer(container);
                            setIsMarkShippedDialogOpen(true);
                          }}>
                            <Ship className="mr-2 h-4 w-4" />
                            Mark as Shipped
                          </DropdownMenuItem>
                        )}
                        {container.status === 'Shipped' && (
                          <DropdownMenuItem onClick={() => {
                            setSelectedContainer(container);
                            setIsUnmarkShippedDialogOpen(true);
                          }}>
                            <Undo2 className="mr-2 h-4 w-4" />
                            Unmark as Shipped
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => exportManifest(container)}>
                          <Download className="mr-2 h-4 w-4" />
                          Export Manifest
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedContainer(container);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
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
      </div>

      {/* Create Container Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          if (!open && destinationAutocompleteRef.current) {
            const container = document.querySelector('.pac-container') as HTMLElement;
            if (container && container.style.display !== 'none') {
              return; // Don't close if autocomplete dropdown is visible
            }
          }
          setIsCreateDialogOpen(open);
        }}
      >
        <DialogContent 
          className="max-w-2xl"
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
            <DialogTitle>Create New Container</DialogTitle>
            <DialogDescription>
              Create a new shipping container and assign bales to it.
            </DialogDescription>
          </DialogHeader>
          
          {/* Show the container number that will be assigned */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Container Number: {generateContainerNumber()}
              </span>
            </div>
          </div>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="destination">Destination (City, Country)</Label>
              <Autocomplete
                onLoad={onDestinationLoad}
                onPlaceChanged={onDestinationPlaceChanged}
                options={{
                  types: ['(cities)'],
                  // No componentRestrictions to allow international locations
                }}
              >
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  placeholder="Start typing a city name (e.g., Mumbai, Lagos, Shanghai)"
                />
              </Autocomplete>
              <p className="text-xs text-gray-500 mt-1">Search for any international city</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Shipment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {formData.shipmentDate ? format(formData.shipmentDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.shipmentDate}
                      onSelect={(date) => setFormData({...formData, shipmentDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Estimated Arrival Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {formData.estimatedArrivalDate ? format(formData.estimatedArrivalDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.estimatedArrivalDate}
                      onSelect={(date) => setFormData({...formData, estimatedArrivalDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sealNumber">Seal Number</Label>
                <Input
                  id="sealNumber"
                  value={formData.sealNumber || ''}
                  onChange={(e) => setFormData({...formData, sealNumber: e.target.value})}
                  placeholder="e.g., SL123456"
                />
              </div>
              <div>
                <Label htmlFor="shippingLine">Shipping Line</Label>
                <Input
                  id="shippingLine"
                  value={formData.shippingLine || ''}
                  onChange={(e) => setFormData({...formData, shippingLine: e.target.value})}
                  placeholder="e.g., Maersk Line"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vesselName">Vessel Name</Label>
                <Input
                  id="vesselName"
                  value={formData.vesselName || ''}
                  onChange={(e) => setFormData({...formData, vesselName: e.target.value})}
                  placeholder="e.g., MV Horizon"
                />
              </div>
              <div>
                <Label htmlFor="billOfLading">Bill of Lading</Label>
                <Input
                  id="billOfLading"
                  value={formData.billOfLading || ''}
                  onChange={(e) => setFormData({...formData, billOfLading: e.target.value})}
                  placeholder="e.g., BL123456789"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Add any initial notes..."
                rows={3}
              />
            </div>
          </div>
          {containersError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{containersError}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateContainer} disabled={isCreating}>
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Container'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Container Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          if (!open && editDestinationAutocompleteRef.current) {
            const container = document.querySelector('.pac-container') as HTMLElement;
            if (container && container.style.display !== 'none') {
              return; // Don't close if autocomplete dropdown is visible
            }
          }
          setIsEditDialogOpen(open);
        }}
      >
        <DialogContent 
          className="max-w-2xl"
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
            <DialogTitle>Edit Container</DialogTitle>
            <DialogDescription>
              Update container details and shipping information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-destination">Destination (City, Country)</Label>
                <Autocomplete
                  onLoad={onEditDestinationLoad}
                  onPlaceChanged={onEditDestinationPlaceChanged}
                  options={{
                    types: ['(cities)'],
                    // No componentRestrictions to allow international locations
                  }}
                >
                  <Input
                    id="edit-destination"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    placeholder="Start typing a city name (e.g., Mumbai, Lagos, Shanghai)"
                  />
                </Autocomplete>
                <p className="text-xs text-gray-500 mt-1">Search for any international city</p>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Warehouse">Warehouse</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Shipment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {formData.shipmentDate ? format(formData.shipmentDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.shipmentDate}
                      onSelect={(date) => setFormData({...formData, shipmentDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Estimated Arrival Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {formData.estimatedArrivalDate ? format(formData.estimatedArrivalDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.estimatedArrivalDate}
                      onSelect={(date) => setFormData({...formData, estimatedArrivalDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-sealNumber">Seal Number</Label>
                <Input
                  id="edit-sealNumber"
                  value={formData.sealNumber || ''}
                  onChange={(e) => setFormData({...formData, sealNumber: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-shippingLine">Shipping Line</Label>
                <Input
                  id="edit-shippingLine"
                  value={formData.shippingLine || ''}
                  onChange={(e) => setFormData({...formData, shippingLine: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-vesselName">Vessel Name</Label>
                <Input
                  id="edit-vesselName"
                  value={formData.vesselName || ''}
                  onChange={(e) => setFormData({...formData, vesselName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-billOfLading">Bill of Lading</Label>
                <Input
                  id="edit-billOfLading"
                  value={formData.billOfLading || ''}
                  onChange={(e) => setFormData({...formData, billOfLading: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditContainer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Container Details Dialog */}
      <Dialog 
        open={isDetailsDialogOpen} 
        onOpenChange={(open) => {
          setIsDetailsDialogOpen(open);
          if (!open) {
            setDetailsTabValue('details'); // Reset to default tab when closing
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Container Details - {selectedContainer?.containerNumber}</DialogTitle>
            <DialogDescription>
              View container information, assigned bales, and timeline.
            </DialogDescription>
          </DialogHeader>
          
          {selectedContainer && (
            <Tabs value={detailsTabValue} onValueChange={setDetailsTabValue} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="bales">Bales ({selectedContainer ? getActualBaleCount(selectedContainer.containerNumber) : 0})</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Container Number</h4>
                    <p className="text-lg font-semibold">{selectedContainer.containerNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <div className="mt-1">{getStatusBadge(selectedContainer.status)}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Destination</h4>
                    <p className="text-lg">{selectedContainer.destination}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Total Weight</h4>
                    <p className="text-lg">{getContainerTotalWeight(selectedContainer.containerNumber)} kg</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Shipment Date</h4>
                    <p className="text-lg">{selectedContainer.shipmentDate || 'Not scheduled'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Estimated Arrival</h4>
                    <p className="text-lg">{selectedContainer.estimatedArrivalDate || 'Not set'}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Seal Number:</span>
                      <span className="ml-2">{selectedContainer.sealNumber || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Shipping Line:</span>
                      <span className="ml-2">{selectedContainer.shippingLine || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Vessel Name:</span>
                      <span className="ml-2">{selectedContainer.vesselName || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Bill of Lading:</span>
                      <span className="ml-2">{selectedContainer.billOfLading || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="bales">
                <ScrollArea className="h-[400px]">
                  {(() => {
                    const containerBales = bales.filter(b => 
                      b.containerNumber === selectedContainer.containerNumber && b.status !== 'Sold'
                    );
                    return containerBales.length > 0 ? (
                      <div className="space-y-2">
                        {containerBales.map((bale) => (
                          <div key={bale.id} className="border rounded-lg p-3 flex justify-between items-center">
                            <div>
                              <span className="font-semibold">{bale.baleNumber}</span>
                              <span className="ml-2">{getQualityBadge(bale.contents)}</span>
                              <div className="text-sm text-gray-500 mt-1">
                                Weight: {bale.weight} kg | Created: {bale.createdDate}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveBaleFromContainer(selectedContainer.id, bale.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No bales assigned to this container
                      </div>
                    );
                  })()}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="timeline">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <Button onClick={handleAddNote}>Add Note</Button>
                  </div>
                  
                  <ScrollArea className="h-[350px]">
                    {selectedContainer.notesTimeline?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedContainer.notesTimeline.map((note: any) => (
                          <div key={note.id} className="border-l-2 border-gray-200 pl-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>
                                {note.author && <span className="font-medium">{note.author} • </span>}
                                {format(new Date(note.timestamp), 'MMM dd, yyyy HH:mm')}
                              </span>
                            </div>
                            <p className="mt-1">{note.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No notes added yet
                      </div>
                    )}
                  </ScrollArea>
                </div>
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
                    <div className="flex flex-col items-center">
                      <div className={`rounded-full flex items-center justify-center transition-colors ${
                        isUploading 
                          ? 'w-10 h-10 bg-blue-100 mb-2' 
                          : 'w-14 h-14 bg-gray-100 mb-3'
                      }`}>
                        <Upload className={`${isUploading ? 'w-5 h-5 text-blue-500 animate-pulse' : 'w-7 h-7 text-gray-400'}`} />
                      </div>
                      
                      {/* Upload Text */}
                      <h3 className={`font-semibold text-gray-900 ${isUploading ? 'text-xs mb-1' : 'text-sm mb-1'}`}>
                        {isUploading ? 'Uploading...' : 'Upload Documents'}
                      </h3>
                      {!isUploading && (
                        <p className="text-xs text-gray-500 mb-4">
                          Drag and drop your files here, or click to browse
                        </p>
                      )}
                      
                      {/* Upload Button */}
                      {!isUploading && (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          disabled={isUploading}
                          className="mb-3 h-8"
                          size="sm"
                        >
                          <FileCheck className="w-3 h-3 mr-2" />
                          Select Files
                        </Button>
                      )}
                      
                      {/* File Type Icons */}
                      {!isUploading && (
                        <>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>PDF, DOC</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              <span>JPG, PNG</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Max 10MB per file
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-blue-700 font-medium text-xs">Processing files...</span>
                        </div>
                        <span className="text-blue-900 font-semibold text-xs">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-1.5" />
                    </div>
                  )}
                  
                  {/* Documents List */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 border-b">
                      <h4 className="text-xs font-medium text-gray-700">
                        Uploaded Documents ({selectedContainer.documents?.length || 0})
                      </h4>
                    </div>
                    <ScrollArea className={`${isUploading ? 'h-[160px]' : 'h-[200px]'} transition-all duration-200`}>
                      {selectedContainer.documents?.length > 0 ? (
                        <div className="p-2 space-y-1">
                          {selectedContainer.documents.map((doc: any, index: number) => {
                            const isDocumentEntry = typeof doc !== 'string';
                            const documentName = isDocumentEntry ? doc.name : `Document ${index + 1}`;
                            const documentData = isDocumentEntry ? doc.data : doc;
                            const documentId = isDocumentEntry ? doc.id : null;
                            const uploadedAt = isDocumentEntry ? doc.uploadedAt : null;
                            
                            // Get file extension from name or data URL
                            const getFileIcon = () => {
                              const name = documentName.toLowerCase();
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
                                  <ImageIcon className="w-4 h-4 text-green-600" />
                                </div>
                              );
                              return (
                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-4 h-4 text-gray-600" />
                                </div>
                              );
                            };
                            
                            return (
                              <div key={documentId || index} className="group relative rounded p-2 hover:bg-gray-50 transition-all duration-150">
                                <div className="flex items-center gap-2">
                                  {getFileIcon()}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs text-gray-900 truncate">{documentName}</p>
                                    {uploadedAt && (
                                      <p className="text-xs text-gray-500">
                                        {format(new Date(uploadedAt), 'MMM dd, yyyy')}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const a = document.createElement('a');
                                        a.href = documentData;
                                        a.download = documentName;
                                        a.click();
                                      }}
                                      className="h-7 w-7 p-0"
                                      title="Download"
                                    >
                                      <Download className="w-3 h-3" />
                                    </Button>
                                    {documentId && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDocumentToDelete({id: documentId, name: documentName})}
                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title="Delete"
                                      >
                                        <Trash className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <FileText className="w-10 h-10 mb-2" />
                          <p className="text-xs font-medium">No documents uploaded</p>
                          <p className="text-xs mt-1">Upload documents to get started</p>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Bales Dialog */}
      <Dialog open={isAssignBalesDialogOpen} onOpenChange={(open) => {
        setIsAssignBalesDialogOpen(open);
        if (!open) {
          setBaleSearchTerm(''); // Clear search when closing
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Assign Bales to Container</DialogTitle>
            <DialogDescription>
              Select bales to assign to {selectedContainer?.containerNumber}
            </DialogDescription>
          </DialogHeader>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search bales by number, quality, or weight..."
              value={baleSearchTerm}
              onChange={(e) => setBaleSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            <div className="space-y-4">
              {/* Already Assigned Bales */}
              {assignedBalesState.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Currently Assigned ({assignedBalesState.length})</h4>
                  <div className="space-y-2">
                    {assignedBalesState.map((bale) => (
                      <div key={bale.id} className="flex items-center space-x-3 p-2 bg-blue-50 rounded">
                        <Checkbox
                          checked={true}
                          disabled
                          className="opacity-50"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{bale.baleNumber}</span>
                            {getQualityBadge(bale.contents)}
                            {bale.status === 'Sold' ? (
                              getBaleStatusBadge(bale.status)
                            ) : (
                              <Badge variant="secondary" className="text-xs">Assigned</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Weight: {bale.weight} kg | Created: {bale.createdDate}
                            {bale.status === 'Sold' && bale.soldDate && (
                              <span className="ml-2">| Sold: {bale.soldDate}</span>
                            )}
                          </div>
                        </div>
                        <BalePhotosPreview bale={bale} />
                        {bale.status !== 'Sold' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                            onClick={() => {
                              removeBaleFromContainer(selectedContainer.id, bale.id);
                              removeBaleFromContainerInBales(bale.id);
                              // Update local state immediately for UI responsiveness
                              setAssignedBalesState(prev => prev.filter(b => b.id !== bale.id));
                            }}
                            title="Remove from container"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Available Bales */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Available to Assign ({filteredAvailableBales.length}
                  {baleSearchTerm && ` of ${availableBales.length}`})
                </h4>
                {filteredAvailableBales.length > 0 ? (
                  <div className="space-y-2">
                    {filteredAvailableBales.map((bale) => (
                  <div 
                    key={bale.id} 
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => {
                      if (selectedBalesForAssignment.includes(bale.id)) {
                        setSelectedBalesForAssignment(
                          selectedBalesForAssignment.filter(id => id !== bale.id)
                        );
                      } else {
                        setSelectedBalesForAssignment([...selectedBalesForAssignment, bale.id]);
                      }
                    }}
                  >
                    <Checkbox
                      checked={selectedBalesForAssignment.includes(bale.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBalesForAssignment([...selectedBalesForAssignment, bale.id]);
                        } else {
                          setSelectedBalesForAssignment(
                            selectedBalesForAssignment.filter(id => id !== bale.id)
                          );
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{bale.baleNumber}</span>
                        {getQualityBadge(bale.contents)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Weight: {bale.weight} kg | Created: {bale.createdDate}
                      </div>
                    </div>
                    <BalePhotosPreview bale={bale} />
                  </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {baleSearchTerm 
                      ? `No bales found matching "${baleSearchTerm}"`
                      : "No available bales to assign"}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <div className="flex justify-between w-full">
              <div className="text-sm text-gray-500">
                {selectedBalesForAssignment.length} bales selected
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsAssignBalesDialogOpen(false);
                  setSelectedBalesForAssignment([]);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignBales}
                  disabled={selectedBalesForAssignment.length === 0}
                >
                  Assign Bales
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedContainers.size} Container{selectedContainers.size !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected container{selectedContainers.size !== 1 ? 's' : ''} and unassign any bales from {selectedContainers.size !== 1 ? 'them' : 'it'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsBulkDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedContainers.size} Container{selectedContainers.size !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the container
              {selectedContainer && (
                <span className="font-semibold"> "{selectedContainer.containerNumber}"</span>
              )}
              {selectedContainer && getActualBaleCount(selectedContainer.containerNumber) > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <AlertCircle className="inline w-4 h-4 mr-1" />
                    <strong>Warning:</strong> This container has {getActualBaleCount(selectedContainer.containerNumber)} assigned bales. 
                    They will be unassigned from this container.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContainer} className="bg-red-600 hover:bg-red-700">
              Delete Container
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark as Shipped Confirmation Dialog */}
      <AlertDialog open={isMarkShippedDialogOpen} onOpenChange={setIsMarkShippedDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Container as Shipped?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark container 
              {selectedContainer && (
                <span className="font-semibold"> "{selectedContainer.containerNumber}"</span>
              )}
              {" "}as shipped?
              {selectedContainer && getActualBaleCount(selectedContainer.containerNumber) > 0 && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <Ship className="inline w-4 h-4 mr-1" />
                    This will also mark all {getActualBaleCount(selectedContainer.containerNumber)} bales in this container as shipped.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsShipped} className="bg-green-600 hover:bg-green-700">
              Mark as Shipped
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unmark as Shipped Confirmation Dialog */}
      <AlertDialog open={isUnmarkShippedDialogOpen} onOpenChange={setIsUnmarkShippedDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unmark Container as Shipped?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unmark container 
              {selectedContainer && (
                <span className="font-semibold"> "{selectedContainer.containerNumber}"</span>
              )}
              {" "}as shipped and return it to warehouse status?
              {selectedContainer && getActualBaleCount(selectedContainer.containerNumber) > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <Undo2 className="inline w-4 h-4 mr-1" />
                    This will change the status of all {getActualBaleCount(selectedContainer.containerNumber)} bales from "Shipped" back to "Container".
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnmarkAsShipped}>
              Unmark as Shipped
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Document Alert Dialog */}
      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocumentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ContainerNotesHoverCard component for displaying and adding notes
interface ContainerNotesHoverCardProps {
  container: any;
  noteValue: string;
  onNoteChange: (value: string) => void;
  onAddNote: () => void;
}

const ContainerNotesHoverCard = ({ container, noteValue, onNoteChange, onAddNote }: ContainerNotesHoverCardProps) => {
  const noteCount = container.notesTimeline?.length || 0;
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
      <PopoverContent 
        className="w-[90vw] sm:w-96 max-w-[400px]" 
        align="center" 
        side="top" 
        sideOffset={5}
        alignOffset={0}
        collisionPadding={10}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold text-sm">Notes Timeline</h4>
            <span className="text-xs text-gray-500">{container.containerNumber}</span>
          </div>
          
          {/* Notes Timeline */}
          <ScrollArea className="h-48 pr-3">
            {hasNotes ? (
              <div className="space-y-3">
                {container.notesTimeline?.map((note: any) => (
                  <div key={note.id} className="border-l-2 border-gray-200 pl-3 ml-1">
                    <p className="text-sm text-gray-700">{note.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {note.author && <span className="font-medium">{note.author} • </span>}
                      {format(new Date(note.timestamp), 'MMM dd, yyyy h:mm a')}
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

export default ContainerManagement;