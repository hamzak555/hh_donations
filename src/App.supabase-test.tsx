import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

function SupabaseTestApp() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [tables, setTables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      console.log('🔍 Testing Supabase connection...');
      console.log('🔗 Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
      console.log('🔑 Supabase Key (first 20 chars):', process.env.REACT_APP_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
      
      // Test 1: Basic connection with simple query
      console.log('📝 Test 1: Testing basic connection...');
      const { data, error } = await supabase
        .from('bins')
        .select('*')
        .limit(1);

      if (error) {
        console.error('❌ Supabase connection error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setError(`${error.message} (Code: ${error.code})`);
        setConnectionStatus('Failed');
        
        // Test 2: Try to list tables if bins table doesn't exist
        console.log('📋 Test 2: Checking if tables exist...');
        const { data: tables, error: tablesError } = await supabase
          .rpc('get_table_names');
        
        if (tablesError) {
          console.log('📋 Could not get table list:', tablesError.message);
        } else {
          console.log('📋 Available tables:', tables);
        }
        
      } else {
        console.log('✅ Supabase connection successful!');
        console.log('📊 Sample bins data:', data);
        setConnectionStatus('Connected');
      }
    } catch (err) {
      console.error('💥 Connection test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setConnectionStatus('Failed');
    }
  };

  const testAddBin = async () => {
    try {
      const testBin = {
        bin_number: `TEST-${Date.now()}`,
        location_name: 'Test Location',
        address: '123 Test Street',
        lat: 43.6532,
        lng: -79.3832,
        status: 'Available',
        pickup_status: 'Not Scheduled',
        created_date: new Date().toISOString().split('T')[0]
      };

      console.log('🧪 Testing bin creation with data:', testBin);

      const { data, error } = await supabase
        .from('bins')
        .insert([testBin])
        .select();

      if (error) {
        console.error('❌ Error creating test bin:', error);
        setError(`Insert error: ${error.message}`);
      } else {
        console.log('✅ Test bin created successfully:', data);
        alert('✅ Test bin created successfully! Check your Supabase dashboard.');
      }
    } catch (err) {
      console.error('💥 Test bin creation failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontSize: '16px', 
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🔗 Supabase Connection Test
      </h1>
      
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Connection Status:</h3>
        <p style={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          color: connectionStatus === 'Connected' ? 'green' : connectionStatus === 'Failed' ? 'red' : 'orange'
        }}>
          {connectionStatus}
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #f00' }}>
          <h3 style={{ color: '#c00' }}>Error Details:</h3>
          <p style={{ color: '#800' }}>{error}</p>
        </div>
      )}

      <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Environment Variables:</h3>
        <ul>
          <li>SUPABASE_URL: {process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</li>
          <li>SUPABASE_ANON_KEY: {process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</li>
        </ul>
      </div>

      <button 
        onClick={testAddBin}
        disabled={connectionStatus !== 'Connected'}
        style={{ 
          padding: '15px 30px', 
          fontSize: '16px', 
          backgroundColor: connectionStatus === 'Connected' ? '#007cba' : '#ccc', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: connectionStatus === 'Connected' ? 'pointer' : 'not-allowed',
          marginRight: '10px'
        }}
      >
        🧪 Test Create Bin
      </button>

      <button 
        onClick={testSupabaseConnection}
        style={{ 
          padding: '15px 30px', 
          fontSize: '16px', 
          backgroundColor: '#28a745', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer'
        }}
      >
        🔄 Retry Connection
      </button>
    </div>
  );
}

export default SupabaseTestApp;