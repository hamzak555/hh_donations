import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

// Simple test component
function TestHome() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>🏠 Home Page Works!</h1>
      <p>React Router is functioning correctly</p>
      <a href="/test" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Test Page</a>
    </div>
  );
}

function TestPage() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#e0f0e0', minHeight: '100vh' }}>
      <h1>✅ Test Page Works!</h1>
      <p>Navigation is working</p>
      <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Back to Home</a>
    </div>
  );
}

function DebugApp() {
  console.log('🚀 Debug App is rendering...');
  
  return (
    <ErrorBoundary>
      <Router>
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
          <nav style={{ padding: '20px', backgroundColor: '#333', color: 'white' }}>
            <h2>H&H Donations - Debug Mode</h2>
          </nav>
          <Routes>
            <Route path="/home" element={<TestHome />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default DebugApp;