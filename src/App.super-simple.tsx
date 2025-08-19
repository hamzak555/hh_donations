import React from 'react';

function SuperSimpleApp() {
  console.log('🚀 Super Simple App rendering');
  
  try {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>🔧 Super Simple Test</h1>
        <p>If you see this, basic React is working.</p>
        <p>Supabase URL: {process.env.REACT_APP_SUPABASE_URL || 'NOT SET'}</p>
        <p>Supabase Key: {process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}</p>
      </div>
    );
  } catch (error) {
    console.error('Error in SuperSimpleApp:', error);
    return <div>Error occurred</div>;
  }
}

export default SuperSimpleApp;