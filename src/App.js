import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { getAuth } from 'firebase/auth';
import Homepage from './pages/Homepage';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './pages/Dashboard';
import TestPage from './pages/TestPage';
import ResultPage from './components/ResultPage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FullBlogPost from './pages/FullBlogPost';
import BlogIndex from './pages/BlogIndex';
import RefundPolicy from './pages/RefundPolicy';
import PracticeTestPage from './pages/PracticeTestPage';
import SpeakingHub from './pages/SpeakingHub';
import ReadingHub from './pages/ReadingHub';
import SpeakingTest from './pages/SpeakingTest';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import PricingPage from './pages/PricingPage';
import EbookLanding from './pages/EbookLanding';
import ThankYou from './pages/ThankYou';
import { Navigate } from 'react-router-dom';
import { useActivityTracker } from './hooks/useActivityTracker';
import { useSessionManager } from './hooks/useSessionManager';
import WhatsAppButton from './components/WhatsAppButton';

// Helper component to handle /admin redirection
const AdminRedirect = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user && user.email === 'admin@versantapp.com') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/admin/login" replace />;
};


// IMPORTANT: Replace with your own Google Analytics Measurement ID
const TRACKING_ID = "G-91JD206S3Z";
ReactGA.initialize(TRACKING_ID);

// Component to track page views, user activity, and enforce session security
function PageTracker() {
  const location = useLocation();

  useActivityTracker(); // <--- New Global Real-time Tracker
  useSessionManager();  // <--- Anti-Piracy Server Lock

  // Real-time Unique/Repeated Visitor Tracking
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        let visitorId = localStorage.getItem('versant_visitor_id');
        let isRepeated = true;

        if (!visitorId) {
          // Generate a new unique visitor ID
          visitorId = 'vis_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
          localStorage.setItem('versant_visitor_id', visitorId);
          isRepeated = false;
        }

        // Generate YYYY-MM-DD in local time
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const lastLoggedDate = localStorage.getItem('versant_last_visit_logged_date');
        if (lastLoggedDate !== todayStr) {
          const response = await fetch('/.netlify/functions/trackVisitor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorId, isRepeated, date: todayStr })
          });
          if (response.ok) {
            localStorage.setItem('versant_last_visit_logged_date', todayStr);
          }
        }
      } catch (err) {
        console.error("Error tracking visitor:", err);
      }
    };
    trackVisitor();
  }, []);

  useEffect(() => {
    // 0. Affiliate URL Tracking
    const searchParams = new URLSearchParams(location.search);
    const ref = searchParams.get('ref') || searchParams.get('affiliate');
    if (ref) {
      localStorage.setItem('versant_affiliate_ref', ref);
      console.log('Affiliate tracking code saved:', ref);
    }

    // 1. Track Page View in GA
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });

    // 2. Track Internal Analytics
    const trackInternal = async () => {
      const { trackPageView } = await import('./utils/AnalyticsService');
      trackPageView(location.pathname);
    };
    trackInternal();
  }, [location]);

  // Heartbeat for "Online" status (every 30s)
  useEffect(() => {
    const interval = setInterval(async () => {
      const { heartbeat } = await import('./utils/AnalyticsService');
      heartbeat();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return null;
}

function App() {
  return (
    <Router>
      <PageTracker />
      <WhatsAppButton />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/versant-reading-and-writing-mock-test/start" element={<TestPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<FullBlogPost />} />

        {/* Speaking & Listening Module */}
        <Route path="/versant-reading-and-writing-mock-test" element={<ReadingHub />} />
        <Route path="/versant-speaking-and-listening-practice-test" element={<SpeakingHub />} />
        <Route path="/versant-speaking-and-listening-practice-test/start/:mode" element={<SpeakingTest />} />

        {/* Ebook Routes */}
        <Route path="/ebook" element={<EbookLanding />} />
        <Route path="/thank-you" element={<ThankYou />} />

        {/* Admin Routing */}
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
