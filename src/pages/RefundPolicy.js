import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <Helmet>
        <title>Refund & Cancellation Policy | VersantPro</title>
      </Helmet>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Refund & Cancellation Policy</h1>
          
          <div className="prose prose-lg prose-emerald max-w-none text-gray-600">
            <p className="font-bold text-gray-800">Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">1. Digital Goods</h2>
            <p>
              VersantPro provides access to digital mock testing software, AI-driven evaluation engines, and digital study materials. Because our products are non-tangible, irrevocable digital goods, <strong>all sales are final.</strong> By purchasing a Pro Pass or any premium tier, you acknowledge and agree that refunds are strictly governed by this policy.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">2. No Refund Principle</h2>
            <p>
              Since access to the premium exams and AI grading algorithms is granted instantly upon successful payment, we do <strong>not</strong> offer refunds, cancellations, or exchanges once the payment is processed and access is delivered to your account.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">3. Exceptions</h2>
            <p>We may grant refunds at our sole discretion under the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Duplicate Transaction:</strong> If you are charged twice for the exact same transaction due to a technical error on our side or the payment gateway's side.</li>
              <li><strong>Complete Non-Delivery:</strong> If a technical failure on our platform actively prevents you from accessing your purchased tests for an extended period, and our support team confirms the issue cannot be resolved.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">4. Technical Issues</h2>
            <p>
              If you experience technical issues accessing the premium features, it is your responsibility to contact our Support team within 3 days of purchase. We will make every effort to fix the underlying technical issue or provide an alternative access method. Inability to use the platform due to user-side software, hardware incompatibility, or lack of internet connection does not qualify for a refund.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">5. Cancellation of Subscription</h2>
            <p>
              If your VersantPro plan involves a recurring subscription, you may cancel your subscription at any time to prevent future billing. However, cancellation does not grant a retroactive refund for charges already processed. You will retain access to the platform until the end of your current billing cycle.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">6. Contact Us</h2>
            <p>
              If you believe you qualify for an exceptional refund based on Section 3, please contact us immediately:
            </p>
            <p className="mt-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-emerald-900 font-medium">
              Email: sds1369@gmail.com <br/>
              Support hours: Monday to Friday, 9:00 AM - 6:00 PM (IST)
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
