import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { getAuth, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebaseConfig';
import Button from '../components/ui/button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/card';

import Header from '../components/Header';

export default function VersantHomepage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleTakeTest = () => {
    navigate('/login');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
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
      setError('Google Sign-In Failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Versant Practice Test | Ace Your Versant Exam</title>
        <meta name="description" content="Prepare for your Versant test with our interactive practice tests. Get instant feedback and improve your score. Start your free Versant practice test today!" />
      </Helmet>
      <Header />

      {/* Hero Section */}
      <main className="flex-grow bg-gradient-to-b from-green-50 to-white px-4 sm:px-6">
        <div className="container mx-auto py-12 md:py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 mb-8 lg:mb-0 lg:pr-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
                Take a Free Versant Practice Test and Assess Your English Skills
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-6 md:mb-8">
                The Versant English Test is a fast, accurate, and convenient way to test your English speaking, listening, reading, and writing skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white py-4 sm:py-5 text-base sm:text-lg"
                  onClick={handleTakeTest}
                >
                  Take the Test
                </Button>
                <Button 
                  variant="outline" 
                  className="border-green-600 text-green-600 hover:bg-green-50 py-4 sm:py-5 text-base sm:text-lg"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Login Card */}
            <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
              <Card className="w-full max-w-md mx-auto shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl text-center text-green-700">Sign In</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 py-2 text-white"
                    >
                      Sign In
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    {/* ✅ Updated Google Button */}
                    <Button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2"
                    >
                      <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google logo"
                        className="h-5 w-5 mr-2 bg-white rounded-full"
                      />
                      Sign in with Google
                    </Button>

                    <div className="text-center text-xs text-gray-600">
                      Don't have an account? <Link to="/signup" className="text-green-600 hover:underline">Sign up</Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-6 px-4">
        <div className="container mx-auto text-center text-sm">
          <p>© {new Date().getFullYear()} Versant Test. All rights reserved.</p>
          <div className="mt-2">
            <Link to="/terms" className="hover:text-green-200 mx-2">Terms and Conditions</Link>
            <Link to="/privacy" className="hover:text-green-200 mx-2">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}