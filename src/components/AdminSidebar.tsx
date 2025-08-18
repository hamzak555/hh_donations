import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  LogOut,
  ExternalLink,
  FileText,
  Route,
  Archive,
  Container,
  Wifi,
  Users
} from 'lucide-react';

interface NavSubItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavSubItem[];
}

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  
  // Load pickup requests from localStorage directly
  useEffect(() => {
    const loadPendingCount = () => {
      try {
        const storedData = localStorage.getItem('pickupRequests');
        console.log('Loading pickup requests:', storedData ? 'found' : 'not found');
        
        if (storedData) {
          const requests = JSON.parse(storedData);
          // Note: Status is capitalized 'Pending' not 'pending'
          const count = requests.filter((request: any) => request.status === 'Pending').length;
          console.log('Pending pickup requests count:', count);
          console.log('All statuses:', requests.map((r: any) => r.status));
          setPendingCount(count);
        }
      } catch (error) {
        console.error('Error loading pickup requests:', error);
      }
    };
    
    // Load initially
    loadPendingCount();
    
    // Set up an interval to check for updates
    const interval = setInterval(loadPendingCount, 2000); // Check every 2 seconds
    
    // Listen for storage events
    const handleStorageChange = () => loadPendingCount();
    window.addEventListener('storage', handleStorageChange);
    
    // Also reload when navigating
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]);

  const navItems: NavItem[] = [
    { 
      path: '/admin/bins', 
      label: 'All Bins', 
      icon: Package,
      subItems: [
        { path: '/admin/drivers/route-creation', label: 'Bin Routes', icon: Route }
      ]
    },
    { 
      path: '/admin/pickup-requests', 
      label: 'Pickup Requests', 
      icon: FileText,
      subItems: [
        { path: '/admin/pickup-requests/route-generator', label: 'Pickup Routes', icon: Route }
      ]
    },
    { path: '/admin/partner-applications', label: 'Partner Applications', icon: Users },
    { path: '/admin/bales', label: 'Bale Management', icon: Archive },
    { path: '/admin/containers', label: 'Container Management', icon: Container },
    { path: '/admin/drivers', label: 'Driver Management', icon: Truck },
    { path: '/admin/sensor-test', label: 'Sensor Test', icon: Wifi },
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
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isParentActive = hasSubItems && item.subItems!.some(subItem => location.pathname === subItem.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`relative flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-sm ${
                    isActive || isParentActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.path === '/admin/pickup-requests' && pendingCount > 0 && (
                    <div className={`
                      w-6 h-6
                      flex items-center justify-center 
                      text-xs font-bold rounded-full
                      ${isActive || isParentActive
                        ? 'bg-white text-primary'
                        : 'bg-primary text-white'
                      }
                    `}>
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </div>
                  )}
                </Link>
                
                {/* Sub-items */}
                {hasSubItems && (
                  <ul className="mt-2 ml-4 space-y-1">
                    {(item.subItems || []).map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                              isSubActive
                                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                            }`}
                          >
                            <SubIcon className="w-4 h-4" />
                            <span>{subItem.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
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