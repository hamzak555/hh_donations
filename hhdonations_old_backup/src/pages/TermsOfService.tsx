import React from 'react';
import Footer from '../components/Footer';

const TermsOfService: React.FC = () => {
  return (
    <div>
      <div className="px-8 pt-10 pb-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">1. Acceptance of Terms</h2>
            <p>
              By accessing and using HH Donations ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the terms of this agreement, you are not authorized to use or access this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">2. Description of Service</h2>
            <p>
              HH Donations is a platform that facilitates the donation of household items by connecting donors with pickup services and donation bins. We provide tools to locate donation bins, schedule pickups, and manage donation requests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">3. User Responsibilities</h2>
            <p>As a user of our service, you agree to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Provide accurate and truthful information</li>
              <li>Use the service only for legitimate donation purposes</li>
              <li>Respect the rights and property of others</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not misuse or abuse the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">4. Donation Guidelines</h2>
            <p>When using our service, you must ensure that:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Donated items are in good, usable condition</li>
              <li>Items are appropriate for donation and not prohibited</li>
              <li>You have the legal right to donate the items</li>
              <li>Items are properly prepared for pickup or drop-off</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">5. Pickup Services</h2>
            <p>
              Pickup services are subject to availability and scheduling constraints. We reserve the right to refuse pickup requests that do not meet our guidelines or are outside our service area.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">6. Limitation of Liability</h2>
            <p>
              HH Donations shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">7. Service Availability</h2>
            <p>
              We strive to maintain service availability but do not guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, technical issues, or circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">8. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which governs how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">9. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the service constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">10. Termination</h2>
            <p>
              We may terminate or suspend your access to the service at any time, without prior notice, for conduct that we believe violates these terms or is harmful to other users or the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">11. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which HH Donations operates, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through our contact page or email us directly.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;