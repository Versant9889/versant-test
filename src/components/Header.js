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
              <Link to="/blog" className="hover:text-green-200 font-medium">Blog</Link>
              <Link to="/about" className="hover:text-green-200 font-medium">About Us</Link>
              <Link to="/contact" className="hover:text-green-200 font-medium">Contact Us</Link>
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-green-200 font-medium">Home</Link>
              <Link to="/blog" className="hover:text-green-200 font-medium">Blog</Link>
              <Link to="/about" className="hover:text-green-200 font-medium">About Us</Link>
              <Link to="/contact" className="hover:text-green-200 font-medium">Contact Us</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
