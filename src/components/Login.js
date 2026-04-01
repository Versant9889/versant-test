import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FaGoogle, FaEnvelope, FaLock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      setErrorMsg(error.message.replace('Firebase: ', ''));
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccessMsg('Password reset link sent! Please check your inbox.');
      setTimeout(() => setShowResetModal(false), 3000);
    } catch (error) {
      setErrorMsg(error.message.replace('Firebase: ', ''));
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if Firestore user doc exists
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          hasPaid: false,
        });
      }

      navigate('/dashboard');
    } catch (error) {
      setErrorMsg('Google Sign-In Failed: ' + error.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row border border-gray-100 relative z-10">
        
        {/* Left Side: Marketing/Branding (Hidden on mobile) */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          
          <div className="relative z-10">
             <Link to="/" className="flex items-center space-x-3 mb-10 hover:opacity-80 transition-opacity w-max">
               <div className="w-10 h-10 bg-white text-emerald-600 rounded-full flex items-center justify-center font-black text-xl shadow-lg">V</div>
               <span className="text-2xl font-black tracking-tight">VersantPro</span>
             </Link>
             
             <h2 className="text-4xl font-black mb-6 leading-tight">Welcome back to your dashboard.</h2>
             <p className="text-emerald-100 text-lg mb-8 font-medium">Continue your preparation and track your AI fluency scores.</p>
             
             <ul className="space-y-4">
                <li className="flex items-center gap-3 font-medium"><FaCheckCircle className="text-emerald-300 text-xl" /> Access your test history</li>
                <li className="flex items-center gap-3 font-medium"><FaCheckCircle className="text-emerald-300 text-xl" /> Review detailed analytics</li>
             </ul>
          </div>
          
          <div className="relative z-10 text-sm font-medium text-emerald-200">
             © {new Date().getFullYear()} VersantPro Simulator
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            
            {errorMsg && (
              <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3 text-sm font-medium">
                <FaExclamationCircle className="mt-0.5 flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="mb-6 bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 flex items-start gap-3 text-sm font-medium">
                <FaCheckCircle className="mt-0.5 flex-shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            {!showResetModal ? (
              <>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Sign in</h2>
                <p className="text-gray-500 mb-8 font-medium">Welcome back! Please enter your details.</p>

                {/* Google Login */}
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 mb-6"
                >
                  <FaGoogle className="text-red-500 text-xl" />
                  Sign in with Google
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Or with email</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <FaEnvelope />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-gray-900"
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <FaLock />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-gray-900"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="text-sm text-emerald-600 hover:text-emerald-800 font-bold hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-gray-900/30 transition-all active:scale-95 text-lg">
                    Sign In
                  </button>
                </form>

                <p className="mt-8 text-center text-gray-600 font-medium">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
                    Sign Up
                  </Link>
                </p>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <button 
                  onClick={() => setShowResetModal(false)}
                  className="mb-6 text-sm text-gray-500 hover:text-gray-900 font-bold flex items-center gap-1"
                >
                  &larr; Back to login
                </button>
                
                <h2 className="text-3xl font-black text-gray-900 mb-2">Reset Password</h2>
                <p className="text-gray-500 mb-8 font-medium">Enter your email address and we'll send you a link to reset your password.</p>

                <form onSubmit={handlePasswordReset} className="space-y-5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <FaEnvelope />
                    </div>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-gray-900"
                      required
                    />
                  </div>

                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all active:scale-95 text-lg">
                    Send Reset Link
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
