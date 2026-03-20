import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

export const useActivityTracker = () => {
    const location = useLocation();
    const hasFiredForCurrentPath = useRef('');

    useEffect(() => {
        if (hasFiredForCurrentPath.current === location.pathname) return;
        hasFiredForCurrentPath.current = location.pathname;

        let visitorId = localStorage.getItem('versant_guest_id');
        if (!visitorId) {
            visitorId = `Guest_${uuidv4().split('-')[0].toUpperCase()}`;
            localStorage.setItem('versant_guest_id', visitorId);
        }

        const logPageVisit = async () => {
            try {
                const user = auth.currentUser;
                const eventPayload = {
                    userId: user ? user.uid : visitorId,
                    email: user ? user.email : visitorId, // Default to Guest ID if no email
                    isRegistered: !!user,
                    eventType: 'PAGE_VIEW',
                    path: location.pathname,
                    timestamp: serverTimestamp(),
                    userAgent: navigator.userAgent
                };

                // Asynchronous fire-and-forget write to Firestore 'analytics_events'
                await addDoc(collection(db, 'analytics_events'), eventPayload);
            } catch (err) {
                console.warn('Analytics logging skipped:', err.message);
            }
        };

        logPageVisit();
    }, [location.pathname]);
};
