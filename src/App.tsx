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
// Test simple bins page that uses localStorage contexts
import { useBins } from './contexts/BinsContext';
import ErrorBoundary from './components/ErrorBoundary';

// Simple test component
function TestHome() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>🏠 Step 6: Testing with Real Admin Page</h1>
      <p>If you see this, basic components work. Check the admin link to test BinsManagement.</p>
      <div style={{ backgroundColor: '#e8f5e8', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
        ✅ Testing with simple bins page using localStorage contexts
      </div>
      <p><strong>Next test:</strong> Try clicking "Bins" in the sidebar to test the simple bins page.</p>
    </div>
  );
}

// Simple bins test page using localStorage contexts
function SimpleBinsPage() {
  const { bins } = useBins();
  
  return (
    <div style={{ padding: '40px' }}>
      <h1>🗂️ Simple Bins Test Page</h1>
      <p>If you see this, the bins context is working with localStorage!</p>
      <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
        <strong>✅ Found {bins.length} bins in localStorage</strong>
      </div>
      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
        <h3>Bins:</h3>
        {bins.length === 0 ? (
          <p>No bins found</p>
        ) : (
          <ul>
            {bins.slice(0, 5).map(bin => (
              <li key={bin.id}>{bin.binNumber} - {bin.locationName} ({bin.status})</li>
            ))}
            {bins.length > 5 && <li>... and {bins.length - 5} more</li>}
          </ul>
        )}
      </div>
    </div>
  );
}

function PageTestApp() {
  console.log('🚀 Page Test App is rendering...');
  
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
                        {/* Test ResponsiveLayout for public */}
                        <Route element={<ResponsiveLayout />}>
                          <Route path="/" element={<TestHome />} />
                        </Route>
                        
                        {/* Test AdminLayout with simple bins page */}
                        <Route element={<AdminLayout />}>
                          <Route path="/admin/bins" element={<SimpleBinsPage />} />
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

export default PageTestApp;