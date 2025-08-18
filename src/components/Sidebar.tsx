import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  Gift, 
  BookOpen, 
  HelpCircle, 
  Phone,
  Shield,
  LayoutDashboard,
  Truck,
  Building
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is authenticated by looking for adminAuth in localStorage
    const authToken = localStorage.getItem('adminAuth');
    setIsLoggedIn(!!authToken);
  }, [location.pathname]);

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/find-bin', label: 'Find a Bin', icon: MapPin },
    { path: '/request-pickup', label: 'Request a Pickup', icon: Truck },
    { path: '/what-to-donate', label: 'What to Donate', icon: Gift },
    { path: '/our-story', label: 'Our Story', icon: BookOpen },
    { path: '/partnerships', label: 'Partnerships', icon: Building },
    { path: '/faq', label: 'FAQ', icon: HelpCircle },
    { path: '/contact', label: 'Contact', icon: Phone },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
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

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
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

      {/* Admin Link at Bottom */}
      <div className="p-4 border-t border-gray-200">
        {isLoggedIn ? (
          <Link
            to="/admin/bins"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname.startsWith('/admin')
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/login'
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;