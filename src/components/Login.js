import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      // Dynamically import to avoid unused var warning if not used elsewhere yet
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, resetEmail);
      alert('Password reset email sent! Check your inbox.');
      setShowResetModal(false);
      setResetEmail('');
    } catch (error) {
      alert('Error sending reset email: ' + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if Firestore user doc exists
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, {
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-green-50 rounded-xl shadow-md relative">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Login</h2>

      {!showResetModal ? (
        <>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full mb-4 p-2 border rounded"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full mb-2 p-2 border rounded"
              required
            />

            <div className="text-right mb-4">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-sm text-green-700 hover:text-green-900 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
              Login
            </button>
          </form>

          <div className="my-6 text-center">
            <p className="text-sm text-gray-600 mb-2">or</p>
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center border border-green-600 bg-white text-green-800 font-medium p-2 rounded hover:bg-green-100 transition"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google logo"
                className="h-5 w-5 mr-2"
              />
              Continue with Google
            </button>
          </div>

          <p className="mt-4 text-sm">
            Don't have an account?{' '}
            <span
              className="text-green-700 cursor-pointer"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </span>
          </p>
        </>
      ) : (
        <div className="animate-in fade-in zoom-in duration-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Reset Password</h3>
          <p className="text-sm text-gray-600 mb-4">Enter your email address to receive a password reset link.</p>
          <form onSubmit={handlePasswordReset}>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full mb-4 p-2 border rounded"
              required
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Send Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;
