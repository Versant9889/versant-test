import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { readingTests, speakingTests } from '../data/mockTests';
import { FaLock, FaUnlock } from 'react-icons/fa';
import Header from '../components/Header';

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
  const [userTestAccess, setUserTestAccess] = useState(true); // Default to true now
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
              let score = data.totalScore || 0;
              
              // Backwards compatibility: Normalize raw algorithmic scores (e.g. 317) down to the 20-80 GSE scale
              if (score > 80 && score <= 630 && data.type?.includes('speaking')) {
                  score = Math.round(20 + (score / 630) * 60);
              } else if (score > 80) {
                  score = 80; // Hard cap any anomalies
              }

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
    navigate('/test', { state: { testId: test.id } });
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
      <Header page="dashboard" />
      <DashboardNav studentData={dashboardData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-10 animate-fade-in-down">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">{dashboardData.name.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-gray-600 text-lg">Your progress dashboard. Choose a module to start practicing.</p>
        </div>

        {/* Quick Stats Grid */}
        <QuickStats studentData={dashboardData} />

        {/* Reading & Writing Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <span role="img" aria-label="pen" className="text-2xl">✍️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reading & Writing</h2>
              <p className="text-gray-500">Master grammar, vocabulary, and composition with 20 mock tests.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {readingTests.map((test) => {
              // Logic: All tests are unlocked now since Stripe was removed
              const isLocked = false;

              return (
                <div
                  key={test.id}
                  onClick={() => {
                    if (!isLocked) navigate('/test', { state: { testId: test.id } });
                    else alert("Upgrade to Premium to unlock all tests!");
                  }}
                  className={`relative group bg-white rounded-xl p-4 border-2 transition-all duration-200 cursor-pointer ${isLocked
                    ? 'border-gray-100 opacity-60 grayscale-[0.8] hover:opacity-100 hover:grayscale-0'
                    : 'border-emerald-50 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-900">{test.title}</span>
                    {isLocked ? (
                      <FaLock className="text-gray-400 text-xs" />
                    ) : (
                      <FaUnlock className="text-emerald-500 text-xs" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span>⏱ {test.duration}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${test.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      test.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {test.difficulty}
                    </span>
                  </div>

                  {!dashboardData.paidTests && test.id === 1 && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-bounce">
                      FREE
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Speaking & Listening Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <span role="img" aria-label="mic" className="text-2xl">🎙️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Speaking & Listening</h2>
              <p className="text-gray-500">Enhance pronunciation and fluency with 20 AI-graded assessments.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {speakingTests.map((test) => {
              const isLocked = false; // Always unlocked now

              return (
                <div
                  key={test.id}
                  onClick={() => {
                    if (!isLocked) navigate('/speaking/test/full', { state: { testId: test.id } });
                    else alert("Upgrade to Premium to unlock all tests!");
                  }}
                  className={`relative group bg-white rounded-xl p-4 border-2 transition-all duration-200 cursor-pointer ${isLocked
                    ? 'border-gray-100 opacity-60 grayscale-[0.8] hover:opacity-100 hover:grayscale-0'
                    : 'border-blue-50 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-900">{test.title}</span>
                    {isLocked ? (
                      <FaLock className="text-gray-400 text-xs" />
                    ) : (
                      <FaUnlock className="text-blue-500 text-xs" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span>⏱ {test.duration}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${test.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      test.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {test.difficulty}
                    </span>
                  </div>

                  {!dashboardData.paidTests && test.id === 1 && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-bounce">
                      FREE
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Analytics & History Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <SkillBreakdown skillBreakdown={skillBreakdown} />
          <div className="lg:col-span-1">
            <AccountDetails studentData={dashboardData} />
          </div>
        </div>

        <div className="mt-8">
          <TestHistory completedTests={testHistory} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;