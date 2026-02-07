import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // 1. Sign in normally
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Strict Check: Is this the admin?
            if (user.email !== 'admin@versantapp.com') {
                await signOut(auth); // Immediately kick them out
                setError('Access Denied: You are not an administrator.');
                return;
            }

            // 3. Success -> Go to Dashboard
            navigate('/admin/dashboard');

        } catch (err) {
            console.error("Admin Login Error:", err);
            setError('Invalid Credentials. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-slate-400">Secure access for VersantPro administrators only.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            placeholder="admin@versantapp.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
                    >
                        Access Dashboard
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                        ← Back to Homepage
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
