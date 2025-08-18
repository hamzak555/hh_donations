import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BinsProvider } from './contexts/BinsContext';
import ErrorBoundary from './components/ErrorBoundary';

// Simple test component
function TestHome() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>🏠 Step 3: Testing with one localStorage Context</h1>
      <p>If you see this, BinsContext (localStorage) is working with Router</p>
      <p style={{ backgroundColor: '#e8f5e8', padding: '10px', borderRadius: '5px' }}>
        ✅ React Router + HelmetProvider + BinsContext test
      </p>
    </div>
  );
}

function ContextTestApp() {
  console.log('🚀 Context Test App is rendering...');
  
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BinsProvider>
          <Router>
            <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
              <nav style={{ padding: '20px', backgroundColor: '#333', color: 'white' }}>
                <h2>H&H Donations - Context Test Mode</h2>
              </nav>
              <Routes>
                <Route path="/" element={<TestHome />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </BinsProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default ContextTestApp;