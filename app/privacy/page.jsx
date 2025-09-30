'use client';

import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">IntellQueue App</p>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: September 30, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose max-w-none text-gray-700 leading-relaxed">
          
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Introduction
            </h2>
            <p className="mb-4">
              Easy2Work ("we," "our," or "us") operates the IntellQueue mobile application 
              (the "Service"). This Privacy Policy explains how we collect, use, and protect 
              information when you use our Service.
            </p>
            <p className="mb-4">
              IntellQueue is a business queue management application designed for companies 
              to manage customer service workflows and employee scheduling.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              2.1 User Authentication Information
            </h3>
            <p className="mb-4">
              We collect only the following information necessary for app functionality:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>User IDs:</strong> Username and password credentials for authentication</li>
              <li><strong>Company Database Connection:</strong> Company identifier for database access</li>
              <li><strong>Session Data:</strong> Temporary login session information</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              2.2 Information We Do NOT Collect
            </h3>
            <p className="mb-4">IntellQueue does NOT collect:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Personal information (names, addresses, phone numbers)</li>
              <li>Financial or payment information</li>
              <li>Health or medical data</li>
              <li>Device contacts, photos, or files</li>
              <li>Location data or GPS coordinates</li>
              <li>Analytics or usage tracking data</li>
              <li>Advertising or marketing data</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="mb-4">
              We use the collected information solely for:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Authentication:</strong> Verifying user identity and app access</li>
              <li><strong>App Functionality:</strong> Enabling core queue management features</li>
              <li><strong>Session Management:</strong> Maintaining user login sessions</li>
              <li><strong>Security:</strong> Protecting against unauthorized access</li>
            </ul>
            <p className="mb-4">
              <strong>We do NOT use your information for:</strong> Analytics, advertising, 
              marketing, personalization, or any commercial purposes beyond app functionality.
            </p>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Information Sharing
            </h2>
            <p className="mb-4">
              Your authentication credentials are shared only with:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Your Company's Database Server:</strong> For login verification and app access</li>
              <li><strong>Authentication Services:</strong> Secure transmission to company systems</li>
            </ul>
            <p className="mb-4">
              <strong>We do NOT share, sell, or disclose your information to:</strong>
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Third-party advertisers or marketing companies</li>
              <li>Analytics or data collection services</li>
              <li>Social media platforms</li>
              <li>Any external parties except your own company's systems</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Data Storage and Security
            </h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              5.1 Data Storage
            </h3>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Login credentials are stored temporarily for session management</li>
              <li>No permanent data storage on mobile devices</li>
              <li>Session data expires automatically upon app closure</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              5.2 Security Measures
            </h3>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Secure authentication protocols</li>
              <li>Role-based access control</li>
              <li>Company-managed user accounts and permissions</li>
              <li>Session timeout for security</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Data Retention and Deletion
            </h2>
            <p className="mb-4">
              <strong>Automatic Data Deletion:</strong> All user data is automatically 
              deleted within 90 days of collection through the following mechanisms:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Login sessions expire automatically</li>
              <li>Temporary authentication data is purged regularly</li>
              <li>No long-term data retention on our systems</li>
              <li>Company database management is handled by your organization</li>
            </ul>
            <p className="mb-4">
              <strong>User Account Management:</strong> User accounts are created and 
              managed by your company's IT department, not by IntellQueue. Contact 
              your company administrator for account-related requests.
            </p>
          </section>

          {/* User Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Your Rights
            </h2>
            <p className="mb-4">
              Since IntellQueue uses company-managed authentication:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Account Management:</strong> Contact your company IT department for account changes</li>
              <li><strong>Data Access:</strong> Your company controls your account data</li>
              <li><strong>Data Deletion:</strong> Automatic 90-day deletion policy applies</li>
              <li><strong>App Access:</strong> Authentication is required - no opt-out available</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Third-Party Services
            </h2>
            <p className="mb-4">
              IntellQueue does not integrate with or use third-party services for:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Analytics or tracking</li>
              <li>Advertising or marketing</li>
              <li>Social media integration</li>
              <li>Payment processing</li>
              <li>External data storage</li>
            </ul>
            <p className="mb-4">
              The app connects only to your company's designated database servers 
              for authentication and business functionality.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibront text-gray-900 mb-4">
              9. Children's Privacy
            </h2>
            <p className="mb-4">
              IntellQueue is designed for business use by professional users aged 18 and older. 
              The app is not intended for use by children under 18. We do not knowingly 
              collect information from users under 18 years of age.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Changes to This Privacy Policy
            </h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically. Any changes will be 
              posted on this page with an updated "Last Updated" date. Continued 
              use of IntellQueue after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Contact Information
            </h2>
            <p className="mb-4">
              For questions about this Privacy Policy or IntellQueue's data practices:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="mb-2"><strong>Email:</strong> easy2work.india@gmail.com</p>
              <p className="mb-2"><strong>Company:</strong> Easy2Work</p>
              <p className="mb-2"><strong>App:</strong> IntellQueue - Queue Management System</p>
            </div>
          </section>

          {/* App Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. App Information Summary
            </h2>
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-3">
                IntellQueue Privacy Summary
              </h3>
              <ul className="text-blue-800 space-y-1">
                <li>✅ <strong>Minimal Data Collection:</strong> Only User IDs for authentication</li>
                <li>✅ <strong>Business Purpose Only:</strong> Queue management functionality</li>
                <li>✅ <strong>No Third-Party Sharing:</strong> Except company database systems</li>
                <li>✅ <strong>Automatic Deletion:</strong> 90-day data retention policy</li>
                <li>✅ <strong>No Analytics:</strong> No tracking or behavioral data collection</li>
                <li>✅ <strong>Company-Managed:</strong> Your IT department controls user accounts</li>
                <li>✅ <strong>Professional Use:</strong> Business application for 18+ users</li>
              </ul>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Easy2Work. All rights reserved.</p>
          <p className="mt-2">
            This privacy policy applies to the IntellQueue mobile application available on Google Play Store.
          </p>
        </div>
      </div>
    </div>
  );
}