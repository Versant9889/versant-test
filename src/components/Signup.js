import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { app, db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const auth = getAuth(app);

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState(''); // New state for mobile number
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Store mobile number in Firestore along with other user details
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        mobileNumber: mobileNumber, // Add mobile number to Firestore
        hasPaid: false,
      });
      alert('Signup successful!');
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-green-50 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="tel"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          placeholder="Mobile Number"
          className="w-full mb-4 p-2 border rounded"
          pattern="[0-9]{10}" // Basic validation for 10-digit mobile number
          title="Mobile number should be 10 digits"
          required
        />
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
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <span className="text-green-700 cursor-pointer" onClick={() => navigate('/')}>
          Login
        </span>
      </p>
    </div>
  );
}

export default Signup;