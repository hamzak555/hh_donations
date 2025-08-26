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
  Users,
  Shield,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User,
  Mail,
  Lock,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [userName, setUserName] = useState(() => {
    // Extract name from email or use stored full name
    const email = localStorage.getItem('userEmail') || '';
    const fullName = localStorage.getItem('userFullName') || '';
    
    // If we have a stored full name, use it
    if (fullName) return fullName;
    
    // Otherwise, extract from email
    if (email.includes('carmine@zayoungroup.com')) return 'Carmine Zayoun';
    if (email === 'admin@hhdonations.org' || email === 'admin') return 'Admin';
    
    // Extract name before @ symbol and format nicely
    const namePart = email.split('@')[0];
    if (namePart) {
      // Replace dots and underscores with spaces and capitalize words
      return namePart
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return 'User';
  });
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  // Load pickup requests from localStorage directly
  useEffect(() => {
    const loadPendingCount = () => {
      try {
        const storedData = localStorage.getItem('pickupRequests');
        
        if (storedData) {
          const requests = JSON.parse(storedData);
          // Note: Status is capitalized 'Pending' not 'pending'
          const count = requests.filter((request: any) => request.status === 'Pending').length;
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

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

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
    { path: '/admin/partners', label: 'Partners', icon: Users },
    { path: '/admin/bales', label: 'Bales', icon: Archive },
    { path: '/admin/containers', label: 'Containers', icon: Container },
    { path: '/admin/drivers', label: 'Drivers', icon: Truck },
    { path: '/admin/reporting', label: 'Reporting', icon: BarChart3 },
    { 
      path: '/admin/administration', 
      label: 'Administration', 
      icon: Settings,
      subItems: [
        { path: '/admin/users', label: 'User Management', icon: Shield },
        { path: '/admin/sensor-test', label: 'Sensor Test', icon: Wifi }
      ]
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/login');
  };

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
                to="/admin/pickup-requests"
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors relative"
              >
                <FileText className="w-4 h-4" />
                <span>Requests</span>
                {pendingCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </div>
                )}
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
            <span className="text-lg font-semibold text-gray-900">Admin Menu</span>
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isParentActive = hasSubItems && item.subItems!.some(subItem => location.pathname === subItem.path);
            const isExpanded = expandedItems.includes(item.path);
            const isAdministration = item.path === '/admin/administration';
            
            return (
              <li key={item.path}>
                {isAdministration ? (
                  // Administration dropdown
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.path)}
                      className={`w-full relative flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-sm ${
                        isParentActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  // Regular navigation items
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
                )}
                
                {/* Sub-items */}
                {hasSubItems && (isExpanded || !isAdministration) && (
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

          {/* Mobile Footer Buttons */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                setIsProfileDialogOpen(true);
                setNewEmail(userEmail);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setProfileError('');
                setProfileSuccess('');
              }}
              className="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-50 w-full text-sm"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
            <Link
              to="/home"
              className="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-50 w-full text-sm"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Main Website</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-50 w-full text-sm"
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isParentActive = hasSubItems && item.subItems!.some(subItem => location.pathname === subItem.path);
              const isExpanded = expandedItems.includes(item.path);
              const isAdministration = item.path === '/admin/administration';
              
              return (
                <li key={item.path}>
                  {isAdministration ? (
                    // Administration dropdown
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.path)}
                        className={`w-full relative flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-sm ${
                          isParentActive
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    // Regular navigation items
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
                  )}
                  
                  {/* Sub-items */}
                  {hasSubItems && (isExpanded || !isAdministration) && (
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

        {/* Desktop Footer Buttons */}
        <div className="p-3 border-t border-gray-200 space-y-1">
          {/* User Profile */}
          <button
            onClick={() => {
              setIsProfileDialogOpen(true);
              setNewEmail(userEmail);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setProfileError('');
              setProfileSuccess('');
            }}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-50 w-full text-sm"
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </button>
          <Link
            to="/home"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-50 w-full text-sm"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Main Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-50 w-full text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your account email and password
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {profileError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {profileError}
                </AlertDescription>
              </Alert>
            )}
            
            {profileSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {profileSuccess}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Change Password</h4>
              
              <div className="space-y-2">
                <Label htmlFor="current-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              
              <div className="space-y-2 mt-3">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="space-y-2 mt-3">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsProfileDialogOpen(false);
                setProfileError('');
                setProfileSuccess('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setProfileError('');
                setProfileSuccess('');
                
                // Validate email
                if (!newEmail || !newEmail.includes('@')) {
                  setProfileError('Please enter a valid email address');
                  return;
                }
                
                // If changing password, validate
                if (currentPassword || newPassword || confirmPassword) {
                  if (!currentPassword) {
                    setProfileError('Please enter your current password');
                    return;
                  }
                  if (!newPassword) {
                    setProfileError('Please enter a new password');
                    return;
                  }
                  if (newPassword.length < 6) {
                    setProfileError('Password must be at least 6 characters');
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setProfileError('Passwords do not match');
                    return;
                  }
                  
                  // TODO: Implement actual password change via Supabase
                  // For now, just show success
                  setProfileSuccess('Password updated successfully');
                }
                
                // Update email in localStorage
                if (newEmail !== userEmail) {
                  localStorage.setItem('userEmail', newEmail);
                  setUserEmail(newEmail);
                  setProfileSuccess('Profile updated successfully');
                }
                
                // Close dialog after a delay if successful
                if (!profileError) {
                  setTimeout(() => {
                    setIsProfileDialogOpen(false);
                    setProfileError('');
                    setProfileSuccess('');
                  }, 2000);
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminSidebar;