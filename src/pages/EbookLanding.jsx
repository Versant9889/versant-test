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
    const [activePreviewTab, setActivePreviewTab] = useState(0);

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

    return (
        <div className="min-h-screen bg-gray-50 bg-gradient-to-tr from-emerald-50/20 via-gray-50 to-teal-50/20 text-gray-800 font-sans selection:bg-emerald-500/30 overflow-auto">
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
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold uppercase tracking-wider">
                            🚀 Boost Your Score Immediately
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight">
                            Versant Test Mastery <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-650 to-indigo-600 text-3xl md:text-4xl block mt-2 font-extrabold">
                                A Complete Guide with 20 practice Sets
                            </span>
                        </h1>
                        <p className="text-lg text-gray-650 leading-relaxed font-light">
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
                                    <FaCheckCircle className="text-emerald-500 text-xl mt-1 flex-shrink-0" />
                                    <span className="text-gray-700 font-semibold text-base">{feat}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                            <button
                                onClick={handleBuyNowClick}
                                disabled={isProcessing}
                                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 hover:scale-[1.02] hover:shadow-emerald-400/40 transition-all active:scale-95 text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isProcessing ? "Launching Gateway..." : "Download Ebook Now"} 
                                <FaArrowRight />
                            </button>
                            <div className="text-left">
                                <div className="text-gray-400 text-xs line-through">Regular Price ₹499</div>
                                <div className="text-2xl font-black text-gray-900">₹199 <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">One-time</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Premium Ebook Cover Image (5 cols) */}
                    <div className="lg:col-span-5 flex justify-center relative">
                        <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>
                        <img 
                            src="/images/versant_ebook_cover.jpg" 
                            alt="Versant Test Mastery Ebook Cover" 
                            className="w-80 h-auto rounded-3xl shadow-2xl border border-gray-200 hover:scale-[1.02] transition-transform duration-300 relative z-10 select-none"
                        />
                    </div>
                </div>

                {/* What's Inside Section */}
                <div className="mt-28 border-t border-gray-200/80 pt-16">
                    <h2 className="text-3xl md:text-5xl font-black text-center text-gray-900 mb-4">What's Inside the Guide?</h2>
                    <p className="text-gray-500 text-center max-w-xl mx-auto mb-16 text-sm sm:text-base">Get complete blueprints to hack the evaluation algorithm and ace your interview.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Story Retelling Templates", desc: "The exact grammatical frameworks to structure your response, ensuring maximum points for fluency even if you miss details.", icon: "📝" },
                            { title: "AI Mic Scoring Optimization", desc: "Secrets on pitch modulation, volume adjustment, and mic placement to prevent the AI grading software from penalizing your audio.", icon: "🎙️" },
                            { title: "20 Mock Test Answer Key", desc: "Sample 80-GSE responses for all Speaking, Listening, Reading, and Writing sections in our mock tests.", icon: "💡" },
                            { title: "MNC Screening Cheat Sheets", desc: "Direct lists of high-frequency words, phrases, and structures preferred by screening systems at Amazon, Deloitte, and Cognizant.", icon: "🏢" }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 p-6 rounded-3xl text-left hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-lg group flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">{item.icon}</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm font-light leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ebook Previewer / Sneak Peek Section */}
                <div className="mt-28 border-t border-gray-200/80 pt-16">
                    <h2 className="text-3xl md:text-5xl font-black text-center text-gray-900 mb-4">Sneak Peek: Inside the Ebook</h2>
                    <p className="text-gray-500 text-center max-w-xl mx-auto mb-10 text-sm sm:text-base">
                        Get a glimpse of the actual content, strategies, and templates that will help you clear the test. Click on the tabs below to read sample pages.
                    </p>

                    <div className="max-w-4xl mx-auto bg-white border border-gray-150 rounded-3xl p-6 sm:p-10 shadow-xl relative">
                        {/* Tab buttons */}
                        <div className="flex flex-wrap gap-2 justify-center mb-8 border-b border-gray-200/80 pb-6">
                            {[
                                { label: "📄 Page 12: Story Retelling Hack", id: 0 },
                                { label: "🎙️ Page 27: Voice Calibration Guide", id: 1 },
                                { label: "💡 Page 45: High-Score Model Response", id: 2 }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActivePreviewTab(tab.id)}
                                    className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                                        activePreviewTab === tab.id
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                            : 'bg-gray-100 text-gray-600 border border-gray-250 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Page mockup container */}
                        <div className="bg-gray-55 border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-inner relative overflow-hidden text-left min-h-[400px] flex flex-col justify-between">
                            {/* Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 text-gray-300/40 text-4xl sm:text-6xl font-black select-none pointer-events-none tracking-widest z-0 uppercase">
                                Versant Mastery Preview
                            </div>

                            <div className="relative z-10 space-y-6">
                                {activePreviewTab === 0 && (
                                    <>
                                        <div className="flex justify-between items-center text-xs text-emerald-700 font-mono tracking-wider border-b border-gray-200 pb-3">
                                            <span>CHAPTER 2: STORY RETELLING</span>
                                            <span>PAGE 12</span>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900">Rule #3: The AI Fluency Template</h3>
                                        <p className="text-gray-700 text-sm leading-relaxed font-light">
                                            The AI voice grading system measures <strong className="text-emerald-600">speech rate, pause counts, and rhythm</strong>. It does not grade the accuracy of your memory, but how naturally you speak. Use the exact structure below:
                                        </p>
                                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-emerald-400 space-y-3 shadow-inner">
                                            <p className="border-l-2 border-emerald-500 pl-3">
                                                "The speaker discussed <span className="text-slate-450">[Main Topic/Character]</span>. 
                                                First, they pointed out that <span className="text-slate-450">[Key Detail 1]</span>."
                                            </p>
                                            <p className="border-l-2 border-emerald-500 pl-3">
                                                "Next, they emphasized that <span className="text-slate-450">[Key Detail 2]</span>. 
                                                Additionally, it was stated that <span className="text-slate-450">[Key Detail 3]</span>."
                                            </p>
                                            <p className="border-l-2 border-emerald-500 pl-3">
                                                "In addition, they highlighted the importance of <span className="text-slate-450">[Key Detail 4]</span>. 
                                                Overall, the speech was about <span className="text-slate-450">[Concluding thought]</span>."
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 italic">
                                            💡 <strong className="text-gray-700">Insider Tip:</strong> If you forget details, insert generic synonyms relating to the topic rather than pausing or saying "Umm". The AI system counts hesitation as a major deduction!
                                        </p>
                                    </>
                                )}

                                {activePreviewTab === 1 && (
                                    <>
                                        <div className="flex justify-between items-center text-xs text-emerald-700 font-mono tracking-wider border-b border-gray-200 pb-3">
                                            <span>CHAPTER 4: ACOUSTIC CALIBRATION</span>
                                            <span>PAGE 27</span>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900">Secret #7: AI Audio Frequency Tuning</h3>
                                        <p className="text-gray-700 text-sm leading-relaxed font-light">
                                            Many test-takers score poorly not because of bad English, but due to bad <strong className="text-emerald-600">acoustic signals</strong>. The voice evaluation software uses voice spectrum analysis to decode phonemes.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-slate-905 border border-gray-200 rounded-xl p-4 text-xs space-y-2">
                                                <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px]">🎙️ Microphone Placement</span>
                                                <p className="text-gray-705">
                                                    Do not place the microphone directly in front of your mouth. Heavy breath pops (plosives like 'P' and 'B') distort the frequency curves. Keep the microphone <strong>two fingers away</strong> from your chin or nose level.
                                                </p>
                                            </div>
                                            <div className="bg-slate-905 border border-gray-200 rounded-xl p-4 text-xs space-y-2">
                                                <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px]">🗣️ Pitch & Frequency</span>
                                                <p className="text-gray-705">
                                                    Keep your voice pitch flat and stable. High variance in tone makes the AI confuse your voice with background noise. Maintain a stable frequency range of <strong>110Hz to 160Hz</strong>.
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 italic">
                                            💡 <strong className="text-gray-700">Insider Tip:</strong> Speak slowly but confidently. High speed causes slurred speech boundaries, which the scoring software registers as grammatical mistakes.
                                        </p>
                                    </>
                                )}

                                {activePreviewTab === 2 && (
                                    <>
                                        <div className="flex justify-between items-center text-xs text-emerald-700 font-mono tracking-wider border-b border-gray-200 pb-3">
                                            <span>CHAPTER 6: MODEL TEST KEY ANSWERS</span>
                                            <span>PAGE 45</span>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900">Mock Test Part F: Sentence Passages (Score 80 GSE)</h3>
                                        <p className="text-gray-700 text-sm leading-relaxed font-light">
                                            Below is a sample question from Practice Set 4 and the model high-scoring answer that satisfies all parameters for vocabulary, grammar, and voice flow.
                                        </p>
                                        <div className="space-y-3">
                                            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs space-y-1.5">
                                                <div className="text-slate-400 font-bold uppercase text-[9px]">Prompt Question / Sentence Build task:</div>
                                                <p className="text-slate-300 italic">"leaves / during / trees / deciduous / lose / winter / their"</p>
                                            </div>
                                            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs space-y-1.5">
                                                <div className="text-emerald-750 font-bold uppercase text-[9px] flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                    Correct Model Response (Score 80 GSE):
                                                </div>
                                                <p className="text-emerald-900 font-mono font-medium text-sm">"Deciduous trees lose their leaves during winter."</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 italic">
                                            💡 <strong className="text-gray-700">Insider Tip:</strong> For sentence builds, focus on immediate subject-verb agreement first. The scoring software tracks correct structural syntax first and semantic context second.
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="border-t border-gray-200 mt-6 pt-4 flex justify-between items-center text-xs text-gray-400">
                                <span>Versant Test Mastery Guide</span>
                                <span>Secure PDF Preview</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-28 border-t border-gray-200/80 pt-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Successful Candidates Say It Best</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: "Harish M.", score: "Rejected previously, scored 71 after guide", review: "The template for Story Retelling inside this PDF is absolute gold. I was using too many filler words. Once I followed the guide, I cleared Amazon's interview easily." },
                            { name: "Pooja Hegde", score: "Scored 69 on Deloitte Cutoff", review: "Acoustic guide changed everything. It explained where to place the mic and how to modulate voice. Highly recommended if you fail the audio scoring." },
                            { name: "Vikram Sen", score: "Cleared mock tests in 4 days", review: "Very straightforward guide without fluff. Sample responses for all sentence builds helped me score 75. Saved me a lot of stress!" }
                        ].map((rev, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 p-8 rounded-3xl text-left shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex text-yellow-400 mb-4"><FaStar/><FaStar/><FaStar/><FaStar/><FaStar/></div>
                                <p className="text-gray-650 italic mb-6">"{rev.review}"</p>
                                <div className="font-bold text-gray-900 text-sm">{rev.name}</div>
                                <div className="text-xs text-emerald-600 font-mono mt-1">{rev.score}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEO Keyword Prep Hub Section */}
                <div className="mt-28 border-t border-gray-200/80 pt-16">
                    <h2 className="text-3xl md:text-5xl font-black text-center text-gray-900 mb-4">Complete Preparation Resources</h2>
                    <p className="text-gray-500 text-center max-w-xl mx-auto mb-16 text-sm sm:text-base">
                        Get all the essential tools and knowledge to master your corporate English screenings.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-emerald-600">🏢</span> Amazon Versant Test Prep
                            </h3>
                            <p className="text-gray-600 text-sm font-light leading-relaxed">
                                Amazon uses the Versant test to screen customer support, operations, and technical roles. Our eBook covers the exact templates and keywords needed to satisfy Amazon's strict automated hiring algorithms, helping you clear the initial HR round safely.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-emerald-600">💎</span> Deloitte Voice Screening hacks
                            </h3>
                            <p className="text-gray-600 text-sm font-light leading-relaxed">
                                Deloitte Consulting screenings demand high scores in grammar, fluency, and pronunciation. The guide offers exact phonetic correction tips and pitch parameters required to score above their standard corporate recruitment cutoff thresholds.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-emerald-600">🤖</span> Voice AI Scoring Algorithms
                            </h3>
                            <p className="text-gray-600 text-sm font-light leading-relaxed">
                                Learn how Pearson's automated evaluation engines process voice patterns. We explain the science of voice spectrographs, plosives, and how to calibrate your pronunciation flow to ensure the AI grades your responses accurately.
                            </p>
                        </div>
                    </div>
                </div>

                {/* FAQs Section */}
                <div className="mt-28 border-t border-gray-200/80 pt-16 pb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-center text-gray-900 mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-500 text-center max-w-xl mx-auto mb-16 text-sm">Everything you need to know about the Versant Test Mastery Guide.</p>
                    
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
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-200/10 blur-[120px] rounded-full"></div>
            </div>

            <Footer />
        </div>
    );
}

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 flex justify-between items-center text-left text-gray-900 font-bold text-base hover:bg-gray-50 transition-colors focus:outline-none"
            >
                <span>{question}</span>
                <span className={`text-xl transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-600' : 'text-gray-400'}`}>
                    {isOpen ? '−' : '+'}
                </span>
            </button>
            <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-48 border-t border-gray-100 p-6 bg-gray-50/50' : 'max-h-0'}`}>
                <p className="text-gray-600 text-sm font-light leading-relaxed">{answer}</p>
            </div>
        </div>
    );
}
