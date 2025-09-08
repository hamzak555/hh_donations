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
      <div className="flex h-full bg-gray-50 relative">
        <AdminSidebar />
        {/* Content Area - Responsive margins with proper isolation */}
        <div className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-w-0 h-full overflow-y-auto relative">
          <div className="min-h-full">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;