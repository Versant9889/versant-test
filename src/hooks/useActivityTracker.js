import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useActivityTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // Track pageview via Google Analytics 4 (GA4)
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            window.gtag('event', 'page_view', {
                page_path: location.pathname
            });
        }
    }, [location.pathname]);
};
