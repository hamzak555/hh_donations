import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '@/utils/networkHandler';
import { WifiOff, Wifi, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function NetworkStatus() {
  const isOnline = useNetworkStatus();
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showReconnectedAlert, setShowReconnectedAlert] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineAlert(true);
      setWasOffline(true);
      setShowReconnectedAlert(false);
    } else if (wasOffline) {
      setShowOfflineAlert(false);
      setShowReconnectedAlert(true);
      setWasOffline(false);
      
      // Hide reconnection message after 5 seconds
      const timer = setTimeout(() => {
        setShowReconnectedAlert(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (showOfflineAlert) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <Alert className="w-80 border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>You're offline</strong>
            <br />
            Your changes are being saved locally and will sync when connection is restored.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showReconnectedAlert) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <Alert className="w-80 border-green-200 bg-green-50">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Connection restored</strong>
            <br />
            Your data has been synced successfully.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}

// Optional: Inline network indicator for header/navbar
export function NetworkIndicator() {
  const isOnline = useNetworkStatus();
  
  if (isOnline) {
    return null; // Don't show anything when online
  }
  
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-md text-sm">
      <WifiOff className="h-3 w-3" />
      <span>Offline</span>
    </div>
  );
}