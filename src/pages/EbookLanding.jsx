import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { auth } from '../firebaseConfig';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaCheckCircle, FaStar, FaArrowRight } from 'react-icons/fa';

export default function EbookLanding() {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

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

    // Purchase Trigger
    const handleBuyNowClick = () => {
        if (user) {
            // Already logged in - checkout immediately
            initiateCheckout(user.email, user.uid);
        } else {
            // Guest checkout - launch Razorpay directly
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
                    email: (checkoutEmail && checkoutEmail !== 'unknown_email') ? checkoutEmail : '',
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
                            // Track purchase in analytics if tracking is set up
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

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500/30 overflow-auto">
            <Helmet>
                <title>Versant Test Mastery Ebook | Score 68+ with 20 Practice Sets</title>
                <meta name="description" content="Download the ultimate study guide to crack the Versant English Test: Versant Test Mastery- A Complete Guide with 20 practice Sets." />
            </Helmet>

            <Header />

            {/* Ebook Details / Hero Section */}
            <main className="relative py-20 px-6 max-w-7xl mx-auto z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left: Text & Features (7 cols) */}
                    <div className="lg:col-span-7 space-y-8 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-900/50 border border-teal-500/30 rounded-full text-teal-300 text-xs font-bold uppercase tracking-wider">
                            🚀 Boost Your Score Immediately
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                            Versant Test Mastery <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-indigo-300 text-3xl md:text-4xl block mt-2 font-extrabold">
                                A Complete Guide with 20 practice Sets
                            </span>
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed font-light">
                            Top MNCs like Amazon, Deloitte, and Genpact reject 70% of candidates due to Versant voice evaluation failures. This ebook contains the exact templates, sentence structures, and secret pronunciation correction techniques our students use to score 65+ in just 7 days.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Secret Speaking templates for Story Retelling & Sentence Builds.",
                                "Grammar & vocabulary sheets mirroring the exact 2026 test templates.",
                                "Acoustic adjustment guidelines to ensure the AI microphone scores you correctly.",
                                "Perfect score model responses for all 20 Mock Test questions."
                            ].map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <FaCheckCircle className="text-teal-400 text-xl mt-1 flex-shrink-0" />
                                    <span className="text-slate-200 font-medium text-base">{feat}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                            <button
                                onClick={handleBuyNowClick}
                                disabled={isProcessing}
                                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-900 font-black rounded-2xl shadow-xl shadow-teal-500/20 hover:from-teal-400 hover:to-emerald-300 hover:scale-[1.02] hover:shadow-teal-400/40 transition-all active:scale-95 text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isProcessing ? "Launching Gateway..." : "Download Ebook Now"} 
                                <FaArrowRight />
                            </button>
                            <div className="text-left">
                                <div className="text-slate-400 text-xs line-through">Regular Price ₹499</div>
                                <div className="text-2xl font-black text-white">₹199 <span className="text-xs text-teal-300 font-bold uppercase tracking-wider">One-time</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Premium Ebook Cover Image (5 cols) */}
                    <div className="lg:col-span-5 flex justify-center relative">
                        <div className="absolute inset-0 bg-teal-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
                        <img 
                            src="/images/versant_ebook_cover.jpg" 
                            alt="Versant Test Mastery Ebook Cover" 
                            className="w-80 h-auto rounded-3xl shadow-2xl border border-slate-700 hover:scale-[1.02] transition-transform duration-300 relative z-10 select-none"
                        />
                    </div>
                </div>

                {/* What's Inside Section */}
                <div className="mt-28 border-t border-slate-800 pt-16">
                    <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-4">What's Inside the Guide?</h2>
                    <p className="text-slate-400 text-center max-w-xl mx-auto mb-16 text-sm sm:text-base">Get complete blueprints to hack the evaluation algorithm and ace your interview.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Story Retelling Templates", desc: "The exact grammatical frameworks to structure your response, ensuring maximum points for fluency even if you miss details.", icon: "📝" },
                            { title: "AI Mic Scoring Optimization", desc: "Secrets on pitch modulation, volume adjustment, and mic placement to prevent the AI grading software from penalizing your audio.", icon: "🎙️" },
                            { title: "20 Mock Test Answer Key", desc: "Sample 80-GSE responses for all Speaking, Listening, Reading, and Writing sections in our mock tests.", icon: "💡" },
                            { title: "MNC Screening Cheat Sheets", desc: "Direct lists of high-frequency words, phrases, and structures preferred by screening systems at Amazon, Deloitte, and Cognizant.", icon: "🏢" }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-slate-800/40 border border-slate-700/40 p-6 rounded-3xl text-left hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">{item.icon}</div>
                                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-slate-400 text-sm font-light leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-28 border-t border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-center text-white mb-12">Successful Candidates Say It Best</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: "Harish M.", score: "Rejected previously, scored 71 after guide", review: "The template for Story Retelling inside this PDF is absolute gold. I was using too many filler words. Once I followed the guide, I cleared Amazon's interview easily." },
                            { name: "Pooja Hegde", score: "Scored 69 on Deloitte Cutoff", review: "Acoustic guide changed everything. It explained where to place the mic and how to modulate voice. Highly recommended if you fail the audio scoring." },
                            { name: "Vikram Sen", score: "Cleared mock tests in 4 days", review: "Very straightforward guide without fluff. Sample responses for all sentence builds helped me score 75. Saved me a lot of stress!" }
                        ].map((rev, idx) => (
                            <div key={idx} className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-8 rounded-3xl text-left">
                                <div className="flex text-yellow-400 mb-4"><FaStar/><FaStar/><FaStar/><FaStar/><FaStar/></div>
                                <p className="text-slate-300 italic mb-6">"{rev.review}"</p>
                                <div className="font-bold text-white text-sm">{rev.name}</div>
                                <div className="text-xs text-teal-400 font-mono mt-1">{rev.score}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQs Section */}
                <div className="mt-28 border-t border-slate-800 pt-16 pb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-4">Frequently Asked Questions</h2>
                    <p className="text-slate-400 text-center max-w-xl mx-auto mb-16 text-sm">Everything you need to know about the Versant Test Mastery Guide.</p>
                    
                    <div className="max-w-3xl mx-auto space-y-4 text-left">
                        {[
                            { q: "How will I receive the ebook?", a: "Immediately after your payment is verified, you will return to the Thank You page where you will get a secure direct 'Download Ebook' button. You can also set a password on that page to save it to your user dashboard forever." },
                            { q: "Do I get updates when the 2026 pattern changes?", a: "Yes! All future editions and vocabulary updates of this guide are completely free. You can re-download the latest version from your dashboard at any time." },
                            { q: "Will this guide help me clear Amazon or Deloitte cutoffs?", a: "Absolutely. The templates and speaking guidelines are designed specifically to target corporate screening parameters, which help candidates clear automated voice screening cutoffs." },
                            { q: "Can I read this ebook on my mobile phone?", a: "Yes. The PDF is fully responsive and beautifully formatted for mobiles, tablets, laptops, and Kindle readers." }
                        ].map((faq, idx) => (
                            <FAQItem key={idx} question={faq.q} answer={faq.a} />
                        ))}
                    </div>
                </div>
            </main>

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"></div>
            </div>

            <Footer />
        </div>
    );
}

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 flex justify-between items-center text-left text-white font-bold text-base hover:bg-slate-800/70 transition-colors focus:outline-none"
            >
                <span>{question}</span>
                <span className={`text-xl transition-transform duration-300 ${isOpen ? 'rotate-180 text-teal-400' : 'text-slate-400'}`}>
                    {isOpen ? '−' : '+'}
                </span>
            </button>
            <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-48 border-t border-slate-700/50 p-6 bg-slate-900/30' : 'max-h-0'}`}>
                <p className="text-slate-400 text-sm font-light leading-relaxed">{answer}</p>
            </div>
        </div>
    );
}
