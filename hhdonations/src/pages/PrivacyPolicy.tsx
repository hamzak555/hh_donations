import React from 'react';
import Footer from '../components/Footer';

const PrivacyPolicy: React.FC = () => {
  return (
    <div>
      <div className="px-8 pt-10 pb-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when using HH Donations services, including:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Contact information (name, email, phone number)</li>
              <li>Pickup request details (address, donation items)</li>
              <li>Usage data and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Process and fulfill donation pickup requests</li>
              <li>Communicate with you about our services</li>
              <li>Improve our platform and user experience</li>
              <li>Ensure the security and proper functioning of our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>With service providers who assist in our operations</li>
              <li>When required by law or legal process</li>
              <li>To protect our rights, property, or safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Access and update your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt out of communications</li>
              <li>Request information about data we collect</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience on our platform. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the updated policy on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our contact page or email us directly.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;