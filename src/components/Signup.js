import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { app, db, googleProvider } from '../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle, FaEnvelope, FaLock, FaPhone, FaCheckCircle } from 'react-icons/fa';

const auth = getAuth(app);

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        mobileNumber: mobileNumber,
        hasPaid: false,
      });
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if Firestore user doc exists, otherwise create it
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
      console.error('Google Sign-In Error:', error.message);
      alert('Google Sign-In Failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row border border-gray-100 relative z-10">
        
        {/* Left Side: Marketing/Branding (Hidden on mobile) */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10">
             <Link to="/" className="flex items-center space-x-3 mb-10 hover:opacity-80 transition-opacity w-max">
               <div className="w-10 h-10 bg-white text-emerald-600 rounded-full flex items-center justify-center font-black text-xl shadow-lg">V</div>
               <span className="text-2xl font-black tracking-tight">VersantPro</span>
             </Link>
             
             <h2 className="text-4xl font-black mb-6 leading-tight">Your gateway to global opportunities.</h2>
             <p className="text-emerald-100 text-lg mb-8 font-medium">Join thousands of professionals scoring 65+ on their English Fluency exams using our AI Simulator.</p>
             
             <ul className="space-y-4">
                <li className="flex items-center gap-3 font-medium"><FaCheckCircle className="text-emerald-300 text-xl" /> Realistic Human-Level AI Grading</li>
                <li className="flex items-center gap-3 font-medium"><FaCheckCircle className="text-emerald-300 text-xl" /> Detailed Fluency Analytics</li>
                <li className="flex items-center gap-3 font-medium"><FaCheckCircle className="text-emerald-300 text-xl" /> Instantly Unlock Test 1 Free</li>
             </ul>
          </div>
          
          <div className="relative z-10 text-sm font-medium text-emerald-200">
             © {new Date().getFullYear()} VersantPro Simulator
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Create an account</h2>
            <p className="text-gray-500 mb-8 font-medium">Start your free mock test journey today.</p>

            {/* Google Signup */}
            <button 
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 mb-6"
            >
              <FaGoogle className="text-red-500 text-xl" />
              Sign up with Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Or with email</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FaPhone />
                </div>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Mobile Number"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-gray-900"
                  pattern="[0-9]{10}"
                  title="Mobile number should be 10 digits"
                  required
                />
              </div>

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
                  placeholder="Password (min 6 chars)"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-gray-900"
                  minLength="6"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-gray-900/30 transition-all active:scale-95 text-lg">
                Create Account
              </button>
            </form>

            <p className="mt-8 text-center text-gray-600 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;