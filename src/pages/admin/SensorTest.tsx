import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Wifi, WifiOff, Battery, Thermometer, Package, AlertCircle, CheckCircle } from 'lucide-react';
import SensoneoAPI, { MeasurementResponse } from '@/services/sensoneoApi';

function SensorTest() {
  // Use demo API key from environment or localStorage
  const demoApiKey = process.env.REACT_APP_SENSONEO_API_KEY || '0c5d7f2757f740489dca16d6c5745a11';
  const savedApiKey = localStorage.getItem('sensoneo_api_key') || demoApiKey;
  
  const [apiKey, setApiKey] = useState(savedApiKey);
  const [containerId, setContainerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [measurementData, setMeasurementData] = useState<MeasurementResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [testLog, setTestLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setTestLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    if (!apiKey) {
      setError('Please enter an API key');
      return;
    }

    setIsLoading(true);
    setConnectionStatus('testing');
    setError('');
    setTestLog([]);
    setMeasurementData(null);

    try {
      addLog('Initializing Sensoneo API client...');
      const api = new SensoneoAPI({ apiKey });

      addLog('Testing API connection...');
      addLog('Note: Check browser console (F12) for detailed logs');
      
      const isConnected = await api.testConnection();

      if (isConnected) {
        addLog('✓ Connection successful!');
        setConnectionStatus('success');
        
        // Store API key in localStorage for future use
        localStorage.setItem('sensoneo_api_key', apiKey);
        addLog('API key saved to local storage');
        addLog('You can now fetch sensor data using a Container ID');
      } else {
        throw new Error('Connection test failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addLog(`✗ Connection failed: ${errorMessage}`);
      
      if (errorMessage.includes('CORS')) {
        addLog('⚠️ CORS Issue Detected');
        addLog('The Sensoneo API cannot be called directly from the browser.');
        addLog('Solution: A backend proxy server is needed to make API calls.');
        setError('CORS Error: API calls must be made from a backend server, not directly from the browser.');
      } else {
        setConnectionStatus('error');
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSensorData = async () => {
    if (!apiKey || !containerId) {
      setError('Please enter both API key and Container ID');
      return;
    }

    setIsLoading(true);
    setError('');
    setMeasurementData(null);

    try {
      addLog(`Fetching data for container ID: ${containerId}`);
      const api = new SensoneoAPI({ apiKey });
      
      const measurement = await api.fetchContainerMeasurement(parseInt(containerId));
      
      if (measurement) {
        addLog('✓ Sensor data retrieved successfully');
        setMeasurementData(measurement);
        
        // Log key metrics
        addLog(`Fill Level: ${measurement.percentCalculated}%`);
        addLog(`Last Update: ${new Date(measurement.measuredAt).toLocaleString()}`);
        if (measurement.batteryStatus) {
          addLog(`Battery: ${SensoneoAPI.formatBatteryStatus(measurement.batteryStatus)}`);
        }
      } else {
        addLog('No measurement data found for this container');
        setError('No data available for this container ID');
      }
    } catch (err) {
      addLog(`✗ Failed to fetch sensor data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setError(err instanceof Error ? err.message : 'Failed to fetch sensor data');
    } finally {
      setIsLoading(false);
    }
  };

  const getBatteryIcon = (voltage?: number) => {
    if (!voltage) return <Battery className="h-4 w-4" />;
    
    const status = SensoneoAPI.formatBatteryStatus(voltage);
    const color = status === 'Good' ? 'text-green-600' : 
                  status === 'Fair' ? 'text-yellow-600' : 
                  status === 'Low' ? 'text-orange-600' : 'text-red-600';
    
    return <Battery className={`h-4 w-4 ${color}`} />;
  };

  const getFillLevelColor = (level: number) => {
    if (level >= 90) return 'bg-red-100 text-red-800';
    if (level >= 70) return 'bg-orange-100 text-orange-800';
    if (level >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sensoneo Sensor API Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            API Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Sensoneo API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Using Sensoneo demo API key. Replace with your own key for production use.
              </p>
            </div>

            <div>
              <Label htmlFor="containerId">Container ID (Optional)</Label>
              <Input
                id="containerId"
                type="number"
                placeholder="Enter container ID to fetch specific data"
                value={containerId}
                onChange={(e) => setContainerId(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter a specific container ID to fetch its sensor data
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={testConnection}
                disabled={isLoading || !apiKey}
                className="flex-1"
              >
                {isLoading && connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </Button>
              
              <Button 
                onClick={fetchSensorData}
                disabled={isLoading || !apiKey || !containerId}
                variant="outline"
                className="flex-1"
              >
                {isLoading && !connectionStatus ? 'Fetching...' : 'Fetch Sensor Data'}
              </Button>
            </div>

            {/* Connection Status */}
            {connectionStatus !== 'idle' && (
              <div className="mt-4">
                {connectionStatus === 'success' && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-800">Connection successful!</span>
                  </Alert>
                )}
                {connectionStatus === 'error' && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-800">{error || 'Connection failed'}</span>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Sensor Data Display */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sensor Data
          </h2>
          
          {measurementData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Container ID</p>
                  <p className="font-semibold">{measurementData.containerId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Fill Level</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getFillLevelColor(measurementData.percentCalculated)}>
                      {measurementData.percentCalculated}%
                    </Badge>
                    <span className="text-sm">
                      ({SensoneoAPI.getBinStatusFromFillLevel(measurementData.percentCalculated)})
                    </span>
                  </div>
                </div>

                {measurementData.temperature !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      Temperature
                    </p>
                    <p className="font-semibold">{measurementData.temperature.toFixed(1)}°C</p>
                  </div>
                )}

                {measurementData.batteryStatus !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      {getBatteryIcon(measurementData.batteryStatus)}
                      Battery
                    </p>
                    <p className="font-semibold">
                      {measurementData.batteryStatus.toFixed(2)}V 
                      <span className="text-sm ml-1">
                        ({SensoneoAPI.formatBatteryStatus(measurementData.batteryStatus)})
                      </span>
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Measured At</p>
                  <p className="font-semibold text-sm">
                    {new Date(measurementData.measuredAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Server Received</p>
                  <p className="font-semibold text-sm">
                    {new Date(measurementData.serverAt).toLocaleString()}
                  </p>
                </div>

                {measurementData.upturned !== undefined && (
                  <div className="col-span-2">
                    <Badge variant={measurementData.upturned ? "destructive" : "secondary"}>
                      {measurementData.upturned ? 'Container Upturned!' : 'Container Upright'}
                    </Badge>
                  </div>
                )}

                {measurementData.prediction && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Predicted Full</p>
                    <p className="font-semibold">
                      {new Date(measurementData.prediction).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Visual Fill Level Indicator */}
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Fill Level Visualization</p>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      measurementData.percentCalculated >= 90 ? 'bg-red-500' :
                      measurementData.percentCalculated >= 70 ? 'bg-orange-500' :
                      measurementData.percentCalculated >= 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${measurementData.percentCalculated}%` }}
                  >
                    <span className="text-white text-sm font-semibold flex items-center justify-center h-full">
                      {measurementData.percentCalculated}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {connectionStatus === 'idle' ? (
                <>
                  <WifiOff className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No sensor data available</p>
                  <p className="text-sm mt-1">Test connection and fetch data to view sensor information</p>
                </>
              ) : connectionStatus === 'testing' ? (
                <>
                  <div className="animate-pulse">
                    <Wifi className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                  </div>
                  <p>Testing connection...</p>
                </>
              ) : (
                <>
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Enter a Container ID and fetch data</p>
                </>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Test Log */}
      {testLog.length > 0 && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Test Log</h2>
          <div className="bg-gray-50 rounded p-4 font-mono text-sm space-y-1 max-h-48 overflow-y-auto">
            {testLog.map((log, index) => (
              <div key={index} className={log.includes('✓') ? 'text-green-600' : log.includes('✗') ? 'text-red-600' : ''}>
                {log}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default SensorTest;