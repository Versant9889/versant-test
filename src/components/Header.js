import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ page }) {
  return (
    <nav className="bg-green-700 text-white px-4 py-3 shadow-md md:px-6 md:py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={page === 'practiceHub' ? '/dashboard' : '/'} className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded-full"></div>
          <span className="text-xl font-bold">Versant Test</span>
        </Link>
        <div className="hidden md:flex space-x-6 lg:space-x-8">
          {page === 'practiceHub' ? (
            <>
              <Link to="/dashboard" className="hover:text-green-200 font-medium">Dashboard</Link>
              <Link to="/practice" className={`text-base font-medium ${page === 'practiceHub' || page === 'speakingHub' ? 'text-emerald-500 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}>
                Practice
              </Link>
              <Link to="/about" className="hover:text-green-200 font-medium">About Us</Link>
              <Link to="/contact" className="hover:text-green-200 font-medium">Contact Us</Link>
              <Link to="/pricing" className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2 rounded-full uppercase tracking-wider text-xs transition-transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30 ml-2 flex items-center gap-1">
                <span>⭐</span> Upgrade to Pro
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-green-200 font-medium">Home</Link>
              <Link to="/blog" className="hover:text-green-200 font-medium">Blog</Link>
              <Link to="/about" className="hover:text-green-200 font-medium">About Us</Link>
              <Link to="/contact" className="hover:text-green-200 font-medium">Contact Us</Link>
              <Link to="/pricing" className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2 rounded-full uppercase tracking-wider text-xs transition-transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30 ml-2 flex items-center gap-1">
                <span>⭐</span> Upgrade to Pro
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
