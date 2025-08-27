import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DriverSidebar from './DriverSidebar';
import NoIndexSEO from './NoIndexSEO';

const DriverLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if driver is authenticated
    const isAuth = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    
    if (!isAuth || userRole !== 'driver') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <>
      <NoIndexSEO title="Driver Dashboard" />
      <div className="flex h-full min-w-fit bg-gray-50">
        <DriverSidebar />
        {/* Content Area - Responsive margins */}
        <div className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-w-0 h-full overflow-auto">
          <div className="min-h-full">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default DriverLayout;