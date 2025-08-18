import React from 'react';

function MinimalApp() {
  console.log('Minimal App is rendering!');
  
  return (
    <div style={{ 
      padding: '40px', 
      fontSize: '24px', 
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🚀 H&H Donations - Test Page
      </h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        If you can see this, React is working correctly!
      </p>
      <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        ✅ App is loading successfully
      </div>
      <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '5px', border: '1px solid #ddd' }}>
        <h3>Environment Check:</h3>
        <ul>
          <li>SUPABASE_URL: {process.env.REACT_APP_SUPABASE_URL || 'Not set'}</li>
          <li>SUPABASE_ANON_KEY: {process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</li>
          <li>NODE_ENV: {process.env.NODE_ENV}</li>
        </ul>
      </div>
      <button 
        onClick={() => alert('Button works!')} 
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          fontSize: '16px', 
          backgroundColor: '#007cba', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer' 
        }}
      >
        Test Button
      </button>
    </div>
  );
}

export default MinimalApp;