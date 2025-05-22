import React from 'react';

function UpgradePage() {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-green-50 rounded-xl shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Upgrade Required</h2>
      <p className="mb-4">This test is part of the premium package.</p>
      <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded">
        Upgrade Now
      </button>
    </div>
  );
}

export default UpgradePage;
