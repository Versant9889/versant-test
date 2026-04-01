import { useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';

const auth = getAuth(app);
const db = getFirestore(app);

export const useSessionManager = () => {
  useEffect(() => {
    let unsubscribeSnapshot;

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Skip session locking for the global Admin account
        if (user.email === 'admin@versantapp.com') return;

        // 1. Get or Generate a Local Session ID for this specific browser/device
        let localSessionId = localStorage.getItem('versant_device_session_id');
        if (!localSessionId) {
          // Use crypto.randomUUID if available, else fallback
          localSessionId = window.crypto && window.crypto.randomUUID 
            ? window.crypto.randomUUID() 
            : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          
          localStorage.setItem('versant_device_session_id', localSessionId);
        }

        const userRef = doc(db, 'users', user.uid);

        try {
          // 2. Register this device's session ID in Firestore as the "active" session
          await setDoc(userRef, { currentSessionId: localSessionId }, { merge: true });

          // 3. Listen to the user's document in real-time
          unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const remoteSessionId = data.currentSessionId;

              // 4. If the remote session ID is different from our local session ID,
              // it means the user just logged in on a different device!
              if (remoteSessionId && remoteSessionId !== localSessionId) {
                console.warn("Anti-Piracy Lock: Multiple simultaneous sessions detected. Terminating legacy session.");
                
                // Force logout the current (legacy) session
                signOut(auth).then(() => {
                  localStorage.removeItem('versant_device_session_id');
                  alert("Security Alert: Your account was accessed from another device. For your protection, you have been logged out of this session. Please DO NOT share your credentials.");
                  window.location.href = '/login';
                }).catch(err => console.error("Error signing out:", err));
              }
            }
          });
        } catch (error) {
          console.error("Error setting up session manager:", error);
        }

      } else {
        // User logged out, clean up listener
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);
};
