import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BinsProvider } from './contexts/BinsContext';
import { PickupRequestsProvider } from './contexts/PickupRequestsContext';
import { BalesProvider } from './contexts/BalesContext';
import { DriversProvider } from './contexts/DriversContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
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
import PickupRequests from './pages/admin/PickupRequests';
import PickupRouteGenerator from './pages/admin/PickupRouteGenerator';
import FAQ from './pages/FAQ';
import Footer from './components/Footer';

function App() {
  return (
    <BinsProvider>
      <PickupRequestsProvider>
        <BalesProvider>
          <DriversProvider>
            <Router>
          <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Dashboard />} />
            <Route path="/find-bin" element={<FindBin />} />
            <Route path="/request-pickup" element={<RequestPickup />} />
            <Route path="/what-to-donate" element={<div><div className="px-8 pt-10 pb-10"><h1 className="text-3xl font-bold">What to Donate</h1><p className="mt-4">Coming soon...</p></div><Footer /></div>} />
            <Route path="/our-story" element={<div><div className="px-8 pt-10 pb-10"><h1 className="text-3xl font-bold">Our Story</h1><p className="mt-4">Coming soon...</p></div><Footer /></div>} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<Layout />}>
            <Route path="/login" element={<AdminLogin />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin/bins" element={<BinsManagement />} />
            <Route path="/admin/drivers" element={<DriversManagement />} />
            <Route path="/admin/drivers/route-creation" element={<RouteCreation />} />
            <Route path="/admin/pickup-requests" element={<PickupRequests />} />
            <Route path="/admin/pickup-requests/route-generator" element={<PickupRouteGenerator />} />
            <Route path="/admin/bales" element={<BaleManagement />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
          </DriversProvider>
        </BalesProvider>
      </PickupRequestsProvider>
    </BinsProvider>
  );
}

export default App;