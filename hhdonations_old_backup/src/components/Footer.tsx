import React from 'react';
import { Heart, Users, Recycle, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary/5 text-gray-800 py-16 border-t -mx-8 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">H&H Donations</h3>
            <p className="text-gray-600 mb-4">
              Making donations simple and accessible for everyone in our community.
            </p>
            <div className="flex space-x-4">
              <Recycle className="h-6 w-6 text-primary" />
              <Heart className="h-6 w-6 text-primary" />
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/find-bin" className="text-gray-600 hover:text-gray-900 transition-colors">Find a Bin</a></li>
              <li><a href="/what-to-donate" className="text-gray-600 hover:text-gray-900 transition-colors">What to Donate</a></li>
              <li><a href="/our-story" className="text-gray-600 hover:text-gray-900 transition-colors">Our Story</a></li>
              <li><a href="/faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/privacy-policy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-2 text-left">
              <li className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                info@hhdonations.org
              </li>
              <li className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                (555) 123-4567
              </li>
              <li className="text-gray-600">
                Toronto, Ontario
              </li>
            </ul>
          </div>
          
          {/* Impact Stats */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Our Impact</h4>
            <div className="space-y-2">
              <div className="p-2 bg-white rounded border">
                <div className="text-base font-bold text-primary">50K+</div>
                <div className="text-xs text-gray-600">Items Donated</div>
              </div>
              <div className="p-2 bg-white rounded border">
                <div className="text-base font-bold text-primary">200+</div>
                <div className="text-xs text-gray-600">Families Helped</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-300 mt-12 pt-8 text-left text-gray-600">
          <p>&copy; {new Date().getFullYear()} H&H Donations. All rights reserved. Making a difference, one donation at a time.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;