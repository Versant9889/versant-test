import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import PaymentModal from '../components/PaymentModal';

import {
  DashboardNav,
  QuickStats,
  PlanStatus,
  SkillBreakdown,
  AccountDetails,
  AvailableTests,
  TestHistory
} from '../components/DashboardComponents';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userTestAccess, setUserTestAccess] = useState(null);
  const [attemptedTests, setAttemptedTests] = useState(new Set());

  // User Profile Stats State
  const [testHistory, setTestHistory] = useState([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    highestScore: 0
  });

  // Derived state for Skill Breakdown
  const [skillBreakdown, setSkillBreakdown] = useState({
    reading: 0,
    writing: 0,
    speaking: 0,
    listening: 0
  });

  const [studentData, setStudentData] = useState({
    name: 'User',
    email: 'user@example.com',
    plan: 'Basic',
    // ... maps to state
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      // Update Basic Info
      setStudentData(prev => ({
        ...prev,
        name: currentUser.displayName || currentUser.email.split('@')[0],
        email: currentUser.email
      }));

      // Check user's test access status
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserTestAccess(data.paidTests || false);
        setStudentData(prev => ({ ...prev, plan: data.paidTests ? 'Premium' : 'Free' }));
      } else {
        // Create user document if it doesn't exist
        await setDoc(userRef, { paidTests: false });
        setUserTestAccess(false);
      }

      // Mock Data for fallback
      const MOCK_DATA = {
        stats: {
          totalTests: 12,
          averageScore: 72,
          highestScore: 78
        },
        history: [
          { id: 'm1', testId: 1, totalScore: 65, timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'full_test' },
          { id: 'm2', testId: 2, totalScore: 72, timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'full_test' },
          { id: 'm3', testId: 3, totalScore: 78, timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'full_test' }
        ],
        skills: {
          reading: 75,
          writing: 68,
          speaking: 72,
          listening: 70
        },
        attempts: new Set(['1', '2', '3'])
      };

      // Fetch attempted tests and history
      try {
        const resultsRef = collection(db, 'users', currentUser.uid, 'testResults');
        const q = query(resultsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const attempts = new Set();
        const history = [];

        let totalScoreSum = 0;
        let maxScore = 0;
        let count = 0;

        // Skill aggregation variables
        let typingSum = 0, typingCount = 0;
        let sentenceSum = 0, sentenceCount = 0;
        let fillSum = 0, fillCount = 0;
        let jumbledSum = 0, jumbledCount = 0;

        const processedIds = new Set(); // To track unique test attempts if needed

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Deduplication Logic:
          // Check if we already have this testId with the same score in our history list
          // (Assuming sorted by desc timestamp, so we see newest first)
          const isDuplicate = history.some(h =>
            h.testId === data.testId &&
            h.totalScore === data.totalScore &&
            Math.abs(new Date(h.timestamp) - new Date(data.timestamp)) < 60000 * 5 // 5 minute window
          );

          if (!isDuplicate) {
            // Build History
            history.push({
              id: doc.id,
              ...data
            });

            // Track Unique Attempts for UI (independent of history view)
            if (data.testId) attempts.add(data.testId.toString());

            if (data.type === 'full_test' || data.totalScore !== undefined) {
              count++;
              const score = data.totalScore || 0;
              totalScoreSum += score;
              if (score > maxScore) maxScore = score;

              // Aggregate Sections if available
              if (data.sections) {
                data.sections.forEach(sec => {
                  if (sec.section === 'Typing') {
                    typingSum += (sec.score || 0); typingCount++;
                  } else if (sec.section === 'Sentence Completion') {
                    sentenceSum += (sec.score || 0); sentenceCount++;
                  } else if (sec.section === 'Fill in the Blanks') {
                    fillSum += (sec.score || 0); fillCount++;
                  } else if (sec.section === 'Jumbled Words') {
                    jumbledSum += (sec.score || 0); jumbledCount++;
                  }
                });
              }
            }
          }
        });

        setAttemptedTests(attempts);
        setTestHistory(history);
        setStats({
          totalTests: count,
          averageScore: count > 0 ? Math.round(totalScoreSum / count) : 0,
          highestScore: maxScore
        });

        // Calculate approximate skill breakdown (normalized to 80 scale for visualization)
        // Simplified logic: 
        // Writing = Typing & Jumbled
        // Reading = Fill in Blanks
        // Speaking = Sentence Completion (proxy)
        // Listening = Sentence Completion (proxy)

        setSkillBreakdown({
          writing: Math.min(80, Math.round((typingSum / (typingCount || 1)) + (jumbledSum / (jumbledCount || 1)))),
          reading: Math.min(80, Math.round((fillSum / (fillCount || 1)) * 4)), // approx scaling
          speaking: Math.min(80, Math.round((sentenceSum / (sentenceCount || 1)) * 4)),
          listening: Math.min(80, Math.round((sentenceSum / (sentenceCount || 1)) * 4))
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.code === 'permission-denied') {
          console.log("Permission denied. falling back to MOCK DATA.");
          setAttemptedTests(MOCK_DATA.attempts);
          setTestHistory(MOCK_DATA.history);
          setStats(MOCK_DATA.stats);
          setSkillBreakdown(MOCK_DATA.skills);
          // Also force plan to premium for visual check
          setStudentData(prev => ({ ...prev, plan: 'Premium (Mock)' }));
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const userTestStatus = Array.from({ length: 20 }, (_, index) => {
    const testId = (index + 1).toString();
    return {
      id: index + 1,
      name: `Test ${index + 1}`,
      paid: true,
      attempted: attemptedTests.has(testId),
      description: `Test ${index + 1} challenges your English skills...`,
      level: index + 1 <= 3 ? 'Easy' : index + 1 <= 8 ? 'Moderate' : 'Advanced',
      duration: '50 mins'
    };
  });

  const handleStartTest = (test) => {
    if (!test.paid) {
      setShowPaymentModal(true);
      return;
    }
    if (test.attempted) {
      if (!window.confirm('You have already attempted this test. Do you want to retake it?')) return;
    }
    navigate('/test', { state: { testId: test.id } });
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setUserTestAccess(true);
    setStudentData(prev => ({ ...prev, plan: 'Premium' }));
    alert('Payment successful! You now have access to all premium tests.');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  // Combine real stats into studentData object for the view
  const dashboardData = {
    ...studentData,
    testsAttempted: stats.totalTests,
    currentScore: stats.highestScore,
    averageScore: stats.averageScore,
    testsRemaining: 20 - stats.totalTests, // Assuming 20 total tests
    tests: userTestStatus, // Pass this to AvailableTests
  };

  return (
    <div className="h-full w-full overflow-auto bg-gray-50 min-h-screen">
      <DashboardNav studentData={dashboardData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="text-emerald-600">{dashboardData.name.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-gray-600">Track your progress and continue your Versant test preparation journey.</p>
        </div>

        {/* Quick Stats */}
        <QuickStats studentData={dashboardData} />

        {/* Plan Status */}
        <PlanStatus studentData={dashboardData} />

        {/* Skill Breakdown & Account Details */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <SkillBreakdown skillBreakdown={skillBreakdown} />
          <AccountDetails studentData={dashboardData} />
        </div>

        {/* Available Tests */}
        <AvailableTests tests={userTestStatus} onStartTest={handleStartTest} />

        {/* Test History */}
        <TestHistory completedTests={testHistory} />
      </main>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={4999}
        onSuccess={handlePaymentSuccess}
        userId={auth.currentUser?.uid}
      />
    </div>
  );
};

export default Dashboard;