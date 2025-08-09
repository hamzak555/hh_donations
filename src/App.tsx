import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BinsProvider } from './contexts/BinsContext';
import { PickupRequestsProvider } from './contexts/PickupRequestsContext';
import { PickupsProvider } from './contexts/PickupsContext';
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
import PickupManagement from './pages/admin/PickupManagement';
import PickupRequests from './pages/admin/PickupRequests';
import FAQ from './pages/FAQ';
import Footer from './components/Footer';

function App() {
  return (
    <BinsProvider>
      <PickupRequestsProvider>
        <PickupsProvider>
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
            <Route path="/admin/pickups" element={<PickupManagement />} />
            <Route path="/admin/pickup-requests" element={<PickupRequests />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
        </PickupsProvider>
      </PickupRequestsProvider>
    </BinsProvider>
  );
}

export default App;