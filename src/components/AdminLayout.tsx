import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import NoIndexSEO from './NoIndexSEO';

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is authenticated
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <>
      <NoIndexSEO title="Admin Dashboard" />
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 ml-64 overflow-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminLayout;