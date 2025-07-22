import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-green-50 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Login</h2>

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
          className="w-full mb-4 p-2 border rounded"
          required
        />
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
    </div>
  );
}

export default Login;
