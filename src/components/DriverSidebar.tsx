import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Package, 
  LogOut,
  Route,
  Navigation,
  Key,
  Menu,
  X
} from 'lucide-react';
import { PasswordChangeDialog } from './PasswordChangeDialog';

const DriverSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') || '';
  const driverId = localStorage.getItem('driverId') || '';
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('driverId');
    navigate('/login');
  };

  const menuItems = [
    { 
      icon: Route, 
      label: 'Bin Routes', 
      path: '/driver/bin-routes' 
    },
    { 
      icon: Navigation, 
      label: 'Pickup Routes', 
      path: '/driver/pickup-routes' 
    }
  ];

  return (
    <>
      {/* Mobile Header - Only visible on mobile/tablet */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-6 sm:px-8">
          <div className="flex items-center justify-between py-3 gap-4">
            <Link to="/home" className="flex items-center">
              <img 
                src="/images/HH Logo Black.png" 
                alt="H&H Donations Logo" 
                className="w-12 h-12 object-contain"
              />
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/driver/bin-routes"
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Route className="w-4 h-4" />
                <span>Bin Routes</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div className={`
        lg:hidden fixed top-0 right-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-lg font-semibold text-gray-900">Driver Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <div className="text-xs text-gray-500 px-4 mb-2">
              Logged in as: {userEmail}
            </div>
            
            <button
              onClick={() => setShowPasswordChange(true)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 w-full"
            >
              <Key className="w-5 h-5" />
              <span>Change Password</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Only visible on desktop */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-200 h-screen flex-col fixed left-0 top-0">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/home" className="flex items-center">
            <img 
              src="/images/HH Logo Black.png" 
              alt="H&H Donations Logo" 
              className="w-24 h-24 object-contain ml-4 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`relative flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-sm ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop Footer Buttons */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="text-xs text-gray-500 px-4 mb-2">
            Logged in as: {userEmail}
          </div>
          
          <button
            onClick={() => setShowPasswordChange(true)}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 w-full"
          >
            <Key className="w-5 h-5" />
            <span>Change Password</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Password Change Dialog */}
      <PasswordChangeDialog
        isOpen={showPasswordChange}
        onClose={() => setShowPasswordChange(false)}
        driverId={driverId}
        isFirstTime={false}
      />
    </>
  );
};

export default DriverSidebar;