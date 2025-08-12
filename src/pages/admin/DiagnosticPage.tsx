import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Download, Upload } from 'lucide-react';

export default function DiagnosticPage() {
  const [storageData, setStorageData] = useState<Record<string, any>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadStorageData = () => {
    // Correct storage keys used by each context
    const keys = [
      'driversData',     // DriversContext
      'binsData',        // BinsContext  
      'containers',      // ContainersContext (not containersData!)
      'bales',           // BalesContext (not balesData!)
      'pickupRequests',  // PickupRequestsContext
      'adminAuth',       // Admin authentication
      'defaultPickupDriver' // Default driver setting
    ];
    const data: Record<string, any> = {};
    
    keys.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          data[key] = {
            raw: stored,
            parsed: parsed,
            count: Array.isArray(parsed) ? parsed.length : 'N/A',
            size: new Blob([stored]).size
          };
        } else {
          data[key] = { raw: null, parsed: null, count: 0, size: 0 };
        }
      } catch (e) {
        data[key] = { error: e instanceof Error ? e.message : 'Unknown error' };
      }
    });
    
    setStorageData(data);
    setLastRefresh(new Date());
  };

  useEffect(() => {
    loadStorageData();
    
    // Auto-refresh every 2 seconds
    const interval = setInterval(loadStorageData, 2000);
    return () => clearInterval(interval);
  }, []);

  const exportData = () => {
    const dataStr = JSON.stringify(storageData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `localStorage_backup_${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          if (value.raw) {
            localStorage.setItem(key, value.raw);
          }
        });
        
        loadStorageData();
        alert('Data imported successfully! Refresh the page to see changes.');
      } catch (error) {
        alert('Error importing data: ' + error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold">Storage Diagnostic Tool</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadStorageData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <label htmlFor="import-file" className="inline-block">
              <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </div>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Last refresh: {lastRefresh.toLocaleTimeString()} (Auto-refreshes every 2 seconds)
        </p>
        
        <div className="space-y-4">
          {Object.entries(storageData).map(([key, data]) => (
            <div key={key} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{key}</h3>
                <div className="text-sm text-gray-600">
                  {data.error ? (
                    <span className="text-red-600">Error: {data.error}</span>
                  ) : (
                    <>
                      <span className="mr-4">Count: {data.count}</span>
                      <span>Size: {(data.size / 1024).toFixed(2)} KB</span>
                    </>
                  )}
                </div>
              </div>
              
              {data.parsed && (
                <div className="mt-2">
                  <details className="cursor-pointer">
                    <summary className="text-sm text-gray-600 hover:text-gray-800">
                      View data (click to expand)
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-60">
                      {JSON.stringify(data.parsed, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
              
              {data.raw === null && (
                <p className="text-sm text-gray-500 italic">No data stored</p>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Tips:</h3>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>If data shows as "No data stored", it means localStorage is empty for that key</li>
            <li>Use Export to backup your data before making changes</li>
            <li>Use Import to restore data from a previous export</li>
            <li>Data auto-refreshes every 2 seconds to show real-time changes</li>
            <li>If data keeps disappearing, check browser extensions that might clear localStorage</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}