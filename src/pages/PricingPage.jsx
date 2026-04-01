import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function PricingPage() {
    const navigate = useNavigate();
    const [isYearly, setIsYearly] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initialize Razorpay dynamically
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async () => {
        if (!auth.currentUser) {
            alert('Please sign in or create an account first to upgrade to Pro.');
            navigate('/signup');
            return;
        }

        setIsProcessing(true);
        const res = await loadRazorpay();

        if (!res) {
            alert('Razorpay failed to load. Are you offline or using a strict adblocker?');
            setIsProcessing(false);
            return;
        }

        // 1. Fetch Order ID from Secure Serverless API (Netlify)
        try {
            const orderResponse = await fetch('/.netlify/functions/createRazorpayOrder', { method: 'POST' });
            if (!orderResponse.ok) {
                throw new Error("Failed to generate secure Razorpay order from the backend. " + orderResponse.statusText);
            }
            const orderData = await orderResponse.json();

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Loaded securely from .env
                amount: orderData.amount, // Real amount from server
                currency: orderData.currency, // INR
                name: "VersantPro Premium",
                description: "Lifetime Access to 20 Mock Exams",
                image: "https://versantpro.com/logo.png", // Replace with real logo
                order_id: orderData.order_id, // Cryptographically secured order ID from Netlify
                handler: async function (response) {
                    console.log("Payment Success! Initiating Server Verification...");
                    setIsProcessing(true);
                    
                    try {
                        const verifyRes = await fetch('/.netlify/functions/verifyRazorpayPayment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                uid: auth.currentUser.uid
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            alert("Payment Verified! Welcome to Versant Pro. All tests are now unlocked.");
                            navigate('/dashboard');
                        } else {
                            alert("Payment verification failed: " + verifyData.error);
                            setIsProcessing(false);
                        }
                    } catch (err) {
                        alert("Network error during verification. If money was deducted, contact support.");
                        console.error("Verification error:", err);
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: auth.currentUser.displayName || "User",
                    email: auth.currentUser.email || "",
                    contact: "" // Optional
                },
                theme: {
                    color: "#10b981" // Match Emerald Green UI
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (err) {
            console.error(err);
            alert("Could not initialize payment. Please try again later.");
        }
        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen gradient-bg text-white font-sans selection:bg-emerald-500/30">
            <Helmet>
                <title>Premium Versant Practice Plans | Upgrade to Pro</title>
                <meta name="description" content="Unlock 19 full-length Versant mock exams with advanced AI voice analysis. Prepare for your MNC interview with the ultimate test simulator." />
            </Helmet>

            <Header />

            <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto text-center relative z-10">
                {/* Hero Header */}
                <div className="max-w-3xl mx-auto mb-16 slide-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-900/40 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Special Limited Offer
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-100">Ultimate Score</span>
                    </h1>
                    <p className="text-lg text-emerald-100/80">
                        Stop guessing your score. Get instant AI feedback, deep pronunciation analysis, and 19 premium mock exams designed to get you hired.
                    </p>
                </div>

                {/* Pricing Cards Container */}
                <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 max-w-5xl mx-auto relative z-20">
                    
                    {/* Free Plan (Anchor) */}
                    <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-start text-left transition-transform hover:-translate-y-2 duration-300">
                        <h3 className="text-2xl font-bold mb-2">Free Trial</h3>
                        <p className="text-emerald-100/60 mb-6 min-h-[48px]">Perfect for testing our AI engine before committing.</p>
                        <div className="mb-8">
                            <span className="text-5xl font-extrabold">$0</span>
                            <span className="text-emerald-100/60 ml-2">Forever</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1 w-full">
                            <li className="flex items-center gap-3 text-emerald-50 text-sm">
                                <span className="text-emerald-400">✓</span> Full Access to Test 1
                            </li>
                            <li className="flex items-center gap-3 text-emerald-50 text-sm">
                                <span className="text-emerald-400">✓</span> Basic AI Scoring
                            </li>
                            <li className="flex items-center gap-3 text-slate-500 text-sm">
                                <span>✕</span> Premium Tests 2-20
                            </li>
                            <li className="flex items-center gap-3 text-slate-500 text-sm">
                                <span>✕</span> Deep Pronunciation Analytics
                            </li>
                        </ul>
                        <button onClick={() => navigate('/signup')} className="w-full py-4 rounded-xl border-2 border-white/20 hover:bg-white/10 font-bold transition-colors">
                            Current Plan
                        </button>
                    </div>

                    {/* Pro Plan (Highlighted) */}
                    <div className="flex-[1.2] bg-gradient-to-b from-emerald-900/90 to-slate-900/90 backdrop-blur-xl border-2 border-emerald-500/50 rounded-3xl p-8 flex flex-col items-start text-left relative transform lg:-translate-y-4 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 font-extrabold px-4 py-1 rounded-full text-sm shadow-lg">
                            MOST POPULAR
                        </div>
                        
                        <h3 className="text-3xl font-extrabold mb-2 text-white">Versant Pro Pass</h3>
                        <p className="text-emerald-200/80 mb-6 min-h-[48px]">Everything you need to guarantee your success in corporate interviews.</p>
                        
                        <div className="mb-8 flex items-baseline gap-3">
                            <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white">$14.99</span>
                            <span className="text-emerald-100/60 text-lg uppercase tracking-wider">USD</span>
                        </div>
                        <div className="bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-full inline-block mb-6 border border-rose-500/30">
                            LIFETIME ACCESS (Usually $29.99)
                        </div>

                        <ul className="space-y-4 mb-8 flex-1 w-full">
                            {[
                                "Full Access to 19 Premium Mock Exams",
                                "Unlimited AI Voice Evaluation & Scoring",
                                "Deep Pronunciation & Grammar Corrections",
                                "Model 'Perfect Answers' for every question",
                                "No monthly subscriptions. Pay once.",
                                "Instant 24/7 Digital Access"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-0.5 min-w-[20px] h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <span className="text-emerald-400 text-xs">✓</span>
                                    </div>
                                    <span className="text-emerald-50 font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button onClick={handleUpgrade} disabled={isProcessing} className="w-full py-4 rounded-xl font-extrabold text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-900 disabled:opacity-50 disabled:cursor-wait mb-4">
                            {isProcessing ? "Connecting Gateway..." : "Pay ₹1250 (Indian Users)"}
                        </button>
                        
                        <div className="w-full relative flex items-center mb-4">
                            <div className="flex-grow border-t border-emerald-500/30"></div>
                            <span className="flex-shrink-0 mx-4 text-emerald-200/60 text-xs font-bold uppercase tracking-wider">OR</span>
                            <div className="flex-grow border-t border-emerald-500/30"></div>
                        </div>

                        {/* PayPal Smart Buttons for International Users */}
                        <div className="w-full relative z-50">
                            <PayPalScriptProvider options={{ 
                                "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || "test", // Uses sandbox 'test' if env not found
                                currency: "USD",
                                intent: "capture"
                            }}>
                                <PayPalButtons 
                                    style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
                                    createOrder={(data, actions) => {
                                        if (!auth.currentUser) {
                                            alert('Please sign in first to upgrade to Pro.');
                                            navigate('/signup');
                                            return actions.reject();
                                        }
                                        return actions.order.create({
                                            purchase_units: [{
                                                amount: { value: "14.99" },
                                                description: "VersantPro Premium Access"
                                            }]
                                        });
                                    }}
                                    onApprove={async (data, actions) => {
                                        setIsProcessing(true);
                                        try {
                                            const verifyRes = await fetch('/.netlify/functions/verifyPayPalPayment', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    orderID: data.orderID,
                                                    uid: auth.currentUser.uid
                                                })
                                            });

                                            const verifyData = await verifyRes.json();

                                            if (verifyRes.ok) {
                                                alert("PayPal Payment Verified! Welcome to Versant Pro. All tests are now unlocked.");
                                                navigate('/dashboard');
                                            } else {
                                                alert("Payment verification failed: " + verifyData.error);
                                                setIsProcessing(false);
                                            }
                                        } catch (err) {
                                            console.error("PayPal Verification error:", err);
                                            alert("Network error during verification. If money was deducted, contact support.");
                                            setIsProcessing(false);
                                        }
                                    }}
                                    onError={(err) => {
                                        console.error("PayPal Error:", err);
                                        alert("There was an error loading the PayPal popup.");
                                    }}
                                />
                            </PayPalScriptProvider>
                        </div>

                        <div className="w-full text-center mt-4 flex items-center justify-center gap-2 opacity-60">
                            <svg className="w-4 h-4 text-emerald-200" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                            <span className="text-xs text-emerald-100 font-medium">Secured via Razorpay & PayPal (256-bit)</span>
                        </div>
                    </div>
                </div>

                {/* Trust Badges / Social Proof */}
                <div className="mt-24 pt-16 border-t border-white/10">
                    <p className="text-emerald-200/60 font-bold tracking-widest uppercase text-sm mb-8">Trusted by candidates hired at</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Mock Logos - represented by text for now */}
                        <div className="text-2xl font-black font-serif">Amazon</div>
                        <div className="text-2xl font-black tracking-tighter">Deloitte.</div>
                        <div className="text-2xl font-bold tracking-wider">Convergys</div>
                        <div className="text-2xl font-bold italic">Genpact</div>
                        <div className="text-xl font-bold">Tech Mahindra</div>
                    </div>
                </div>

            </div>
            
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
            </div>
        </div>
    );
}
