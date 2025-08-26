import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import NoIndexSEO from './NoIndexSEO';

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is authenticated
    const isAuth = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    if (!isAuth || userRole !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <>
      <NoIndexSEO title="Admin Dashboard" />
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        {/* Content Area - Responsive margins */}
        <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminLayout;