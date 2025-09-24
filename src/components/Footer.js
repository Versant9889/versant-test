import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white py-6 px-4">
      <div className="container mx-auto text-center text-sm">
        <p>© {new Date().getFullYear()} Versant Test. All rights reserved.</p>
        <div className="mt-2">
          <Link to="/terms" className="hover:text-green-200 mx-2">Terms and Conditions</Link>
          <Link to="/privacy" className="hover:text-green-200 mx-2">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
