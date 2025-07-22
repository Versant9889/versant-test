// src/dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import PaymentModal from '../components/PaymentModal';

const Header = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert('Signed out successfully!');
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          <h1 className="text-2xl font-bold tracking-tight">English Mastery</h1>
        </div>
        <nav className="flex items-center space-x-6">
          <button onClick={() => navigate('/dashboard')} className="text-sm font-medium hover:text-green-500 transition-colors duration-200 transform hover:scale-105">
            Dashboard
          </button>
          <button onClick={() => navigate('/')} className="text-sm font-medium hover:text-green-500 transition-colors duration-200 transform hover:scale-105">
            Home
          </button>
          <button onClick={handleSignOut} className="flex items-center space-x-2 text-sm font-medium bg-green-700 px-4 py-2 rounded-full hover:bg-green-600 transition-all duration-200">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-green-900 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm">© 2025 English Mastery App. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          <a href="/privacy" className="text-sm hover:text-green-500 transition-colors duration-200">Privacy Policy</a>
          <a href="/terms" className="text-sm hover:text-green-500 transition-colors duration-200">Terms of Service</a>
          <a href="/contact" className="text-sm hover:text-green-500 transition-colors duration-200">Contact Us</a>
        </div>
      </div>
    </footer>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userTestAccess, setUserTestAccess] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
      } else {
        // Check user's test access status
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserTestAccess(userDoc.data().paidTests || false);
        } else {
          // Create user document if it doesn't exist
          await setDoc(userRef, { paidTests: false });
          setUserTestAccess(false);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const userTestStatus = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    name: `Test ${index + 1}`,
    paid: index < 3 ? true : userTestAccess, // First 3 tests are free
    attempted: false,
    description: `Test ${index + 1} challenges your English skills with exercises in typing, grammar, and comprehension, designed to enhance fluency and confidence at your level.`,
    level: index + 1 <= 3 ? 'Easy' : index + 1 <= 8 ? 'Moderate' : index + 1 <= 12 ? 'Hard' : 'Moderate',
  }));

  const handleStartTest = (test) => {
    if (!test.paid) {
      setShowPaymentModal(true);
      return;
    }
    if (test.attempted) {
      alert('You have already attempted this test.');
      return;
    }
    navigate('/test', { state: { testId: test.id } });
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setUserTestAccess(true);
    alert('Payment successful! You now have access to all premium tests.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-8 mb-10 text-center animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Welcome to Your Learning Journey
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto">
              Start with 3 free tests to assess your skills. Unlock 17 more premium tests to master English proficiency.
            </p>
          </div>
          {!userTestAccess && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Unlock Premium Tests</h2>
              <p className="text-gray-600 mb-4">Get access to 17 additional tests with advanced features and comprehensive assessments.</p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Upgrade Now - $49.99
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-center">
            {userTestStatus.map((test, index) => (
              <div
                key={test.id}
                className="bg-green-100 max-w-xs w-full rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-5 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-green-800">
                    {test.name}
                  </h2>
                  {test.attempted ? (
                    <span className="bg-green-200 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Completed</span>
                  ) : test.paid ? (
                    <span className="bg-green-200 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Ready</span>
                  ) : (
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Premium</span>
                  )}
                </div>
                <p className="text-green-800 text-xs mb-4 line-clamp-3">
                  {test.description}
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-green-800"><strong>Level:</strong> {test.level}</p>
                  <p className="text-xs text-green-800"><strong>Status:</strong> {test.paid ? 'Available' : 'Premium'}</p>
                  <p className="text-xs text-green-800"><strong>Attempted:</strong> {test.attempted ? 'Yes' : 'No'}</p>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div />
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <button
                  onClick={() => handleStartTest(test)}
                  className={`w-full py-2 rounded-lg text-xs font-medium text-white transition-all duration-200 ${
                    test.paid && !test.attempted
                      ? 'bg-green-600 hover:bg-green-700'
                      : !test.paid
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                  aria-label={`${test.paid ? 'Start' : 'Unlock'} ${test.name}`}
                >
                  {test.paid && !test.attempted ? 'Start Test' : test.attempted ? 'Completed' : 'Unlock Test'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={4999} // $49.99 in cents
        onSuccess={handlePaymentSuccess}
        userId={auth.currentUser?.uid}
      />
      <Footer />
    </div>
  );
};

export default Dashboard;