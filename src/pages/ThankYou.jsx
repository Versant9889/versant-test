import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app, db } from '../firebaseConfig';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaCheckCircle, FaSpinner, FaDownload, FaArrowRight, FaLock } from 'react-icons/fa';
import { trackGA4Event } from '../utils/GA4Analytics';

const auth = getAuth(app);

export default function ThankYou() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [isGuest, setIsGuest] = useState(true);
    const [verifiedEmail, setVerifiedEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registering, setRegistering] = useState(false);
    const [registerMessage, setRegisterMessage] = useState(null);

    const paymentId = searchParams.get('payment_id');

    // 1. Verify Payment via Backend API
    useEffect(() => {
        if (!paymentId) {
            setPaymentError("Missing payment details.");
            return;
        }

        // Listen for user auth state
        const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setIsGuest(false);
            } else {
                setIsGuest(true);
            }
        });

        let pollCount = 0;
        const maxPolls = 10;
        let pollInterval;

        const checkStatus = async () => {
            try {
                const response = await fetch(`/.netlify/functions/checkPaymentStatus?payment_id=${paymentId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.verified) {
                        setPaymentVerified(true);
                        trackGA4Event('thank_you_page_view', { payment_id: paymentId, email: data.email || '' });
                        if (data.email) {
                            setVerifiedEmail(data.email);
                        }
                        clearInterval(pollInterval);
                    }
                }
            } catch (err) {
                console.error("Error polling payment status:", err);
            }

            pollCount++;
            if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                setPaymentVerified(prev => {
                    if (!prev) {
                        setPaymentError("Verification timed out. If money was deducted, please contact support at support@versantpro.com");
                    }
                    return prev;
                });
            }
        };

        // Run immediately
        checkStatus();

        // Start polling
        pollInterval = setInterval(checkStatus, 1500);

        return () => {
            unsubscribeAuth();
            clearInterval(pollInterval);
        };
    }, [paymentId]);

    // Trigger secure file download
    const handleDownload = () => {
        if (!paymentVerified) return;
        trackGA4Event('ebook_download', { payment_id: paymentId, email: verifiedEmail });
        window.location.href = `/.netlify/functions/downloadEbook?payment_id=${paymentId}&email=${encodeURIComponent(verifiedEmail)}`;
    };

    const handleStartMockTest = () => {
        const redirectToTest = searchParams.get('redirect_to_test');
        if (redirectToTest === 'speaking') {
            navigate('/versant-speaking-and-listening-practice-test/start/full', { state: { testId: 1 } });
        } else if (redirectToTest === 'reading') {
            navigate('/versant-reading-and-writing-mock-test/start', { state: { testId: 1 } });
        } else {
            navigate('/versant-speaking-and-listening-practice-test');
        }
    };

    // Guest Account Password Registration
    const handleRegisterPassword = async (e) => {
        e.preventDefault();
        if (!verifiedEmail || !password || password.length < 6) {
            setRegisterMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }

        setRegistering(true);
        setRegisterMessage(null);

        try {
            // 1. Register with Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, verifiedEmail, password);
            const user = userCredential.user;

            // 2. Initialize users/{uid} document with hasPurchasedEbook = true
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email.toLowerCase().trim(),
                hasPurchasedEbook: true,
                ebookPurchasedAt: new Date(),
                ebookTransactionId: paymentId,
                hasPaid: false
            });

            setRegisterMessage({ type: 'success', text: '✅ Account created! Redirecting to your dashboard...' });
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error) {
            console.error("Post-purchase registration failed:", error);
            setRegisterMessage({ type: 'error', text: error.message });
        } finally {
            setRegistering(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between selection:bg-teal-500/30 overflow-auto">
            <Helmet>
                <title>Payment Successful | Versant Pro Ebook</title>
                {/* Prevent search engines from indexing payment success pages */}
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <Header />

            <main className="flex-1 py-16 px-6 max-w-3xl mx-auto w-full flex flex-col justify-center items-center text-center relative z-10">
                <div className="absolute inset-0 bg-teal-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>

                <div className="w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    
                    {/* Status Icons */}
                    {!paymentVerified && !paymentError ? (
                        <div className="flex flex-col items-center mb-6">
                            <FaSpinner className="text-4xl text-teal-400 animate-spin mb-4" />
                            <h2 className="text-2xl font-bold text-white">Verifying Secure Payment...</h2>
                            <p className="text-slate-400 text-xs mt-2">Awaiting official Razorpay network confirmation...</p>
                        </div>
                    ) : paymentError && !paymentVerified ? (
                        <div className="flex flex-col items-center mb-6">
                            <span className="text-5xl mb-4">⚠️</span>
                            <h2 className="text-2xl font-bold text-rose-400">Verification Processing</h2>
                            <p className="text-slate-300 text-sm mt-3 max-w-md">{paymentError}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <FaCheckCircle className="text-5xl text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-bounce" />
                            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">🎉 Payment Successful</h1>
                            <p className="text-slate-300 text-base mb-8">Thank you for your purchase. Your ebook is now ready.</p>

                            <div className="w-full space-y-4 mb-8">
                                <button
                                    onClick={handleDownload}
                                    className="w-full py-4.5 bg-gradient-to-r from-teal-500 to-emerald-450 hover:from-teal-400 hover:to-emerald-350 text-slate-900 font-extrabold rounded-2xl shadow-xl shadow-teal-500/20 hover:shadow-teal-400/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 text-lg"
                                >
                                    <FaDownload /> Download eBook
                                </button>

                                <button
                                    onClick={handleStartMockTest}
                                    className="w-full py-4 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 text-base"
                                >
                                    Start Free Mock Test <FaArrowRight />
                                </button>

                                <button
                                    onClick={() => navigate(isGuest ? '/signup' : '/dashboard')}
                                    className="w-full py-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-300 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-base"
                                >
                                    Explore Unlimited Practice
                                </button>
                            </div>

                            {/* Guest Password Registration */}
                            {isGuest && (
                                <div className="w-full bg-slate-900/60 border border-slate-700/40 p-6 rounded-2xl text-left space-y-4">
                                    <div>
                                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                            <FaLock className="text-teal-400" /> Save Ebook to Dashboard
                                        </h3>
                                        <p className="text-slate-400 text-xs mt-1">Set a password for <span className="text-teal-300 font-semibold">{verifiedEmail || 'your email'}</span> so you can download this ebook again from your dashboard anytime.</p>
                                    </div>
                                    <form onSubmit={handleRegisterPassword} className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter Password (min 6 chars)"
                                            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 placeholder-slate-500"
                                            minLength="6"
                                        />
                                        <button
                                            type="submit"
                                            disabled={registering}
                                            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-sm rounded-xl transition-all disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {registering ? 'Creating...' : 'Set Password'}
                                        </button>
                                    </form>
                                    {registerMessage && (
                                        <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${registerMessage.type === 'success' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/20' : 'bg-rose-900/40 text-rose-300 border border-rose-500/20'}`}>
                                            {registerMessage.text}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
