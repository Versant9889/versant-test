import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { FaBook, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function EbookRecommendSlide({ onContinue, testType }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  // Load Razorpay SDK
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyNow = async () => {
    setIsProcessing(true);
    const razorpayLoaded = await loadRazorpay();

    if (!razorpayLoaded) {
      alert('Razorpay failed to load. Please check your internet connection.');
      setIsProcessing(false);
      return;
    }

    try {
      const checkoutEmail = user ? user.email : '';
      const checkoutUid = user ? user.uid : 'guest';

      const orderResponse = await fetch('/.netlify/functions/createRazorpayOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: checkoutUid,
          email: checkoutEmail,
          productType: 'ebook',
          referredBy: localStorage.getItem('versant_affiliate_ref') || null
        })
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create checkout order on server.");
      }

      const orderData = await orderResponse.json();

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Versant Test Mastery Ebook",
        description: "Complete preparation guide with 20 practice sets",
        image: "https://versantpro.com/logo.png",
        order_id: orderData.order_id,
        prefill: {
          email: checkoutEmail,
          name: user ? (user.displayName || '') : ''
        },
        theme: {
          color: "#0f766e" // Teal theme
        },
        handler: async function (response) {
          setIsProcessing(true);
          console.log("Payment Success! Verifying...");
          try {
            const verifyRes = await fetch('/.netlify/functions/verifyRazorpayPayment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                uid: checkoutUid,
                email: checkoutEmail,
                productType: 'ebook',
                referredBy: localStorage.getItem('versant_affiliate_ref') || null
              })
            });

            if (verifyRes.ok) {
              // Set local purchase flag so recommendation is skipped
              localStorage.setItem('ebook_purchased', 'true');
              
              // Redirect to thank you page with test return param
              window.location.href = `/thank-you?payment_id=${response.razorpay_payment_id}&redirect_to_test=${testType}`;
            } else {
              let errMsg = "Unknown server error.";
              try {
                const errorData = await verifyRes.json();
                errMsg = errorData.error || errMsg;
              } catch (e) {
                errMsg = `Server returned status code ${verifyRes.status}`;
              }
              alert("Verification error: " + errMsg);
            }
          } catch (verifyError) {
            console.error("Signature verification query failed:", verifyError);
            alert("Verification check failed. If amount was deducted, please check your email or contact support.");
          } finally {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error("Payment initialization failed:", err);
      alert("Could not initialize transaction. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    // Dismiss recommendation card for today (24h skip)
    const todayStr = new Date().toDateString();
    localStorage.setItem('ebook_recommend_dismissed_date', todayStr);
    onContinue();
  };

  return (
    <div className="min-h-screen bg-gray-50 bg-gradient-to-tr from-emerald-50/20 via-gray-50 to-teal-50/20 flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-gray-800 relative overflow-hidden select-none">
      {/* Background glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/30 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-teal-100/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-650 to-teal-700 border border-emerald-500/20 shadow-2xl rounded-[2.5rem] p-8 sm:p-12 w-full max-w-2xl text-center relative z-10 animate-fade-in flex flex-col items-center transition-all duration-500">
        
        {/* Header */}
        <span className="px-4 py-1.5 bg-white/20 border border-white/30 rounded-full text-white text-xs font-black uppercase tracking-widest mb-6">
          💡 Smart <span className="font-extrabold italic underline decoration-emerald-200">eBook</span> Recommendation
        </span>
        
        <h2 className="text-3xl sm:text-5xl font-black text-white mb-3 tracking-tight flex items-center justify-center gap-3">
          <FaBook className="text-white text-2xl sm:text-4xl" /> Versant Test Mastery
        </h2>
        <p className="text-emerald-50/90 text-sm sm:text-base mb-8 max-w-md font-light leading-relaxed">
          Boost your score instantly! Crack the automated AI voice evaluation algorithms with our high-scoring response templates.
        </p>

        {/* Pricing */}
        <div className="flex items-center gap-3 mb-8 bg-white/10 border border-white/20 px-7 py-3.5 rounded-2xl shadow-inner">
          <span className="text-emerald-200/80 line-through text-base">₹499</span>
          <span className="text-3xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">₹199</span>
          <span className="text-emerald-100/90 text-xs font-bold uppercase tracking-wide">Only</span>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-10 text-left border-t border-b border-white/20 py-8">
          {[
            "20 Full Practice Sets",
            "Repeat Sentence Strategies",
            "Story Retelling Techniques",
            "Listening & Speaking Tips",
            "Lifetime Access"
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3 text-white font-semibold text-sm sm:text-base">
              <FaCheckCircle className="text-emerald-200 flex-shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-lg">
          <button
            onClick={handleBuyNow}
            disabled={isProcessing}
            className="px-8 py-4 rounded-2xl font-black text-emerald-800 bg-white hover:bg-emerald-50 transition-all w-full sm:w-1/2 flex items-center justify-center gap-2 text-base shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.25)] transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Buy Now"} <FaArrowRight />
          </button>
          <button
            onClick={handleContinue}
            className="px-8 py-4 rounded-2xl font-bold text-white bg-transparent border border-white/40 hover:bg-white/10 transition-colors w-full sm:w-1/2 text-base text-center"
          >
            Continue Free Test
          </button>
        </div>
      </div>
    </div>
  );
}
