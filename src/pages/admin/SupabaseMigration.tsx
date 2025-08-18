import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Database, Upload, Download, RefreshCw } from 'lucide-react';
import { DataMigration } from '@/utils/dataMigration';
import { SupabaseService } from '@/services/supabaseService';

interface MigrationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
}

function SupabaseMigration() {
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([
    {
      id: 'connection',
      name: 'Test Supabase Connection',
      description: 'Verify that the app can connect to Supabase database',
      status: 'pending'
    },
    {
      id: 'backup',
      name: 'Create LocalStorage Backup',
      description: 'Backup current localStorage data before migration',
      status: 'pending'
    },
    {
      id: 'bins',
      name: 'Migrate Bins Data',
      description: 'Transfer all bin locations and sensor data to Supabase',
      status: 'pending'
    },
    {
      id: 'drivers',
      name: 'Migrate Drivers Data',
      description: 'Transfer all driver information to Supabase',
      status: 'pending'
    },
    {
      id: 'pickup-requests',
      name: 'Migrate Pickup Requests',
      description: 'Transfer all pickup requests to Supabase',
      status: 'pending'
    },
    {
      id: 'containers',
      name: 'Migrate Containers',
      description: 'Transfer all container data to Supabase',
      status: 'pending'
    },
    {
      id: 'bales',
      name: 'Migrate Bales',
      description: 'Transfer all bale data to Supabase',
      status: 'pending'
    },
    {
      id: 'partner-applications',
      name: 'Migrate Partner Applications',
      description: 'Transfer partnership applications to Supabase',
      status: 'pending'
    },
    {
      id: 'admin-users',
      name: 'Migrate Admin Users',
      description: 'Transfer admin login profiles to Supabase',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [backup, setBackup] = useState<string>('');
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  const updateStepStatus = (stepId: string, status: MigrationStep['status'], error?: string) => {
    setMigrationSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, error } : step
    ));
  };

  const getStatusIcon = (status: MigrationStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: MigrationStep['status']) => {
    const variants = {
      pending: 'default',
      running: 'secondary', 
      completed: 'success',
      error: 'destructive'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const checkLocalStorageData = () => {
    const data = {
      bins: localStorage.getItem('binsData'),
      drivers: localStorage.getItem('driversData'),
      containers: localStorage.getItem('containers'), // Fixed key
      bales: localStorage.getItem('bales'), // Fixed key
      pickupRequests: localStorage.getItem('pickupRequests'), // Fixed key
      partnerApplications: localStorage.getItem('partnerApplications'), // Partner applications
      adminAuth: localStorage.getItem('adminAuth') // Check if admin is logged in
    };

    const parsed = {
      bins: data.bins ? JSON.parse(data.bins).length : 0,
      drivers: data.drivers ? JSON.parse(data.drivers).length : 0,
      containers: data.containers ? JSON.parse(data.containers).length : 0,
      bales: data.bales ? JSON.parse(data.bales).length : 0,
      pickupRequests: data.pickupRequests ? JSON.parse(data.pickupRequests).length : 0,
      partnerApplications: data.partnerApplications ? JSON.parse(data.partnerApplications).length : 0,
      adminUsers: data.adminAuth ? 1 : 0 // Current system has 1 hardcoded admin
    };

    setLocalStorageData(parsed);
    return parsed;
  };

  const debugLocalStorage = () => {
    DataMigration.debugLocalStorageData();
  };

  const runMigration = async () => {
    setIsRunning(true);
    
    try {
      // Debug localStorage before starting
      console.log('=== STARTING MIGRATION DEBUG ===');
      DataMigration.debugLocalStorageData();
      
      // Step 1: Test connection
      updateStepStatus('connection', 'running');
      const connectionSuccess = await DataMigration.testSupabaseConnection();
      if (!connectionSuccess) {
        updateStepStatus('connection', 'error', 'Failed to connect to Supabase');
        return;
      }
      updateStepStatus('connection', 'completed');

      // Step 2: Create backup
      updateStepStatus('backup', 'running');
      const backupData = DataMigration.createLocalStorageBackup();
      setBackup(backupData);
      updateStepStatus('backup', 'completed');

      // Step 3: Migrate bins
      updateStepStatus('bins', 'running');
      await DataMigration.migrateBinsToSupabase();
      updateStepStatus('bins', 'completed');

      // Step 4: Migrate drivers
      updateStepStatus('drivers', 'running');
      await DataMigration.migrateDriversToSupabase();
      updateStepStatus('drivers', 'completed');

      // Step 5: Migrate pickup requests
      updateStepStatus('pickup-requests', 'running');
      await DataMigration.migratePickupRequestsToSupabase();
      updateStepStatus('pickup-requests', 'completed');

      // Step 6: Migrate containers
      updateStepStatus('containers', 'running');
      await DataMigration.migrateContainersToSupabase();
      updateStepStatus('containers', 'completed');

      // Step 7: Migrate bales
      updateStepStatus('bales', 'running');
      await DataMigration.migrateBalsToSupabase();
      updateStepStatus('bales', 'completed');

      // Step 8: Migrate partner applications
      updateStepStatus('partner-applications', 'running');
      await DataMigration.migratePartnerApplicationsToSupabase();
      updateStepStatus('partner-applications', 'completed');

      // Step 9: Migrate admin users
      updateStepStatus('admin-users', 'running');
      await DataMigration.migrateAdminUsersToSupabase();
      updateStepStatus('admin-users', 'completed');

      console.log('🎉 Migration completed successfully!');

    } catch (error) {
      console.error('Migration failed:', error);
      // Update the current running step to error
      const runningStep = migrationSteps.find(step => step.status === 'running');
      if (runningStep) {
        updateStepStatus(runningStep.id, 'error', error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const downloadBackup = () => {
    if (!backup) return;
    
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hhdonations-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    checkLocalStorageData();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Supabase Migration</h1>
        <p className="text-gray-600">
          Migrate your existing localStorage data to Supabase database for persistent, cloud-based storage.
        </p>
      </div>

      {/* Current Data Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Current localStorage Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {localStorageData && (
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{localStorageData.bins}</div>
                <div className="text-sm text-gray-600">Bins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{localStorageData.drivers}</div>
                <div className="text-sm text-gray-600">Drivers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{localStorageData.containers}</div>
                <div className="text-sm text-gray-600">Containers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{localStorageData.bales}</div>
                <div className="text-sm text-gray-600">Bales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{localStorageData.pickupRequests}</div>
                <div className="text-sm text-gray-600">Pickup Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{localStorageData.partnerApplications}</div>
                <div className="text-sm text-gray-600">Partner Apps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{localStorageData.adminUsers}</div>
                <div className="text-sm text-gray-600">Admin Users</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Migration Steps */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Migration Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {migrationSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{index + 1}. {step.name}</span>
                    {getStatusBadge(step.status)}
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {step.error && (
                    <p className="text-sm text-red-600 mt-1">Error: {step.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={runMigration} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isRunning ? 'Migrating...' : 'Start Migration'}
        </Button>

        {backup && (
          <Button 
            variant="outline" 
            onClick={downloadBackup}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Backup
          </Button>
        )}

        <Button 
          variant="outline" 
          onClick={checkLocalStorageData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </Button>

        <Button 
          variant="outline" 
          onClick={debugLocalStorage}
          className="flex items-center gap-2"
        >
          <Database className="w-4 h-4" />
          Debug Console
        </Button>
      </div>

      {/* Important Notes */}
      <Alert className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Before running the migration, ensure you have:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Created the database tables in Supabase using the provided SQL schema</li>
            <li>Verified your Supabase credentials are correct in the .env file</li>
            <li>Downloaded a backup of your current data (recommended)</li>
          </ul>
        </AlertDescription>
      </Alert>

      {migrationSteps.every(step => step.status === 'completed') && (
        <Alert className="mt-4 border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Migration Successful!</strong> All your data has been transferred to Supabase. 
            You can now switch to using the Supabase-powered version of your application.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default SupabaseMigration;