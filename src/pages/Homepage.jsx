import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { auth } from '../firebaseConfig';
import { FaCheckCircle, FaStar, FaChartPie, FaMicrophoneAlt, FaGlobe, FaArrowRight } from 'react-icons/fa';
import { trackGA4Event } from '../utils/GA4Analytics';

export default function VersantHomepage() {
  const navigate = useNavigate();
  const [liveCount, setLiveCount] = useState(47);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    trackGA4Event('homepage_view');
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        const next = prev + delta;
        return Math.min(Math.max(next, 38), 62);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  const handleBuyNowClick = () => {
    trackGA4Event('ebook_buy_click', { product_name: 'Versant Test Mastery Ebook', payment_amount: 199, currency: 'INR' });
    if (user) {
      initiateCheckout(user.email, user.uid);
    } else {
      initiateCheckout('', 'guest');
    }
  };

  const initiateCheckout = async (checkoutEmail, checkoutUid) => {
    setIsProcessing(true);
    const razorpayLoaded = await loadRazorpay();

    if (!razorpayLoaded) {
      alert('Razorpay failed to load. Please check your internet connection.');
      setIsProcessing(false);
      return;
    }

    try {
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
        throw new Error("Failed to create checkout order.");
      }

      const orderData = await orderResponse.json();

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_live_SUarCwkw3sp2rY",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Versant Test Mastery Ebook",
        description: "Complete preparation guide with 20 practice sets",
        image: "https://versantpro.com/logo.png",
        order_id: orderData.order_id,
        prefill: {
          email: (checkoutEmail && checkoutEmail !== 'unknown_email') ? checkoutEmail : ''
        },
        theme: {
          color: "#0f766e"
        },
        modal: {
          ondismiss: function() {
            trackGA4Event('razorpay_payment_failed', { product_name: 'Versant Test Mastery Ebook', payment_amount: 199, currency: 'INR', reason: 'User dismissed checkout modal' });
          }
        },
        handler: async function (response) {
          setIsProcessing(true);
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
              trackGA4Event('razorpay_payment_success', {
                transaction_id: response.razorpay_payment_id,
                payment_amount: 199,
                currency: 'INR',
                product_name: 'Versant Test Mastery Ebook',
                payment_method: 'razorpay'
              });
              if (typeof window !== "undefined" && typeof window.gtag === "function") {
                window.gtag('event', 'purchase_ebook', {
                  'value': 199,
                  'currency': 'INR',
                  'transaction_id': response.razorpay_payment_id
                });
              }
              // Redirect user directly to Thank You page
              navigate(`/thank-you?payment_id=${response.razorpay_payment_id}`);
            } else {
              const errorData = await verifyRes.json();
              alert("Verification error: " + errorData.error);
            }
          } catch (verifyError) {
            console.error(verifyError);
            alert("Verification failed. If payment was successful, contact support.");
          } finally {
            setIsProcessing(false);
          }
        }
      };

      trackGA4Event('razorpay_checkout_open', { product_name: 'Versant Test Mastery Ebook', payment_amount: 199, currency: 'INR' });
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert("Could not start payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full w-full min-h-screen overflow-auto bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
      <Helmet>
        <title>Versant Practice Test 2026 | Accurate AI Speaking Simulator</title>
        <meta name="description" content="Pass the Versant English Test on your first try. Get instant AI grading on pronunciation, sentence builds, and story retelling with our 20 full-length mock exams." />
      </Helmet>

      <Header />

      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-32 px-6 overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center slide-up">
          {/* Mobile-only Promo Banner */}
          <div 
            onClick={() => navigate('/ebook')}
            className="md:hidden w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 text-center py-3.5 px-4 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl border border-yellow-300/40 mb-6 flex items-center justify-center gap-2 animate-bounce cursor-pointer"
          >
            📘 Versant Test Mastery Ebook @ ₹199 ➔
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-emerald-100 text-sm font-semibold mb-8 border border-white/20 shadow-lg">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span> 
            Updated for 2026 Industry Standards
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight drop-shadow-md">
            Pass the Versant Test <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">On Your First Try</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-emerald-50 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Stop guessing your score. Get instant AI grading on your fluency, pronunciation, and vocabulary with 20 hyper-realistic mock exams.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto mt-4 relative z-20">
            {/* Speaking & Listening Demo Card */}
            <div 
              onClick={() => {
                trackGA4Event('free_test_start_click', { test_type: 'speaking', test_id: 1 });
                navigate('/versant-speaking-and-listening-practice-test/start/full', { state: { testId: 1 } });
              }}
              className="cursor-pointer group flex flex-col items-center p-8 bg-emerald-950/40 backdrop-blur-md rounded-[2rem] border border-emerald-500/30 hover:bg-emerald-900/60 hover:border-emerald-400 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(16,185,129,0.4)]"
            >
               <FaMicrophoneAlt className="text-5xl text-emerald-400 mb-5 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Evaluate your skills</h3>
               <p className="text-emerald-100/90 mb-8 font-medium text-lg">Take a Free Speaking Demo Test</p>
               <span className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full text-slate-900 font-extrabold group-hover:from-emerald-400 group-hover:to-teal-300 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                 Start Demo <FaArrowRight className="text-xl" />
               </span>
            </div>

            {/* Reading & Writing Demo Card */}
            <div 
              onClick={() => {
                trackGA4Event('free_test_start_click', { test_type: 'reading', test_id: 1 });
                navigate('/versant-reading-and-writing-mock-test/start', { state: { testId: 1 } });
              }}
              className="cursor-pointer group flex flex-col items-center p-8 bg-teal-950/40 backdrop-blur-md rounded-[2rem] border border-teal-500/30 hover:bg-teal-900/60 hover:border-teal-400 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(20,184,166,0.3)]"
            >
               <FaGlobe className="text-5xl text-teal-400 mb-5 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Evaluate your skills</h3>
               <p className="text-teal-100/90 mb-8 font-medium text-lg">Reading & Writing Demo Test</p>
               <span className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full text-slate-900 font-extrabold group-hover:from-teal-400 group-hover:to-emerald-300 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                 Start Demo <FaArrowRight className="text-xl" />
               </span>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-emerald-200/80 text-sm font-medium">
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-emerald-900" src="https://i.pravatar.cc/100?img=1" alt="User" />
              <img className="w-10 h-10 rounded-full border-2 border-emerald-900" src="https://i.pravatar.cc/100?img=2" alt="User" />
              <img className="w-10 h-10 rounded-full border-2 border-emerald-900" src="https://i.pravatar.cc/100?img=3" alt="User" />
              <img className="w-10 h-10 rounded-full border-2 border-emerald-900" src="https://i.pravatar.cc/100?img=4" alt="User" />
            </div>
            <div className="text-left leading-tight">
              <div className="flex text-yellow-400 mb-0.5"><FaStar/><FaStar/><FaStar/><FaStar/><FaStar/></div>
              <span>Trusted by 5,000+ students globally</span>
            </div>
            {/* 🔴 Live Counter */}
            <div className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              <span className="text-white font-bold text-sm">{liveCount} students</span>
              <span className="text-emerald-300/70 text-xs">practicing right now</span>
            </div>
          </div>
        </div>
      </section>

      {/* 📘 Ebook CTA Banner */}
      <section className="relative w-full px-6 max-w-6xl mx-auto z-30 -mt-24 mb-16 slide-up">
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 rounded-[2.5rem] p-8 md:p-12 border border-teal-500/30 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-left max-w-3xl">
            <img 
              onClick={() => navigate('/ebook')}
              src="/images/versant_ebook_cover.jpg" 
              alt="Versant Test Mastery Ebook Cover" 
              className="w-32 h-auto rounded-xl shadow-lg border border-teal-500/20 flex-shrink-0 select-none cursor-pointer hover:scale-105 transition-transform"
            />
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full text-teal-300 text-xs font-bold uppercase tracking-wider">
                📘 Prep Ebook
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
                Versant Test Mastery- A Complete Guide with 20 practice Sets
              </h2>
              <p className="text-emerald-100/80 text-sm md:text-base font-light leading-relaxed">
                Struggling with pronunciation or retelling stories? Get the exact templates, secret voice adjustments, and sample model responses that help candidates clear MNC cutoffs in 4 days.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-300 pt-2">
                <span>✓ Complete Prep Guide</span>
                <span>✓ 20 Practice Sets</span>
                <span>✓ Sample Answers</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 flex-shrink-0 text-center w-full lg:w-auto">
            <div className="text-emerald-400/60 text-sm line-through mb-1">₹499</div>
            <div className="text-5xl font-black text-white mb-2">₹199</div>
            <div className="text-emerald-300 text-xs mb-6 uppercase tracking-wider font-bold">One-time payment</div>
            
            <button
              onClick={handleBuyNowClick}
              disabled={isProcessing}
              className="w-full lg:w-auto px-8 py-4.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-900 font-extrabold rounded-2xl shadow-xl shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isProcessing ? "Connecting..." : "Buy Ebook Now"} <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Sneak Peek (Visual Hook) */}
      <section className="relative w-full max-w-6xl mx-auto px-6 z-20 mb-20 slide-up delay-200">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-2">
           <div className="bg-slate-100 rounded-t-2xl py-3 px-4 flex items-center gap-2 border-b border-slate-200">
             <div className="w-3 h-3 rounded-full bg-red-400"></div>
             <div className="w-3 h-3 rounded-full bg-amber-400"></div>
             <div className="w-3 h-3 rounded-full bg-green-400"></div>
             <div className="ml-4 text-xs font-mono text-slate-500 flex-1 text-center">dashboard.versantpro.com</div>
           </div>
           {/* Mockup Dashboard Image / HTML Representation */}
           <div className="p-8 bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
             <div className="md:col-span-2 space-y-6">
                <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
                <div className="h-8 w-64 bg-slate-300 rounded-full"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-slate-400 text-sm mb-2">Overall Score</div>
                    <div className="text-4xl font-bold text-emerald-600">68<span className="text-2xl text-slate-400">/80</span></div>
                  </div>
                  <div className="h-32 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-slate-400 text-sm mb-2">Fluency Level</div>
                    <div className="text-2xl font-bold text-slate-800">Advanced (C1)</div>
                  </div>
                </div>
                <div className="h-20 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-800">Speaking Test 1 Complete</div>
                    <div className="text-sm text-emerald-600">AI Audio analysis finished in 2.4s</div>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">Review Mistakes</button>
                </div>
             </div>
             <div className="hidden md:flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm h-full">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 36 36" className="w-full h-full text-emerald-500 drop-shadow-md">
                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-emerald-500" strokeDasharray="80, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-black text-slate-800">80%</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">GSE Scale</span>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Everything you need to succeed</h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
            Traditional coaching centers charge $500+. We built the exact same AI evaluation infrastructure for a fraction of the price.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "20 Full Mock Exams", desc: "Never run out of practice material. We generated 1260+ unique questions mirroring the exact real exam difficulty.", icon: <FaGlobe className="w-8 h-8"/>, color: "text-blue-500", bg: "bg-blue-50" },
            { title: "Offline Voice AI", desc: "Our proprietary algorithm analyzes your speech offline, ensuring 100% privacy and zero latency during your test.", icon: <FaMicrophoneAlt className="w-8 h-8"/>, color: "text-emerald-500", bg: "bg-emerald-50" },
            { title: "Radar Analytics", desc: "Identify whether your grammar, fluency, pronunciation, or vocabulary is dragging your score down.", icon: <FaChartPie className="w-8 h-8"/>, color: "text-purple-500", bg: "bg-purple-50" },
          ].map((feat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
              <div className={`w-16 h-16 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center mb-6`}>
                {feat.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{feat.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="w-full bg-slate-900 text-white py-24 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Don't just take our word for it</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Rahul Sharma", score: "68 -> 76", review: "I failed my corporate Versant round twice. After practicing 10 mock tests here, I finally cleared it and got the job. The AI feedback on sentence tracking is insanely accurate." },
              { name: "Jessica T.", score: "54 -> 65", review: "The audio visualizer helped me realize I was pausing too much during the Story Retelling section. The UI is exactly like the real exam." },
              { name: "Ahmed K.", score: "72 -> 79", review: "Worth every penny. The radar charts pinpointed my vocabulary weakness. The instant grading saves days of waiting for a human tutor." }
            ].map((test, idx) => (
              <div key={idx} className="bg-slate-800/80 backdrop-blur border border-slate-700 p-8 rounded-3xl relative">
                <div className="flex text-yellow-500 mb-6 text-xl"><FaStar/><FaStar/><FaStar/><FaStar/><FaStar/></div>
                <p className="text-slate-300 mb-8 italic text-lg leading-relaxed">"{test.review}"</p>
                <div className="flex justify-between items-center border-t border-slate-700 pt-6">
                  <div>
                    <div className="font-bold text-white mb-1">{test.name}</div>
                    <div className="text-emerald-400 text-sm font-mono bg-emerald-900/40 px-3 py-1 rounded-full inline-block">Score: {test.score}</div>
                  </div>
                  <FaCheckCircle className="text-emerald-500 text-3xl opacity-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full px-6 py-24 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Ready to secure your future?</h2>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">Sign up now and get your very first full-length Mock Test completely free. No credit card required.</p>
        <button 
          onClick={() => navigate('/signup')} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-6 rounded-full font-extrabold text-2xl shadow-2xl transition-all transform hover:scale-105"
        >
          Create Free Account
        </button>
        <div className="mt-6 text-slate-500 text-sm">Takes 30 seconds. Instant Access.</div>
      </section>

      <Footer />
    </div>
  );
}