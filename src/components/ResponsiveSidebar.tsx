import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  Gift, 
  BookOpen, 
  HelpCircle, 
  Phone,
  Truck,
  Building,
  Menu,
  X
} from 'lucide-react';

const ResponsiveSidebar = () => {
  const location = useLocation();
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

  const allNavItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/find-bin', label: 'Find a Bin', icon: MapPin },
    { path: '/request-pickup', label: 'Request a Pickup', icon: Truck },
    { path: '/what-to-donate', label: 'What to Donate', icon: Gift },
    { path: '/our-story', label: 'Our Story', icon: BookOpen },
    { path: '/partnerships', label: 'Partnerships', icon: Building },
    { path: '/faq', label: 'FAQ', icon: HelpCircle },
    { path: '/contact', label: 'Contact', icon: Phone },
  ];
  
  // Remove 'Request a Pickup' from mobile menu
  const mobileNavItems = allNavItems.filter(item => item.path !== '/request-pickup');
  const desktopNavItems = allNavItems;

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
                to="/find-bin"
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>Find a Bin</span>
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
            <span className="text-lg font-semibold text-gray-900">Menu</span>
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
            <ul className="space-y-1">
              {mobileNavItems.map((item) => {
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
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {desktopNavItems.map((item) => {
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
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

      </div>
    </>
  );
};

export default ResponsiveSidebar;