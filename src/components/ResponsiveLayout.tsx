import React from 'react';
import { Outlet } from 'react-router-dom';
import ResponsiveSidebar from './ResponsiveSidebar';

const ResponsiveLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ResponsiveSidebar />
      {/* Content Area - Responsive margins */}
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default ResponsiveLayout;