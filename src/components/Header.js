import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

export default function Header({ page }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Links shown when user IS logged in
  const LoggedInLinks = () => (
    <>
      <Link to="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">Dashboard</Link>
      <Link to="/ebook" onClick={() => setIsOpen(false)} className="font-black bg-gradient-to-r from-[#d4af37] via-[#f9e8a2] to-[#aa7c11] bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(212,175,55,0.4)] hover:brightness-125 transition-all duration-200">Ebook 📘</Link>
      <Link to="/blog" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">Blog</Link>
      <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">About Us</Link>
      <Link to="/contact" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">Contact Us</Link>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-3 mt-4 md:mt-0 md:ml-4 border-t md:border-t-0 border-green-600 pt-4 md:pt-0">
        <Link to="/pricing" onClick={() => setIsOpen(false)} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-2.5 rounded-full uppercase tracking-wider text-xs transition-transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30 flex items-center gap-2 justify-center w-max">
          <span>⭐</span> Upgrade to Pro
        </Link>
        <button onClick={handleLogout} className="font-bold md:text-white text-green-800 hover:text-green-200 transition-colors text-sm">
          Log Out
        </button>
      </div>
    </>
  );

  // Links shown when user is NOT logged in
  const GuestLinks = () => (
    <>
      <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">Home</Link>
      <Link to="/ebook" onClick={() => setIsOpen(false)} className="font-black bg-gradient-to-r from-[#d4af37] via-[#f9e8a2] to-[#aa7c11] bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(212,175,55,0.4)] hover:brightness-125 transition-all duration-200">Ebook 📘</Link>
      <Link to="/blog" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">Blog</Link>
      <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">About Us</Link>
      <Link to="/contact" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">Contact Us</Link>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mt-4 md:mt-0 md:ml-4 border-t md:border-t-0 border-green-600 pt-4 md:pt-0">
        <Link to="/login" onClick={() => setIsOpen(false)} className="font-bold md:text-white text-green-800 hover:text-green-200 transition-colors">
          Log In
        </Link>
        <Link to="/pricing" onClick={() => setIsOpen(false)} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-2.5 rounded-full uppercase tracking-wider text-xs transition-transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30 flex items-center gap-2 justify-center w-max">
          <span>⭐</span> Upgrade to Pro
        </Link>
      </div>
    </>
  );

  const targetDateStr = (() => {
    const baseDate = new Date('May 25, 2026 23:59:59').getTime();
    const cycle = 10 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let target = baseDate;
    if (now > baseDate) {
      target = baseDate + (Math.floor((now - baseDate) / cycle) + 1) * cycle;
    }
    return new Date(target).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  })();

  return (
    <>
      <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white text-center py-2 px-4 shadow-md sticky top-0 z-[60] flex items-center justify-center gap-2 cursor-pointer font-bold text-sm tracking-wide" onClick={() => window.location.href='/pricing'}>
        <span className="animate-pulse">🔴</span> FLASH SALE EXTENDED: Get Lifetime Access of Tests. Offer ends {targetDateStr}! <span className="underline decoration-white/50 hover:decoration-white ml-2">Claim Offer ➔</span>
      </div>
      <nav className="bg-green-700 text-white px-4 py-3 shadow-md md:px-6 md:py-4 relative z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to={currentUser ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            <span className="text-xl font-bold">Versant Test</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
            {currentUser ? <LoggedInLinks /> : <GuestLinks />}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-green-200 focus:outline-none">
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-green-600 py-4 px-4 flex flex-col space-y-4 z-50">
            {currentUser ? <LoggedInLinks /> : <GuestLinks />}
          </div>
        )}
      </nav>
    </>
  );
}
