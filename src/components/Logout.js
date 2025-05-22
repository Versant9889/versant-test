import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import app from '../firebaseConfig';

const auth = getAuth(app);

function Logout() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">
      Log Out
    </button>
  );
}

export default Logout;
