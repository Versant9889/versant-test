import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { app } from '../firebaseConfig';

const auth = getAuth(app);

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

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-green-50 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full mb-4 p-2 border rounded" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full mb-4 p-2 border rounded" required />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Login</button>
      </form>
      <p className="mt-4 text-sm">Don't have an account? <span className="text-green-700 cursor-pointer" onClick={() => navigate('/signup')}>Sign Up</span></p>
    </div>
  );
}

export default Login;
