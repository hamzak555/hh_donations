import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Package,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useBins } from '@/contexts/BinsContextSupabase';
import { useDrivers } from '@/contexts/DriversContextSupabase';

function DriverBinRoutes() {
  const { bins } = useBins();
  const { drivers } = useDrivers();
  const [assignedBins, setAssignedBins] = useState<any[]>([]);
  
  useEffect(() => {
    // Get current driver ID from localStorage
    const driverId = localStorage.getItem('driverId');
    if (!driverId) return;
    
    // Find driver and their assigned bins
    const currentDriver = drivers.find(d => d.id === driverId);
    if (!currentDriver) return;
    
    // Get bins assigned to this driver
    const driverBins = bins.filter(bin => 
      currentDriver.assignedBins.includes(bin.binNumber)
    );
    
    setAssignedBins(driverBins);
  }, [bins, drivers]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Almost Full': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Full': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const openGoogleMaps = (location: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="px-6 pt-10 pb-6 w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Bin Routes</h1>
        <p className="text-gray-600">View and manage your assigned bin collection routes</p>
      </div>

      {assignedBins.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bins Assigned</h3>
          <p className="text-gray-600">You currently have no bins assigned to you. Please contact your administrator.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedBins.map(bin => (
            <Card key={bin.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{bin.binNumber}</h3>
                  <p className="text-sm text-gray-600">{bin.locationName}</p>
                </div>
                <Badge className={getStatusColor(bin.status)}>
                  {bin.status}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{bin.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  <span>Fill Level: {bin.fillLevel || 0}%</span>
                </div>
                {bin.lastPickup && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Last Pickup: {new Date(bin.lastPickup).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openGoogleMaps(bin.location)}
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {assignedBins.length > 0 && (
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Route Summary</h4>
              <p className="text-sm text-blue-800">
                You have {assignedBins.length} bins assigned to your route. 
                {assignedBins.filter(b => b.status === 'Full').length > 0 && 
                  ` ${assignedBins.filter(b => b.status === 'Full').length} bins need immediate attention.`
                }
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default DriverBinRoutes;