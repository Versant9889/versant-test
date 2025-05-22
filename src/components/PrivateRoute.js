import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

function PrivateRoute({ children, requirePaid }) {
  const { currentUser } = useAuth();
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPayment = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setHasPaid(userDoc.data().hasPaid);
      }
      setLoading(false);
    };

    checkPayment();
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requirePaid && !loading && !hasPaid) {
    return <Navigate to="/upgrade" />;
  }

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return children;
}

export default PrivateRoute;
