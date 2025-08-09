import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  Calendar,
  LogOut,
  ExternalLink,
  FileText
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/bins', label: 'All Bins', icon: Package },
    { path: '/admin/drivers', label: 'Drivers Management', icon: Truck },
    { path: '/admin/pickups', label: 'Bin Pickups', icon: Calendar },
    { path: '/admin/pickup-requests', label: 'Pickup Requests', icon: FileText },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/login');
  };

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

      {/* Footer Buttons */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          to="/home"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 w-full"
        >
          <ExternalLink className="w-5 h-5" />
          <span>Main Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;