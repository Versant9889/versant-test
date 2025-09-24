import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Versant Practice Test</title>
        <meta name="description" content="Read the privacy policy for the Versant Practice Test website." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-10 rounded-lg shadow-md">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
          <div className="prose prose-lg max-w-none">
            <p>This privacy policy sets out how we use and protect any information that you give us when you use this website.</p>

            <h2 className="text-2xl font-bold mt-6 mb-4">1. Information We Collect</h2>
            <p>We may collect the following information:</p>
            <ul>
              <li>Name and contact information including email address</li>
              <li>Demographic information such as postcode, preferences and interests</li>
              <li>Other information relevant to customer surveys and/or offers</li>
            </ul>

            <h2 className="text-2xl font-bold mt-6 mb-4">2. How We Use Your Information</h2>
            <p>We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:</p>
            <ul>
              <li>Internal record keeping.</li>
              <li>We may use the information to improve our products and services.</li>
              <li>We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-6 mb-4">3. Security</h2>
            <p>We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure, we have put in place suitable physical, electronic and managerial procedures to safeguard and secure the information we collect online.</p>

            <h2 className="text-2xl font-bold mt-6 mb-4">4. Cookies</h2>
            <p>A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyse web traffic or lets you know when you visit a particular site. We use traffic log cookies to identify which pages are being used.</p>

            <h2 className="text-2xl font-bold mt-6 mb-4">5. Links to Other Websites</h2>
            <p>Our website may contain links to other websites of interest. However, once you have used these links to leave our site, you should note that we do not have any control over that other website. Therefore, we cannot be responsible for the protection and privacy of any information which you provide whilst visiting such sites and such sites are not governed by this privacy statement.</p>

            <h2 className="text-2xl font-bold mt-6 mb-4">6. Controlling Your Personal Information</h2>
            <p>You may choose to restrict the collection or use of your personal information. If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us.</p>
          </div>
        </div>
      </div>
    </>
  );
}