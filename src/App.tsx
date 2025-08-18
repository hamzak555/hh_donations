import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// Test all localStorage contexts
import { BinsProvider } from './contexts/BinsContext';
import { PickupRequestsProvider } from './contexts/PickupRequestsContext';
import { BalesProvider } from './contexts/BalesContext';
import { DriversProvider } from './contexts/DriversContext';
import { ContainersProvider } from './contexts/ContainersContext';
import { PartnerApplicationsProvider } from './contexts/PartnerApplicationsContext';
// Test basic layout components
import ResponsiveLayout from './components/ResponsiveLayout';
import AdminLayout from './components/AdminLayout';
import { NetworkStatus } from './components/NetworkStatus';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import ErrorBoundary from './components/ErrorBoundary';

// Simple test component
function TestHome() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>🏠 Step 5: Testing Basic Layout Components</h1>
      <p>If you see this, all localStorage contexts + basic layouts are working</p>
      <div style={{ backgroundColor: '#e8f5e8', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
        ✅ Components loaded successfully:
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>All localStorage contexts</li>
          <li>ResponsiveLayout</li>
          <li>AdminLayout</li>
          <li>NetworkStatus</li>
          <li>ScrollToTop</li>
          <li>ScrollToTopButton</li>
        </ul>
      </div>
    </div>
  );
}

function LayoutTestApp() {
  console.log('🚀 Layout Test App is rendering...');
  
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BinsProvider>
          <PickupRequestsProvider>
            <BalesProvider>
              <ContainersProvider>
                <DriversProvider>
                  <PartnerApplicationsProvider>
                    <Router>
                      <ScrollToTop />
                      <ScrollToTopButton />
                      <NetworkStatus />
                      <Routes>
                        {/* Test ResponsiveLayout */}
                        <Route element={<ResponsiveLayout />}>
                          <Route path="/" element={<TestHome />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Router>
                  </PartnerApplicationsProvider>
                </DriversProvider>
              </ContainersProvider>
            </BalesProvider>
          </PickupRequestsProvider>
        </BinsProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default LayoutTestApp;