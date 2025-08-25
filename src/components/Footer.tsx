import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Users, Recycle, Mail, Phone, Shield, LayoutDashboard } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is authenticated by looking for adminAuth in localStorage
    const authToken = localStorage.getItem('adminAuth');
    setIsLoggedIn(!!authToken);
  }, [location.pathname]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <footer className="bg-primary/5 text-gray-800 border-t">
      <div className="py-8 sm:py-12 lg:py-16 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Company Info - Full width on mobile */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">H&H Donations</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Making donations simple and accessible for everyone in our community.
            </p>
            <div className="flex space-x-4 justify-center sm:justify-start">
              <Recycle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="text-center sm:text-left">
            {/* Mobile button */}
            <button 
              className="sm:hidden w-32 mx-auto bg-white border border-gray-300 rounded-lg px-4 py-2 font-semibold text-base mb-3 hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('quicklinks')}
            >
              Quick Links
            </button>
            {/* Desktop header */}
            <h4 className="hidden sm:block font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h4>
            {/* Content - hidden on mobile unless expanded */}
            <ul className={`space-y-2 ${!openSections.includes('quicklinks') ? 'hidden sm:block' : ''}`}>
              <li><a href="/find-bin" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors inline-block py-1">Find a Bin</a></li>
              <li><a href="/what-to-donate" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors inline-block py-1">What to Donate</a></li>
              <li><a href="/our-story" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors inline-block py-1">Our Story</a></li>
              <li><a href="/faq" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors inline-block py-1">FAQ</a></li>
            </ul>
          </div>
          
          {/* Legal Links */}
          <div className="text-center sm:text-left">
            {/* Mobile button */}
            <button 
              className="sm:hidden w-32 mx-auto bg-white border border-gray-300 rounded-lg px-4 py-2 font-semibold text-base mb-3 hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('legal')}
            >
              Legal
            </button>
            {/* Desktop header */}
            <h4 className="hidden sm:block font-semibold text-base sm:text-lg mb-3 sm:mb-4">Legal</h4>
            {/* Content - hidden on mobile unless expanded */}
            <ul className={`space-y-2 ${!openSections.includes('legal') ? 'hidden sm:block' : ''}`}>
              <li><a href="/privacy-policy" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors inline-block py-1">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors inline-block py-1">Terms of Service</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 text-center sm:text-left">
            <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-start sm:items-center justify-center sm:justify-start">
                <Mail className="h-4 w-4 mr-2 text-gray-600 flex-shrink-0 mt-1 sm:mt-0" />
                <a href="mailto:info@hhdonations.org" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors break-all">info@hhdonations.org</a>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Phone className="h-4 w-4 mr-2 text-gray-600 flex-shrink-0" />
                <a href="tel:+15551234567" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors">(555) 123-4567</a>
              </li>
            </ul>
          </div>
          
          {/* Impact Stats - Side by side on all screens */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 text-center sm:text-left">
            <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Our Impact</h4>
            <div className="flex gap-3 sm:gap-2 justify-center sm:justify-start">
              <div className="flex-1 p-3 sm:p-2 bg-white rounded border text-center">
                <div className="text-lg sm:text-base font-bold text-primary">50K+</div>
                <div className="text-xs text-gray-600">Items Donated</div>
              </div>
              <div className="flex-1 p-3 sm:p-2 bg-white rounded border text-center">
                <div className="text-lg sm:text-base font-bold text-primary">200+</div>
                <div className="text-xs text-gray-600">Families Helped</div>
              </div>
            </div>
          </div>
          </div>
          
          <div className="border-t border-gray-300 mt-8 sm:mt-12 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center text-gray-600">
              <p className="flex flex-col sm:flex-row items-center text-xs sm:text-sm">
                <span>&copy; {new Date().getFullYear()} H&H Donations. All rights reserved.</span>
                <span className="flex items-center mt-2 sm:mt-0 sm:ml-2">
                  Making a difference, one donation at a time. 
                  <Heart className="ml-1 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                </span>
              </p>
              <div className="mt-4 sm:mt-0">
                {isLoggedIn ? (
                  <Link
                    to="/admin/bins"
                    className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;