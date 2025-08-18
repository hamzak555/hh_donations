import React from 'react';

// Simple test component to check if React is working
function TestApp() {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>Test App</h1>
      <p>If you can see this, React is working\!</p>
      <p>Environment variables:</p>
      <ul>
        <li>SUPABASE_URL: {process.env.REACT_APP_SUPABASE_URL || 'Not set'}</li>
        <li>SUPABASE_ANON_KEY: {process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</li>
      </ul>
    </div>
  );
}

export default TestApp;
