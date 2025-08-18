import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BinsProvider } from './contexts/BinsContextSupabase';
import { PickupRequestsProvider } from './contexts/PickupRequestsContextSupabase';
import { BalesProvider } from './contexts/BalesContextSupabase';
import { DriversProvider } from './contexts/DriversContextSupabase';
import { ContainersProvider } from './contexts/ContainersContextSupabase';
import { PartnerApplicationsProvider } from './contexts/PartnerApplicationsContext';
import Layout from './components/Layout';
import ResponsiveLayout from './components/ResponsiveLayout';
import AdminLayout from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import FindBin from './pages/FindBin';
import RequestPickup from './pages/RequestPickup';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AdminLogin from './pages/admin/AdminLogin';
import BinsManagement from './pages/admin/BinsManagement';
import DriversManagement from './pages/admin/DriversManagement';
import RouteCreation from './pages/admin/RouteCreation';
import BaleManagement from './pages/admin/BaleManagement';
import ContainerManagement from './pages/admin/ContainerManagement';
import PickupRequests from './pages/admin/PickupRequests';
import PickupRouteGenerator from './pages/admin/PickupRouteGenerator';
import RecoverData from './pages/admin/RecoverData';
import DiagnosticPage from './pages/admin/DiagnosticPage';
import SensorTest from './pages/admin/SensorTest';
import SupabaseMigration from './pages/admin/SupabaseMigration';
import UserManagement from './pages/admin/UserManagement';
import FAQ from './pages/FAQ';
import WhatToDonate from './pages/WhatToDonate';
import OurStory from './pages/OurStory';
import Partnerships from './pages/Partnerships';
import PartnerApplication from './pages/PartnerApplication';
import PartnerApplications from './pages/admin/PartnerApplications';
import Footer from './components/Footer';
import { NetworkStatus } from './components/NetworkStatus';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import './utils/seedData';
import './utils/dataExportImport';

function App() {
  console.log('App component rendering...');
  console.log('Environment check:', {
    SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
  });
  
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
                        {/* Public Routes */}
                        <Route element={<ResponsiveLayout />}>
                          <Route path="/home" element={<Dashboard />} />
                          <Route path="/find-bin" element={<FindBin />} />
                          <Route path="/request-pickup" element={<RequestPickup />} />
                          <Route path="/what-to-donate" element={<WhatToDonate />} />
                          <Route path="/our-story" element={<OurStory />} />
                          <Route path="/partnerships" element={<Partnerships />} />
                          <Route path="/faq" element={<FAQ />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/terms-of-service" element={<TermsOfService />} />
                          <Route path="/partner-application" element={<PartnerApplication />} />
                        </Route>
                        
                        {/* Admin Routes */}
                        <Route element={<ResponsiveLayout />}>
                          <Route path="/login" element={<AdminLogin />} />
                        </Route>
                        <Route element={<AdminLayout />}>
                          <Route path="/admin/bins" element={<BinsManagement />} />
                          <Route path="/admin/drivers" element={<DriversManagement />} />
                          <Route path="/admin/drivers/route-creation" element={<RouteCreation />} />
                          <Route path="/admin/pickup-requests" element={<PickupRequests />} />
                          <Route path="/admin/pickup-requests/route-generator" element={<PickupRouteGenerator />} />
                          <Route path="/admin/bales" element={<BaleManagement />} />
                          <Route path="/admin/containers" element={<ContainerManagement />} />
                          <Route path="/admin/partner-applications" element={<PartnerApplications />} />
                          <Route path="/admin/recover" element={<RecoverData />} />
                          <Route path="/admin/diagnostic" element={<DiagnosticPage />} />
                          <Route path="/admin/sensor-test" element={<SensorTest />} />
                          <Route path="/admin/supabase-migration" element={<SupabaseMigration />} />
                          <Route path="/admin/users" element={<UserManagement />} />
                        </Route>
                        
                        <Route path="/" element={<Navigate to="/home" replace />} />
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

export default App;