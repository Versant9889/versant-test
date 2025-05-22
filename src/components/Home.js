import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to Versant Test Platform</h1>
      <p className="mb-6 text-lg text-gray-700">Prepare, practice, and improve your skills.</p>
      <div className="space-x-4">
        <Link to="/login">
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Signup
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
