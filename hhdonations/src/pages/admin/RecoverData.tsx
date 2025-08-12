import React, { useState, useEffect } from 'react';
import { attemptDataRecovery } from '@/utils/storageManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function RecoverData() {
  const [backupFound, setBackupFound] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [backupData, setBackupData] = useState<any>(null);

  useEffect(() => {
    // Check for emergency backup
    const backup = sessionStorage.getItem('emergency_backup');
    if (backup) {
      try {
        const data = JSON.parse(backup);
        setBackupData(data);
        setBackupFound(true);
      } catch (e) {
        console.error('Failed to parse backup:', e);
      }
    }
  }, []);

  const handleRecover = () => {
    const success = attemptDataRecovery();
    setRecovered(success);
    if (success) {
      setTimeout(() => {
        window.location.href = '/admin/drivers';
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold">Data Recovery</h1>
          </div>
          
          {backupFound ? (
            <div className="space-y-4">
              <p className="text-green-600">Emergency backup found!</p>
              {backupData && (
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm">Backup created: {new Date(backupData.timestamp).toLocaleString()}</p>
                  <p className="text-sm mt-2">Available data:</p>
                  <ul className="text-sm mt-1 ml-4 list-disc">
                    {backupData.driversData && <li>Drivers data</li>}
                    {backupData.binsData && <li>Bins data</li>}
                    {backupData.containersData && <li>Containers data</li>}
                    {backupData.balesData && <li>Bales data</li>}
                    {backupData.pickupRequests && <li>Pickup requests</li>}
                  </ul>
                </div>
              )}
              
              {!recovered ? (
                <Button onClick={handleRecover} className="w-full">
                  Recover Data
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Data recovered successfully! Redirecting...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-red-600">No emergency backup found in session storage.</p>
              <p className="text-sm text-gray-600">
                Unfortunately, the data cannot be recovered. The localStorage was cleared and no backup exists in the current session.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}