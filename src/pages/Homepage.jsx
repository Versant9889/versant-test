import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebaseConfig';
import Header from '../components/Header'; // Restored Header

export default function VersantHomepage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName,
          hasPaid: false,
          createdAt: new Date(),
          role: 'user'
        });
      }
      navigate('/dashboard');
    } catch (error) {
      setError('Google Sign-In failed. Please try again.');
    }
  };

  return (
    <div className="h-full w-full min-h-screen overflow-auto gradient-bg text-white font-sans">
      <Helmet>
        <title>Versant Practice Test | Master English Communication</title>
        <meta name="description" content="Ace your Versant exam with our realistic practice tests and instant AI feedback." />
      </Helmet>

      {/* Restored Header Component */}
      <Header />

      {/* Hero Section */}
      <section className="w-full px-6 py-12 md:py-16 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-emerald-100 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span> 98% Pass Rate
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Master Your English, <br className="hidden lg:block" /> Ace the Versant Test
            </h1>
            <p className="text-lg md:text-xl text-emerald-100/90 mb-8 max-w-xl mx-auto lg:mx-0">
              Get instant AI scoring, realistic mock tests, and detailed feedback to improve your pronunciation, fluency, and confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button onClick={() => navigate('/signup')} className="btn-primary px-8 py-4 text-white font-semibold rounded-full text-lg shadow-2xl">
                Start Free Practice
              </button>
              <button onClick={() => navigate('/about')} className="px-8 py-4 bg-white/10 text-white font-semibold rounded-full text-lg hover:bg-white/20 transition-all border border-white/20">
                How it Works
              </button>
            </div>
          </div>

          {/* Login Form */}
          <div className="flex-1 relative w-full max-w-md mx-auto">
            <div className="relative floating">
              <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-2xl"></div>
              <div className="glass-card rounded-3xl p-8 relative shadow-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-emerald-900">Student Login</h2>
                  <p className="text-emerald-600 text-sm">Continue your preparation</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  {error && <div className="text-red-600 text-sm text-center bg-red-100 py-2 rounded-lg border border-red-200">{error}</div>}

                  <div>
                    <label className="block text-sm font-semibold text-emerald-800 mb-1.5 ml-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-emerald-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-emerald-800 mb-1.5 ml-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-emerald-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-2 transition-all shadow-lg hover:shadow-emerald-500/30 transform active:scale-95"
                  >
                    Start Practicing
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-white text-gray-500 rounded px-2">Or continue with</span></div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <img src="https://developers.google.com/identity/images/g-logo.png" alt="G" className="w-5 h-5 rounded-full bg-white p-0.5" />
                  <span>Google</span>
                </button>

                <div className="mt-6 text-center text-sm text-gray-600">
                  New here? <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold underline decoration-emerald-200 underline-offset-2">Create Free Account</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="w-full px-6 py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-800/40 backdrop-blur-md border border-emerald-500/30 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-white shadow-inner border border-emerald-400/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-emerald-100 text-sm font-medium">Pass Rate</div>
            </div>
          </div>

          <div className="bg-emerald-800/40 backdrop-blur-md border border-emerald-500/30 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-white shadow-inner border border-emerald-400/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Instant</div>
              <div className="text-emerald-100 text-sm font-medium">AI Feedback</div>
            </div>
          </div>

          <div className="bg-emerald-800/40 backdrop-blur-md border border-emerald-500/30 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-white shadow-inner border border-emerald-400/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">100+</div>
              <div className="text-emerald-100 text-sm font-medium">Mock Tests</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Practice with VersantPro?</h2>
          <p className="text-emerald-100/80 text-lg max-w-2xl mx-auto">
            Our platform is designed specifically to help you score higher in the Versant English Test.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Real Exam Simulation", desc: "Experience the exact format and timing of the real Versant test.", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "emerald" },
            { title: "AI Pronunciation Scoring", desc: "Get instant feedback on your fluency, pronunciation, and intonation.", icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z", color: "teal" },
            { title: "Detailed Analytics", desc: "Track your progress and identify weak areas to focus on.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "green" },
            { title: "Vocabulary Building", desc: "Enhance your vocabulary with targeted exercises.", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "emerald" },
            { title: "Listening Practice", desc: "Sharpen your listening skills with varied accents and speeds.", icon: "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z", color: "teal" },
            { title: "Mobile Friendly", desc: "Practice anytime, anywhere on your phone or tablet.", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z", color: "green" },
          ].map((feature, idx) => (
            <div key={idx} className="feature-card rounded-2xl p-6 hover:bg-white/15 transition-all group cursor-default">
              <div className={`w-14 h-14 bg-${feature.color}-400/20 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <svg className={`w-7 h-7 text-${feature.color}-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-emerald-100/70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/50 text-sm mb-4">© {new Date().getFullYear()} Versant Practice Test. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <Link to="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/contact" className="text-white/70 hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}