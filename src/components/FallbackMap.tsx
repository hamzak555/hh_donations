import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FallbackMapProps {
  bins?: any[];
  onBinClick?: (bin: any) => void;
}

export const FallbackMap: React.FC<FallbackMapProps> = ({ bins = [], onBinClick }) => {
  return (
    <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg">Interactive Map Unavailable</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              The interactive map is temporarily unavailable. You can still browse bins using the list on the right.
            </AlertDescription>
          </Alert>
          
          {bins.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Available Bins ({bins.length}):</p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {bins.map((bin) => (
                  <Button
                    key={bin.id}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => onBinClick?.(bin)}
                  >
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{bin.locationName}</div>
                      <div className="text-xs text-gray-500">{bin.address}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-center">
            <Button
              onClick={() => window.location.reload()}
              variant="default"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};