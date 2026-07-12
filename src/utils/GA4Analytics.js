import ReactGA from 'react-ga4';
import { getAuth } from 'firebase/auth';

// 1. Fetch user geo-location (asynchronously called once on App start)
export const fetchGeoLocation = async () => {
    try {
        if (sessionStorage.getItem('ga4_user_country')) return;

        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
            const data = await res.json();
            sessionStorage.setItem('ga4_user_country', data.country_name || 'Unknown');
            sessionStorage.setItem('ga4_user_city', data.city || 'Unknown');
        }
    } catch (err) {
        console.error("Error retrieving geo location for GA4:", err);
    }
};

// 2. UTM Tracking and Referrer Capture on initial site landing
export const initUTMTracking = () => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams(window.location.search);
    const utmTags = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

    utmTags.forEach(tag => {
        const val = searchParams.get(tag);
        if (val) {
            localStorage.setItem(`versant_${tag}`, val);
        }
    });

    // Capture referrer if it exists and is external
    const referrer = document.referrer;
    if (referrer && !referrer.includes(window.location.hostname)) {
        localStorage.setItem('versant_initial_referrer', referrer);
    }
};

// 3. Resolve device type from screen size/user agent
const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) return 'Mobile';
    if (width >= 768 && width < 1024) return 'Tablet';
    return 'Desktop';
};

// 4. Resolve OS from user agent
const getOS = () => {
    const ua = navigator.userAgent;
    if (ua.indexOf("Win") !== -1) return "Windows";
    if (ua.indexOf("Mac") !== -1) return "MacOS";
    if (ua.indexOf("X11") !== -1) return "UNIX";
    if (ua.indexOf("Linux") !== -1) return "Linux";
    if (ua.indexOf("Android") !== -1) return "Android";
    if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) return "iOS";
    return "Unknown";
};

// 5. Resolve Browser from user agent
const getBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.indexOf("Chrome") !== -1) return "Chrome";
    if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) return "Safari";
    if (ua.indexOf("Firefox") !== -1) return "Firefox";
    if (ua.indexOf("MSIE") !== -1 || !document.documentMode === false) return "IE";
    if (ua.indexOf("Edge") !== -1) return "Edge";
    return "Other";
};

// 6. Gather all standard parameters for a given event
export const getGA4Context = () => {
    const authInstance = getAuth();
    const currentUser = authInstance.currentUser;

    const utmSource = localStorage.getItem('versant_utm_source');
    const utmMedium = localStorage.getItem('versant_utm_medium');
    const utmCampaign = localStorage.getItem('versant_utm_campaign');
    const utmContent = localStorage.getItem('versant_utm_content');
    const utmTerm = localStorage.getItem('versant_utm_term');
    const initialReferrer = localStorage.getItem('versant_initial_referrer') || '';

    // Determine default source/medium if not explicitly UTM tracked
    let resolvedSource = utmSource || 'direct';
    let resolvedMedium = utmMedium || 'none';

    if (!utmSource && initialReferrer) {
        try {
            resolvedSource = new URL(initialReferrer).hostname;
            resolvedMedium = 'referral';
        } catch (e) {
            // fallback if referrer is malformed URL
        }
    }

    return {
        page_url: window.location.href,
        page_title: document.title,
        user_country: sessionStorage.getItem('ga4_user_country') || 'Unknown',
        city: sessionStorage.getItem('ga4_user_city') || 'Unknown',
        language: navigator.language || 'Unknown',
        device_type: getDeviceType(),
        operating_system: getOS(),
        browser: getBrowser(),
        source: resolvedSource,
        medium: resolvedMedium,
        campaign: utmCampaign || 'none',
        referrer: document.referrer || '',
        logged_in: currentUser ? 'Yes' : 'No',
        utm_source: utmSource || '',
        utm_medium: utmMedium || '',
        utm_campaign: utmCampaign || '',
        utm_content: utmContent || '',
        utm_term: utmTerm || ''
    };
};

// 7. Track specific event
export const trackGA4Event = (eventName, eventParams = {}) => {
    try {
        const context = getGA4Context();
        const finalParams = {
            ...context,
            ...eventParams
        };

        // Fire event via ReactGA
        ReactGA.event(eventName, finalParams);

        // Debug log (helpful in dev checkouts/GTM debug view)
        console.log(`[GA4 Event] ${eventName}`, finalParams);
    } catch (err) {
        console.error(`Failed to dispatch GA4 event ${eventName}:`, err);
    }
};
