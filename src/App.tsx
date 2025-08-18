import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';

// Simple test component
function TestHome() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>🏠 Step 2: Router + HelmetProvider Working!</h1>
      <p>If you see this, React Router and HelmetProvider are working</p>
      <p style={{ backgroundColor: '#e8f5e8', padding: '10px', borderRadius: '5px' }}>
        ✅ React Router + HelmetProvider test successful
      </p>
    </div>
  );
}

function RouterTestApp() {
  console.log('🚀 Router Test App is rendering...');
  
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <nav style={{ padding: '20px', backgroundColor: '#333', color: 'white' }}>
              <h2>H&H Donations - Router Test Mode</h2>
            </nav>
            <Routes>
              <Route path="/" element={<TestHome />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default RouterTestApp;