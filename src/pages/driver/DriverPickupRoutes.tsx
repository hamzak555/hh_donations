import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation,
  Calendar,
  Phone,
  Mail,
  Package,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { usePickupRequests } from '@/contexts/PickupRequestsContextSupabase';
import { useDrivers } from '@/contexts/DriversContextSupabase';

function DriverPickupRoutes() {
  const { pickupRequests } = usePickupRequests();
  const { drivers } = useDrivers();
  const [assignedPickups, setAssignedPickups] = useState<any[]>([]);
  
  useEffect(() => {
    // Get current driver ID from localStorage
    const driverId = localStorage.getItem('driverId');
    const driverEmail = localStorage.getItem('userEmail');
    if (!driverId) return;
    
    // Find driver
    const currentDriver = drivers.find(d => d.id === driverId);
    if (!currentDriver) return;
    
    // Filter pickup requests assigned to this driver
    const driverPickups = pickupRequests.filter(pickup => 
      pickup.assignedDriver === currentDriver.name && pickup.status !== 'Cancelled'
    );
    
    setAssignedPickups(driverPickups);
  }, [pickupRequests, drivers]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'Picked Up':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Picked Up</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const openGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="px-6 pt-10 pb-6 w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Pickup Routes</h1>
        <p className="text-gray-600">View and manage your assigned pickup requests</p>
      </div>

      {assignedPickups.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pickups Assigned</h3>
          <p className="text-gray-600">You currently have no pickup requests assigned to you.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {assignedPickups.map(pickup => (
            <Card key={pickup.id} className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{pickup.name}</h3>
                  <p className="text-sm text-gray-600">
                    {pickup.organizationType === 'business' ? 'Business' : 'Residential'}
                  </p>
                </div>
                {getStatusBadge(pickup.status)}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span className="text-gray-700">{pickup.address}</span>
                </div>
                
                {pickup.preferredDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      Preferred: {new Date(pickup.preferredDate).toLocaleDateString()}
                      {pickup.preferredTime && ` at ${pickup.preferredTime}`}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{pickup.phone}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{pickup.email}</span>
                </div>
                
                {pickup.items && pickup.items.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="text-gray-700 font-medium">Items:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {pickup.items.map((item: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {pickup.estimatedBags && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      Estimated: {pickup.estimatedBags} bags
                    </span>
                  </div>
                )}
              </div>
              
              {pickup.specialInstructions && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Special Instructions:</strong> {pickup.specialInstructions}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openGoogleMaps(pickup.address)}
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  disabled={pickup.status === 'Picked Up'}
                >
                  <CheckCircle className="w-4 h-4" />
                  {pickup.status === 'Picked Up' ? 'Completed' : 'Complete'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {assignedPickups.length > 0 && (
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Route Summary</h4>
              <p className="text-sm text-blue-800">
                You have {assignedPickups.length} pickup requests in your route. 
                {assignedPickups.filter(p => p.status === 'Pending').length > 0 && 
                  ` ${assignedPickups.filter(p => p.status === 'Pending').length} are pending pickup.`
                }
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default DriverPickupRoutes;