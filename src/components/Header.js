import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Header({ page }) {
  const [isOpen, setIsOpen] = useState(false);

  const DashboardLinks = () => (
    <>
      <Link to="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">Dashboard</Link>
      <Link to="/practice" onClick={() => setIsOpen(false)} className={`font-medium ${page === 'practiceHub' || page === 'speakingHub' ? 'text-emerald-500 font-semibold' : 'md:text-white text-green-800 hover:text-green-200'}`}>
        Practice
      </Link>
      <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">About Us</Link>
      <Link to="/contact" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">Contact Us</Link>
      <Link to="/pricing" onClick={() => setIsOpen(false)} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2 rounded-full uppercase tracking-wider text-xs transition-transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30 md:ml-2 flex items-center gap-1 justify-center w-max mt-2 md:mt-0">
        <span>⭐</span> Upgrade to Pro
      </Link>
    </>
  );

  const HomeLinks = () => (
    <>
      <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">Home</Link>
      <Link to="/blog" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">Blog</Link>
      <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">About Us</Link>
      <Link to="/contact" onClick={() => setIsOpen(false)} className="hover:text-green-200 font-medium md:text-white text-green-800">Contact Us</Link>
      
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mt-4 md:mt-0 md:ml-4 border-t md:border-t-0 border-green-600 pt-4 md:pt-0">
        <Link to="/login" onClick={() => setIsOpen(false)} className="font-bold text-white hover:text-green-200 transition-colors">
          Log In
        </Link>
        <Link to="/pricing" onClick={() => setIsOpen(false)} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-2.5 rounded-full uppercase tracking-wider text-xs transition-transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30 flex items-center gap-2 justify-center w-max">
          <span>⭐</span> Upgrade to Pro
        </Link>
      </div>
    </>
  );

  return (
    <nav className="bg-green-700 text-white px-4 py-3 shadow-md md:px-6 md:py-4 relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to={page === 'practiceHub' ? '/dashboard' : '/'} className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded-full"></div>
          <span className="text-xl font-bold">Versant Test</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
          {page === 'practiceHub' ? <DashboardLinks /> : <HomeLinks />}
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
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-green-600 py-4 px-4 flex flex-col space-y-4 shadow-lg transition-all z-50">
          {page === 'practiceHub' ? <DashboardLinks /> : <HomeLinks />}
        </div>
      )}
    </nav>
  );
}
