// Test component to debug Supabase containers
import React, { useEffect, useState } from 'react';
import { SupabaseService } from '@/services/supabaseService';

export const TestSupabaseContainers = () => {
  const [result, setResult] = useState<string>('Testing...');

  useEffect(() => {
    const testContainers = async () => {
      try {
        console.log('Testing containers service...');
        
        // First test: Get all containers
        console.log('1. Testing getAllContainers...');
        const containers = await SupabaseService.containers.getAllContainers();
        console.log('Containers result:', containers);
        
        let resultText = `Get containers: ${containers?.length || 0} found\n`;
        
        // Second test: Try to create a test container
        console.log('2. Testing createContainer...');
        try {
          const newContainer = await SupabaseService.containers.createContainer({
            containerNumber: 'TEST001',
            destination: 'Test Destination',
            status: 'Warehouse',
            currentWeight: 0,
            type: 'Steel',
            capacity: 40000
          } as any);
          console.log('Created container:', newContainer);
          resultText += `Create test: Success (ID: ${newContainer.id})\n`;
        } catch (createError) {
          console.error('Create error:', createError);
          resultText += `Create test: Error - ${createError instanceof Error ? createError.message : 'Unknown'}\n`;
        }
        
        setResult(resultText);
      } catch (error) {
        console.error('Error testing containers:', error);
        setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    testContainers();
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h3>Supabase Containers Test</h3>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
    </div>
  );
};