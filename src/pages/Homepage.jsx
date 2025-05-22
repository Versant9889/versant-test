import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import Button from '../components/ui/button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function VersantHomepage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();

  const handleTakeTest = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-green-700 text-white px-4 py-3 shadow-md md:px-6 md:py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full"></div>
            <span className="text-lg md:text-xl font-bold">Versant Test</span>
          </div>
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            <Link to="/" className="hover:text-green-200 font-medium">Home</Link>
            <a href="#about" className="hover:text-green-200 font-medium">About</a>
            <a href="#contact" className="hover:text-green-200 font-medium">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow bg-gradient-to-b from-green-50 to-white px-4 sm:px-6">
        <div className="container mx-auto py-12 md:py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 mb-8 lg:mb-0 lg:pr-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
                Assess Your English Skills with <span className="text-green-600">Versant</span>
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
                      className="w-full bg-green-600 hover:bg-green-700 py-2"
                    >
                      Sign In
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
          © {new Date().getFullYear()} Versant Test. All rights reserved.
        </div>
      </footer>
    </div>
  );
}