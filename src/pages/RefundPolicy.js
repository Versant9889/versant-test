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
          
          <div className="prose prose-lg prose-emerald max-w-none text-gray-600 space-y-6">
            <p className="font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded-xl inline-block">
              Effective Date: January 1, 2026
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">1. Overview</h2>
            <p>
              At VersantPro, we strive to deliver high-quality test preparation resources, AI evaluation tools, and study materials. Because our platform offers digital subscriptions, online software features, and downloadable digital assets, refund eligibility depends on the specific product type purchased as detailed below.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">2. Digital eBook Purchases (Strictly Non-Refundable)</h2>
            <p>
              All purchases of the <strong>Versant Test Mastery eBook</strong> and associated downloadable digital resources are <strong>100% final, non-returnable, and non-refundable</strong>.
            </p>
            <p className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl text-amber-950 font-medium text-sm">
              <strong>Rationale:</strong> The eBook is an intangible, downloadable digital product. Once access or download links are delivered upon successful payment, the digital asset cannot be physically returned or revoked. By completing an eBook purchase, you explicitly acknowledge and agree that no refunds or exchanges will be granted.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">3. Subscriptions & Pro Pass Plans (7-Day Money-Back Guarantee)</h2>
            <p>
              We offer a <strong>7-day refund policy</strong> on initial Subscription and Pro Pass plan purchases (e.g. 19 Premium Tests Pass).
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Eligibility Window:</strong> If you are unsatisfied with your subscription, you may request a full refund within <strong>7 calendar days</strong> of your initial purchase date.</li>
              <li><strong>Usage Limits:</strong> To prevent abuse, refunds will only be approved if the candidate has attempted fewer than <strong>3 mock tests</strong> during the 7-day period.</li>
              <li><strong>After 7 Days:</strong> Refund requests submitted after 7 calendar days from the purchase date will be automatically declined.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">4. Technical Exceptions & Duplicate Charges</h2>
            <p>Notwithstanding the above, a full refund will be processed for any product type under the following technical circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Duplicate Transaction:</strong> You were accidentally charged twice for the exact same transaction due to a gateway or system glitch.</li>
              <li><strong>Total Non-Delivery:</strong> A system error on our platform actively prevented access to your account and our support team was unable to resolve the issue within 48 hours.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">5. How to Request a Refund</h2>
            <p>
              To initiate a subscription refund within the 7-day window or report a duplicate transaction, please contact our support team:
            </p>
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-emerald-950 font-medium space-y-2">
              <p><strong>Support Email:</strong> sds1369@gmail.com</p>
              <p><strong>Required Details:</strong> Registered Email, Order ID / Payment Reference ID, and Reason for Request.</p>
              <p className="text-xs text-emerald-800">Approved refunds are processed back to the original payment method within 5–7 business days.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
