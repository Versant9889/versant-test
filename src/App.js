import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';
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
import PracticeHub from './pages/PracticeHub';

import PracticeTestPage from './pages/PracticeTestPage';

// IMPORTANT: Replace with your own Google Analytics Measurement ID
const TRACKING_ID = "G-91JD206S3Z"; 
ReactGA.initialize(TRACKING_ID);

// Component to track page views
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      <PageTracker />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/practice" element={<PracticeHub />} />
        <Route path="/practice/:section" element={<PracticeTestPage />} />
        <Route path="/blog/:slug" element={<FullBlogPost />} />
      </Routes>
    </Router>
  );
}

export default App;
