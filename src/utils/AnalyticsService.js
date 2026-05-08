import { db, auth } from '../firebaseConfig';
import { doc, updateDoc, serverTimestamp, setDoc, increment, collection, addDoc } from 'firebase/firestore';

// Call this on app start/login
export const startSession = async (user) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    // Mark online
    try {
        await updateDoc(userRef, {
            isOnline: true,
            lastActive: serverTimestamp(),
            currentPath: window.location.pathname
        });
    } catch (e) {
        console.error("Error starting session", e);
    }
};

// Call this on page navigation
export const trackPageView = async (path) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    try {
        await updateDoc(userRef, {
            currentPath: path,
            lastActive: serverTimestamp(),
            // detailed analytics could go here (e.g. subcollection 'pageviews')
        });
    } catch (e) {
        // ignore perms errors if any
    }
};

// Call to record time spent (every 30s)
export const heartbeat = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    try {
        await updateDoc(userRef, {
            lastActive: serverTimestamp(),
            isOnline: true,
            // Increment total time spent by 30 seconds (0.5 minutes)
            totalTimeSpent: increment(0.5)
        });
    } catch (e) {
        // console.error(e);
    }
};

// Call this to track custom funnel events internally (fixing blind spots)
export const trackFunnelEvent = async (eventName, additionalData = {}) => {
    try {
        const user = auth.currentUser;
        
        const eventData = {
            eventType: eventName,
            timestamp: serverTimestamp(),
            path: window.location.pathname,
            isRegistered: !!user,
            userId: user ? user.uid : `anon_${Math.random().toString(36).substr(2, 9)}`,
            email: user ? user.email : 'Anonymous',
            ...additionalData
        };

        // Push to the global event stream used by AdminDashboard
        await addDoc(collection(db, 'analytics_events'), eventData);
    } catch (e) {
        console.error("Error tracking funnel event internally:", e);
    }
};
