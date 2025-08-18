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
import ErrorBoundary from './components/ErrorBoundary';

// Simple test component
function TestHome() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>🏠 Step 4: Testing ALL localStorage Contexts</h1>
      <p>If you see this, all localStorage contexts are working</p>
      <div style={{ backgroundColor: '#e8f5e8', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
        ✅ All localStorage contexts loaded successfully:
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>BinsProvider</li>
          <li>PickupRequestsProvider</li>
          <li>BalesProvider</li>
          <li>DriversProvider</li>
          <li>ContainersProvider</li>
          <li>PartnerApplicationsProvider</li>
        </ul>
      </div>
    </div>
  );
}

function AllContextsTestApp() {
  console.log('🚀 All Contexts Test App is rendering...');
  
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
                      <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
                        <nav style={{ padding: '20px', backgroundColor: '#333', color: 'white' }}>
                          <h2>H&H Donations - All Contexts Test</h2>
                        </nav>
                        <Routes>
                          <Route path="/" element={<TestHome />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </div>
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

export default AllContextsTestApp;