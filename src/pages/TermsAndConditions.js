import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function TermsAndConditions() {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions | Versant Practice Test</title>
        <meta name="description" content="Read the terms and conditions for using the Versant Practice Test website." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-10 rounded-lg shadow-md">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Terms and Conditions</h1>
          <div className="prose prose-lg max-w-none">
            <p>Welcome to Versant Practice Test. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern our relationship with you in relation to this website.</p>

            <h2 className="text-2xl font-bold mt-6 mb-4">1. Use of the Website</h2>
            <p>The content of the pages of this website is for your general information and use only. It is subject to change without notice.</p>

            <h2 className="text-2xl font-bold mt-6 mb-4">2. User Account</h2>
            <p>To access certain features of the website, you may be required to create an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.</p>

            <h2 className="text-2xl font-bold mt-6 mb-4">3. Intellectual Property</h2>
            <p>This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.</p>

            <h2 className="text-2xl font-bold mt-6 mb-4">4. Disclaimer</h2>
            <p>The materials on this website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

            <h2 className="text-2xl font-bold mt-6 mb-4">5. Limitation of Liability</h2>
            <p>In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.</p>

            <h2 className="text-2xl font-bold mt-6 mb-4">6. Governing Law</h2>
            <p>Your use of this website and any dispute arising out of such use of the website is subject to the laws of our country.</p>
          </div>
        </div>
      </div>
    </>
  );
}
