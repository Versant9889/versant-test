import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, googleProvider } from '../firebaseConfig';
import Footer from './Footer';
import Header from './Header';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { FaCheck, FaChartLine, FaTrophy, FaMicrophone, FaClipboardList, FaBullseye, FaChevronDown, FaCheckCircle, FaTimesCircle, FaStar, FaGlobe } from 'react-icons/fa';

const ResultPage = () => {
  const { state } = useLocation();
  const {
    isPractice, section, questions, // For practice mode
    testId, typingResults, sentenceAnswers, fillAnswers, jumbledAnswers, passageInputs, emailInput, questions: allQuestions // For full test mode
  } = state || {};

  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Analytics Growth Features
  const [isLocked, setIsLocked] = useState(true); // Default to locked immediately to prevent score leak
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoginView, setIsLoginView] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const dataSavedRef = React.useRef(false);

  useEffect(() => {
    // Strictly verify Firebase Auth state. 
    // This allows logged in users to unblur, and forces guests to hit the wall.
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLocked(false);
      } else {
        setIsLocked(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Reusable Save Function
  const saveResult = React.useCallback(async (resultData, testId) => {
    if (dataSavedRef.current) return;
    try {
      const lastSaved = sessionStorage.getItem(`last_saved_${testId}`);
      if (lastSaved && (Date.now() - parseInt(lastSaved)) < 60000 * 5) {
        console.log("Result already saved recently. Skipping.");
        return;
      }

      const user = auth.currentUser;
      if (user) {
        dataSavedRef.current = true;
        const userResultsRef = collection(db, 'users', user.uid, 'testResults');
        await addDoc(userResultsRef, {
          ...resultData,
          timestamp: new Date().toISOString(),
          createdAt: serverTimestamp()
        });
        console.log("Result saved successfully");
        sessionStorage.setItem(`last_saved_${testId}`, Date.now().toString());
      }
    } catch (error) {
      console.error("Error saving result:", error);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || 'Student',
          provider: 'google',
          testAccess: { 1: true }, // Ensure test 1 is free
          createdAt: serverTimestamp()
        });
      }

      sessionStorage.setItem('guest_unlocked', 'true');
      setIsLocked(false);

      // Instantly save result to their newly created persistent account
      if (score > 0) {
        saveResult({
          testId: testId || '1',
          totalScore: score,
          sections: results,
          type: state?.mode === 'speaking' ? 'speaking_full' : 'full_test'
        }, testId || '1');
      }
    } catch (err) {
      console.error("Google Auth Capture failed", err);
      // Fallback
      setIsLocked(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      let user;
      if (isLoginView) {
        const result = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        user = result.user;
      } else {
        const result = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        user = result.user;
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          email: user.email,
          name: authEmail.split('@')[0], // simple fallback name
          provider: 'email',
          testAccess: { 1: true }, // Ensure test 1 is free
          createdAt: serverTimestamp()
        });
      }

      sessionStorage.setItem('guest_unlocked', 'true');
      setIsLocked(false);

      if (score > 0) {
        saveResult({
          testId: testId || '1',
          totalScore: score,
          sections: results,
          type: state?.mode === 'speaking' ? 'speaking_full' : 'full_test'
        }, testId || '1');
      }
    } catch (err) {
      setAuthError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: 'My Versant AI Score',
      text: `I just scored an incredible ${score}/80 on the AI Versant Simulator! 🔥 Can you beat my score? Try it for free here:`,
      url: 'https://versantpro.com'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(`${shareData.text} \n${shareData.url}`);
      alert("Score copied to clipboard! You can paste it anywhere to share.");
    }
  };

  // AI Evaluation Effect
  useEffect(() => {
    if (!state) return;

    const runAIEvaluation = async () => {
      // Avoid re-running if we already have AI data or if key is missing/limit reached
      if (state.aiAnalysisDone) return;

      const { evaluateWithAI } = await import('../utils/geminiScoring');
      console.log("Starting AI Evaluation...");

      // --- SPEAKING TEST AI EVALUATION ---
      if (state.mode === 'speaking' || state.mode === 'speaking_practice') {
        try {
          const testResponses = state.testResponses || [];
          if (results.length > 0 && results[0].aiGraded) return;

          // Fetch the speaking mock data so our offline engine can look up the keywords
          const specificTest = await import('../data/speakingTest.json');

          // We can evaluate everything instantly offline!
          const { evaluateOffline } = await import('../utils/offlineScoring');

          const rootJSON = specificTest.default || specificTest;

          let aiUpdatedResponses = testResponses.map(r => {
            const testIdToUse = r.testId || state.testId || "1";
            const currentMockData = rootJSON[testIdToUse] || rootJSON["1"] || {};
            const aiFeedback = evaluateOffline(r.section, r, currentMockData);
            return {
              ...r,
              aiFeedback: aiFeedback.aiFeedback,
              score: aiFeedback.score || 0
            }
          });

          // Setup final groupings for UI (similar to reading/writing detailedResults)
          const getGroup = (secName, displayName, maxScorePerQ) => {
            const qs = aiUpdatedResponses.filter(r => r.section === secName).map(r => ({
              question: r.questionText,
              userAnswer: r.transcript,
              score: r.score,
              aiFeedback: r.aiFeedback
            }));
            if (qs.length === 0) return null;
            return {
              section: displayName,
              questions: qs,
              score: qs.reduce((sum, q) => sum + (q.score || 0), 0),
              total: qs.length * maxScorePerQ,
              aiGraded: true
            };
          };

          const groupedResults = [
            getGroup('readAloud', 'Read Aloud', 10),
            getGroup('repeats', 'Repeats', 10),
            getGroup('shortAnswer', 'Short Answer', 10),
            getGroup('sentenceBuilds', 'Sentence Builds', 10),
            getGroup('storyRetelling', 'Story Retelling', 10),
            getGroup('openQuestions', 'Open Questions', 10)
          ].filter(Boolean);

          const totalCalculated = groupedResults.reduce((sum, g) => sum + g.score, 0);

          // Map raw 0-630 to standard Versant 20-80 Scale
          const normalizedVersantScore = Math.round(20 + (totalCalculated / 630) * 60);

          setResults(groupedResults);
          setScore(normalizedVersantScore);
          setLoading(false);

          // Save Speaking Result
          if (state.mode === 'speaking') {
            saveResult({
              testId: state.testId || 'unknown_speaking',
              totalScore: normalizedVersantScore,
              sections: groupedResults,
              type: 'speaking_full'
            }, state.testId || 'unknown_speaking');
          }
        } catch (err) {
          console.error("Critical error in speaking AI evaluation:", err);
          setLoading(false);
        }

        return;
      }

      // --- READING/WRITING TEST AI EVALUATION ---
      if (!state.emailInput) return; // Not a writing test

      try {
        // Sequential execution to respect rate limits/reliability
        // 1. Evaluate Email
        let emailResult = await evaluateWithAI('email', {
          prompt: state.questions[39]?.prompt || "Write an email...",
          response: state.emailInput
        });

        // 2. Evaluate Passages in BATCH (DISABLED TO SAVE API LIMITS)
        // Since passage reconstruction is strongly checked offline (Keyword matching),
        // we can safely bypass the AI here to reserve API quota 100% for Email Writing.
        
        let passageResults = [];
        // PASSAGE AI EVALUATION HAS BEEN TURNED OFF BY USER REQUEST
        // passageResults = await evaluateWithAI('passage_batch', passageData);

        console.log("AI Results:", emailResult, passageResults);

        // Update state with AI results so we can display them
        setResults(prevResults => {
          const newResults = [...prevResults]; // Shallow copy

          // Find and update Email Section
          const emailIdx = newResults.findIndex(r => r.section === 'Email Writing');
          if (emailIdx !== -1 && emailResult && !emailResult.error) {
            newResults[emailIdx].aiAnalysis = emailResult;
            // Optionally override the generic score with AI score 
            // if emailResult.score is valid number
            if (typeof emailResult.score === 'number') {
              newResults[emailIdx].score = emailResult.score;
              newResults[emailIdx].questions[0].feedback = emailResult.feedback;
            }
          }

          // Find and update Passage Section
          const passIdx = newResults.findIndex(r => r.section === 'Passage Reconstruction');
          if (passIdx !== -1 && passageResults && passageResults.length > 0 && !passageResults[0]?.error) {
            newResults[passIdx].aiAnalysis = passageResults;
            // Update individual question scores/feedback
            newResults[passIdx].questions = newResults[passIdx].questions.map((q, i) => ({
              ...q,
              aiFeedback: passageResults[i]
            }));

            // Recalculate total if valid (AI Score overrides local score)
            const newTotal = passageResults.reduce((acc, curr) => acc + (curr.score || 0), 0);
            newResults[passIdx].score = newTotal;
          }

          // Update overall score
          const newOverallScore = newResults.reduce((acc, curr) => {
            if (curr.section === 'Typing') return acc + (curr.score || 0); // WPM matches score logic?
            return acc + (curr.score || 0);
          }, 0);

          setScore(newOverallScore);

          return newResults;
        });

      } catch (err) {
        console.error("AI Eval Failed", err);
      }
    };

    runAIEvaluation();
  }, [state]);

  // Synchronous Result Formatting (For generic tests / writing)
  useEffect(() => {
    if (!state) {
      setLoading(false);
      return;
    }

    if (dataSavedRef.current) return;

    if (isPractice) {
      // This is the logic for the practice hub tests
      const { questions: practiceQuestions, answers: practiceAnswers } = state;
      let calculatedScore = 0;
      const detailedResults = practiceQuestions.map((q, index) => {
        let isCorrect = false;
        if (section === 'typing') {
          const referenceText = q.paragraph;
          const userText = practiceAnswers[q.id] || '';
          const words = userText.trim().split(/\s+/).length;
          const wpm = Math.round(words); // 1 minute test
          let correctChars = 0;
          for (let i = 0; i < userText.length; i++) {
            if (userText[i] === referenceText[i]) correctChars++;
          }
          const accuracy = userText.length > 0 ? Math.round((correctChars / userText.length) * 100) : 0;
          return { wpm, accuracy };
        } else {
          isCorrect = (practiceAnswers[q.id] || '').trim().toLowerCase() === (q.answer || '').trim().toLowerCase();
          if (isCorrect) {
            calculatedScore++;
          }
        }
        return {
          question: q.question || q.jumbled,
          userAnswer: practiceAnswers[q.id] || 'No Answer',
          correctAnswer: q.answer,
          isCorrect,
        };
      });
      setScore(calculatedScore);
      setResults(section === 'typing' ? detailedResults[0] : detailedResults);
      // Determine if functionality for saving practice tests is desired. 
      // The prompt specifically mentions "user management system... like attempted tests, previous test score"
      // It implies main tests, but saving practice tests might be nice too. 
      // For now, I will focus on the main test as per the variable naming in the prompt logic block below.

    } else if (!state.mode || state.mode === 'writing') {
      // This is the logic for the full test from the dashboard (reading/writing).
      const detailedResults = [];
      let totalScore = 0;

      // Typing
      if (typingResults) {
        totalScore += typingResults.wpm || 0;
        detailedResults.push({
          section: 'Typing',
          wpm: typingResults.wpm,
          accuracy: typingResults.accuracy,
          score: typingResults.wpm // normalizing score for typing? usually WPM is the score.
        });
      }

      // Sentence Completion
      const sentenceQs = allQuestions.slice(1, 11);
      const sentenceResults = sentenceQs.map((q, i) => {
        const userAnswer = sentenceAnswers[i] || 'Not Answered';
        const isCorrect = q.answer && userAnswer.trim().toLowerCase() === q.answer.toLowerCase();
        if (isCorrect) totalScore++;
        return { question: q.question, userAnswer, correctAnswer: q.answer, isCorrect };
      });
      detailedResults.push({ section: 'Sentence Completion', questions: sentenceResults, score: sentenceResults.filter(r => r.isCorrect).length, total: sentenceQs.length });

      // Fill Blanks
      const fillQs = allQuestions.slice(11, 21);
      const fillResults = fillQs.map((q, i) => {
        const userAnswer = fillAnswers[i] || 'Not Answered';
        const isCorrect = q.answer && userAnswer === q.answer;
        if (isCorrect) totalScore++;
        return { question: q.question, userAnswer, correctAnswer: q.answer, isCorrect };
      });
      detailedResults.push({ section: 'Fill in the Blanks', questions: fillResults, score: fillResults.filter(r => r.isCorrect).length, total: fillQs.length });

      // Jumbled Words
      const jumbledQs = allQuestions.slice(21, 36);
      const jumbledResults = jumbledQs.map((q, i) => {
        const userAnswer = jumbledAnswers[i] || 'Not Answered';
        const isCorrect = q.answer && userAnswer.trim().toLowerCase() === q.answer.toLowerCase();
        if (isCorrect) totalScore++;
        return { question: q.jumbled, userAnswer, correctAnswer: q.answer, isCorrect };
      });
      detailedResults.push({ section: 'Jumbled Words', questions: jumbledResults, score: jumbledResults.filter(r => r.isCorrect).length, total: jumbledQs.length });

      // Passage Reconstruction
      const passageQs = allQuestions.slice(36, 39);
      const passageResults = passageQs.map((q, i) => {
        const pScore = state.passageScores ? state.passageScores[i] : { score: 0 };
        return {
          question: q.sentences,
          userAnswer: passageInputs[i] || 'Not Answered',
          score: pScore.score,
          matchPercentage: pScore.matchPercentage
        };
      });
      // Calculate total passage score (out of 30 max)
      const totalPassageScore = passageResults.reduce((acc, curr) => acc + (curr.score || 0), 0);
      totalScore += totalPassageScore;

      detailedResults.push({
        section: 'Passage Reconstruction',
        questions: passageResults,
        score: totalPassageScore,
        total: 30
      });

      // Email Writing
      const emailQ = allQuestions[39];
      const emailScoreData = state.emailScore || { score: 0, feedback: "No feedback" };
      totalScore += emailScoreData.score;

      detailedResults.push({
        section: 'Email Writing',
        questions: [{
          question: emailQ.prompt,
          userAnswer: emailInput || 'Not Answered',
          feedback: emailScoreData.feedback
        }],
        score: emailScoreData.score,
        total: 10
      });

      setScore(totalScore);
      setResults(detailedResults);

      // Save to Firebase
      saveResult({
        testId: testId || 'unknown',
        totalScore,
        sections: detailedResults,
        type: 'full_test'
      }, testId || 'unknown');
    }

    // Set loading false for writing tests, but keep true for speaking tests until AI finishes
    if (state.mode !== 'speaking' && state.mode !== 'speaking_practice') {
      setLoading(false);
    }
  }, [state, saveResult]);


  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Results</h2>
            <p className="text-gray-500 text-sm">Our system is instantly grading your spoken responses...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />
      {isPractice ? (
        // --- Practice Mode Result Display ---
        <main className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
              Practice Results: {section.charAt(0).toUpperCase() + section.slice(1)}
            </h1>

            <div className="text-center mb-8">
              <p className="text-lg font-medium text-gray-700">Your Score</p>
              {section === 'typing' ? (
                <div className="flex justify-center space-x-8">
                  <div><span className="text-5xl font-bold text-green-600">{results.wpm}</span> WPM</div>
                  <div><span className="text-5xl font-bold text-green-600">{results.accuracy}%</span> Accuracy</div>
                </div>
              ) : (
                <p className="text-6xl font-bold text-green-600">{score} / {questions.length}</p>
              )}
            </div>

            <div className="space-y-4">
              {Array.isArray(results) && results.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="font-semibold text-gray-700 mb-2">Q{index + 1}: {result.question?.replace('___', '...') || result.question?.replace(/\//g, ' ')}</p>
                  <p className={`text-sm ${result.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    Your Answer: <span className="font-bold">{result.userAnswer}</span>
                    {result.isCorrect ? ' (Correct)' : ` (Incorrect)`}
                  </p>
                  {!result.isCorrect && (
                    <p className="text-sm text-gray-600">
                      Correct Answer: <span className="font-bold">{result.correctAnswer}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-8 space-x-4">
              <Link
                to={`/practice/${section}`}
                state={{ fromResult: true }}
                className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors"
              >
                Next Test
              </Link>
              <Link
                to="/practice"
                className="inline-block text-green-600 font-bold py-3 px-8"
              >
                Back to Practice Hub
              </Link>
            </div>
          </div>
        </main>
      ) : (
        // --- Full Test Result Display ---
        <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
          <div className={`bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 transition-all ${isLocked ? 'blur-md pointer-events-none select-none' : ''}`}>
            {/* Header Section */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 p-10 sm:p-14 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(99,102,241,0.4)] border border-white/20">
                  <FaTrophy className="text-5xl text-yellow-400 drop-shadow-lg" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                  Performance Report
                </h1>
                <p className="text-indigo-200 text-lg flex items-center gap-2 font-medium">
                  <FaClipboardList className="text-indigo-300" /> Test ID: {testId} <span className="text-indigo-500 mx-2">•</span> {state.mode === 'speaking' ? 'Speaking & Listening' : 'Reading & Writing'}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-12 bg-gray-50/50">
              {/* Top Analytics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                {/* Score Card */}
                <div className={`lg:col-span-4 rounded-3xl p-8 border shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col items-center justify-center group hover:-translate-y-1 transition-transform duration-300 ${score < 65 ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                  <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                    <FaBullseye className={score < 65 ? "text-[12rem] text-red-900" : "text-[12rem] text-emerald-900"} />
                  </div>
                  <h3 className={`${score < 65 ? 'text-red-400' : 'text-emerald-500'} font-bold tracking-[0.2em] uppercase text-xs mb-2 relative z-10`}>Your Versant Score</h3>
                  <div className="relative z-10 flex items-baseline gap-2 mb-4">
                    <span className={`text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br drop-shadow-sm ${score < 65 ? 'from-red-600 to-orange-600' : 'from-emerald-600 to-teal-600'}`}>
                      {score}
                    </span>
                    <span className="text-2xl text-gray-400 font-bold">/ 80</span>
                  </div>
                  
                  {/* The MNC Hiring Cutoff Visual */}
                  <div className="w-full relative z-10 mt-2 mb-2 flex flex-col items-center text-center">
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-2 relative">
                        <div className="absolute h-full bg-red-400 w-[80%] left-0"></div>
                        <div className="absolute h-full bg-emerald-400 w-[20%] right-0"></div>
                        <div className="absolute h-4 w-1 bg-gray-900 top-1/2 -translate-y-1/2 left-[81%] shadow-sm"></div>
                        <div className="absolute h-full bg-black rounded-full transition-all duration-1000 ease-out" style={{ width: `${(score / 80) * 100}%`, backgroundColor: score < 65 ? '#dc2626' : '#059669' }}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 tracking-wider">TARGET MNC CUTOFF: <span className="text-gray-900">65+</span></span>
                  </div>

                  {score < 65 && (
                    <div className="w-full mt-5 bg-gradient-to-r from-red-600 to-rose-600 border-2 border-red-400 rounded-2xl p-4 text-center relative z-10 shadow-[0_0_30px_rgba(220,38,38,0.4)] transform hover:scale-[1.02] transition-transform animate-pulse">
                        <span className="text-yellow-300 font-black text-lg block tracking-widest uppercase drop-shadow-md">⚠️ DANGER ZONE</span>
                        <span className="text-white text-[12px] font-bold leading-relaxed block mt-2 tracking-wide uppercase">You are currently <u className="decoration-yellow-300 underline-offset-4 decoration-2">NOT READY</u> to pass top MNC interviews.</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 mt-4 relative z-10 w-full">
                    <div className="inline-flex justify-center items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-full font-bold text-sm shadow-sm opacity-50">
                      <FaGlobe className="text-emerald-500" /> Global Scale of English
                    </div>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300">
                  <h3 className="text-gray-800 font-extrabold text-xl mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FaChartLine />
                    </div>
                    Skill Breakdown
                  </h3>
                  <div className="h-64 md:h-80 w-full relative -ml-4 sm:ml-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={
                        Array.isArray(results) ? results.map(r => ({
                          subject: r.section.replace(' ', '\n'),
                          Accuracy: (typeof r.score !== 'undefined' && r.total) ? Math.round((r.score / r.total) * 100) : (r.score || 0),
                          fullMark: 100
                        })) : []
                      }>
                        <PolarGrid stroke="#f3f4f6" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Accuracy %" dataKey="Accuracy" stroke="#6366f1" strokeWidth={4} fill="#818cf8" fillOpacity={0.3} dot={{ r: 4, fill: '#4f46e5' }} />
                        <Tooltip
                          formatter={(value) => [`${value}%`, 'Accuracy']}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', fontWeight: 'bold', padding: '12px' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-md">
                    <FaClipboardList />
                  </div>
                  Detailed Analysis
                </h3>

                <div className="space-y-6">
                  {Array.isArray(results) && results.map((sectionResult, index) => (
                    <div key={index} className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                      {/* Section Header */}
                      <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          <span className="w-2 h-6 bg-indigo-500 rounded-full mr-1"></span>
                          {sectionResult.section}
                        </h2>
                        {sectionResult.section === 'Typing' ? (
                          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-medium">Speed:</span>
                            <span className="text-lg font-black text-indigo-600">{sectionResult.wpm} WPM</span>
                            <span className="w-px h-4 bg-gray-300 mx-1"></span>
                            <span className="text-sm text-gray-500 font-medium">Accuracy:</span>
                            <span className="text-lg font-black text-green-600">{sectionResult.accuracy}%</span>
                          </div>
                        ) : (
                          typeof sectionResult.score !== 'undefined' && (
                            <div className="bg-white px-5 py-2 rounded-xl border border-gray-200 shadow-sm flex items-baseline gap-2">
                              <span className="text-xl font-black text-indigo-600">{sectionResult.score}</span>
                              <span className="text-gray-400 font-bold">/ {sectionResult.total}</span>
                            </div>
                          )
                        )}
                      </div>

                      {/* Questions List */}
                      <div className="p-6 space-y-4">
                        {sectionResult.questions && sectionResult.questions.map((res, qIndex) => (
                          <div key={qIndex} className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-indigo-100 transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-sm">
                                {qIndex + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 mb-3 text-lg leading-snug">
                                  {res.question?.replace('___', '...')?.replace(/\//g, ' ')}
                                </p>

                                <div className={`inline-block px-4 py-3 rounded-xl border mb-3 shadow-sm w-full sm:w-auto ${res.score === 0 || res.isCorrect === false ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-200'}`}>
                                  <span className="text-xs uppercase tracking-wider font-bold text-gray-400 block mb-1">Your Answer</span>
                                  <span className={`font-semibold text-base break-words ${res.score === 0 || res.isCorrect === false ? 'text-red-700' : 'text-gray-900'}`}>
                                    {res.userAnswer || "No Answer Given"}
                                  </span>
                                </div>

                                {/* Sub-score display for Passage/Email */}
                                {typeof res.score !== 'undefined' && (
                                  <div className="mt-1 mb-3 inline-flex items-center gap-2 text-sm text-indigo-700 font-bold bg-indigo-50/80 px-3 py-1.5 rounded-lg border border-indigo-100">
                                    Score: {res.score}/10
                                    {res.matchPercentage && <span className="text-indigo-500 font-medium ml-2 border-l border-indigo-200 pl-2">Keywords Matched: {res.matchPercentage}%</span>}
                                  </div>
                                )}

                                {/* AI Feedback Display */}
                                {res.aiFeedback && !res.aiFeedback.error && (
                                  <div className="mt-4 overflow-hidden rounded-2xl border border-indigo-100/50 bg-gradient-to-r from-indigo-50/30 to-violet-50/30">
                                    <div className="bg-indigo-50/80 px-4 py-2 border-b border-indigo-100/50 flex items-center gap-2">
                                      <span className="text-xl">✨</span>
                                      <h4 className="text-indigo-900 font-black text-sm uppercase tracking-wide">AI Analysis</h4>
                                    </div>
                                    <div className="p-4 text-sm text-indigo-900/80 space-y-3">
                                      {res.aiFeedback.grammar_feedback && (
                                        <div className="flex items-start gap-2">
                                          <span className="font-bold text-indigo-900 whitespace-nowrap">Feedback:</span>
                                          <span className="leading-relaxed">{res.aiFeedback.grammar_feedback}</span>
                                        </div>
                                      )}
                                      {res.aiFeedback.missing_points && res.aiFeedback.missing_points.length > 0 && (
                                        <div>
                                          <span className="font-bold text-indigo-900 block mb-1">Missing Points:</span>
                                          <div className="flex flex-wrap gap-2">
                                            {res.aiFeedback.missing_points.map((pt, k) => (
                                              <span key={k} className="px-2.5 py-1 bg-white rounded-lg border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-sm">{pt}</span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {!res.aiFeedback.grammar_feedback && !res.aiFeedback.missing_points && (
                                        <p className="italic">No specific improvements found.</p>
                                      )}
                                      {res.aiFeedback.ideal_response && (
                                        <div className="mt-4 pt-4 border-t border-indigo-100/50">
                                          <span className="font-bold text-indigo-900 block mb-2 flex items-center gap-2"><FaStar className="text-yellow-500" /> Optimal Response</span>
                                          <div className="bg-white p-3 rounded-xl border border-indigo-50 shadow-sm text-indigo-950 font-medium italic leading-relaxed">
                                            "{res.aiFeedback.ideal_response}"
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Correct Answer Fallback */}
                                {(typeof res.isCorrect !== 'undefined' && !res.isCorrect) && (
                                  <div className="mt-3 text-sm flex items-center gap-2 text-gray-600 bg-gray-100/50 px-3 py-2 rounded-lg w-max">
                                    <FaCheckCircle className="text-green-500" /> Correct Answer: <span className="font-bold text-gray-800">{res.correctAnswer}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Full Email AI Advanced Card */}
                        {sectionResult.aiAnalysis && !sectionResult.aiAnalysis.error && sectionResult.section === 'Email Writing' && (
                          <div className="mt-6 mb-2 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 overflow-hidden shadow-lg">
                            <div className="bg-violet-900 px-6 py-4 flex items-center justify-between text-white">
                              <h4 className="font-black flex items-center gap-2 text-lg">
                                <span className="text-2xl">🤖</span> AI Advanced Grader
                              </h4>
                              <span className="px-3 py-1 bg-violet-700 rounded-full text-xs font-bold tracking-wider uppercase border border-violet-500 shadow-inner">
                                CEFR Level: {sectionResult.aiAnalysis.cefr_level || 'N/A'}
                              </span>
                            </div>

                            <div className="p-6">
                                <div className="space-y-5 text-violet-950">
                                  <div className="bg-white/60 p-4 rounded-xl border border-violet-100">
                                    <strong className="block text-violet-900 mb-1 text-sm uppercase tracking-wide">Analysis</strong>
                                    <p className="leading-relaxed">{sectionResult.aiAnalysis.feedback || "No feedback generated."}</p>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm font-bold bg-white/60 w-max px-4 py-2 rounded-xl border border-violet-100">
                                    <span className="text-violet-500 uppercase tracking-widest text-xs">Tone</span>
                                    {sectionResult.aiAnalysis.tone_analysis || "Not analyzed"}
                                  </div>

                                  {sectionResult.aiAnalysis.corrections && sectionResult.aiAnalysis.corrections.length > 0 && (
                                    <div>
                                      <strong className="block text-violet-900 mb-2 text-sm uppercase tracking-wide">Corrections Made</strong>
                                      <ul className="space-y-2">
                                        {sectionResult.aiAnalysis.corrections.map((c, k) => (
                                          <li key={k} className="flex items-start gap-2 bg-white/80 p-3 rounded-xl shadow-sm border border-violet-100 text-sm">
                                            <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex flex-shrink-0 items-center justify-center font-bold text-xs mt-0.5">{k + 1}</span>
                                            <span className="leading-relaxed">{c}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {sectionResult.aiAnalysis.ideal_response && (
                                    <div className="mt-6 pt-6 border-t border-violet-200">
                                      <strong className="block text-violet-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                                        <FaStar className="text-yellow-500 text-lg" /> Improved AI Draft
                                      </strong>
                                      <div className="italic text-violet-900 bg-white p-5 rounded-2xl shadow-sm border border-violet-100 whitespace-pre-wrap font-serif leading-relaxed text-lg">
                                        {sectionResult.aiAnalysis.ideal_response}
                                      </div>
                                    </div>
                                  )}
                                </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons & Conversion CTA */}
              <div className="mt-16 bg-gradient-to-b from-gray-900 to-black p-8 sm:p-12 rounded-[2.5rem] border border-gray-800 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-10">
                    <FaTrophy className="text-[15rem] text-white" />
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 z-10">Don't let these mistakes cost you your dream job.</h2>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 z-10 font-medium">
                  Candidates who practice 5+ Mock Tests identify their deep flaws and improve their score by an average of <span className="text-emerald-400 font-black">14 points</span>.
                </p>

                <Link
                  to="/pricing"
                  className="z-10 w-full sm:w-auto inline-flex items-center justify-center gap-3 flex-wrap bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-900 font-extrabold py-5 px-12 rounded-2xl transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:-translate-y-1 text-xl sm:text-2xl"
                >
                  <FaStar className="animate-pulse flex-shrink-0" /> <span className="whitespace-nowrap">Unlock 19 Premium Tests</span> <span className="opacity-60 hidden sm:inline px-2">|</span> <span className="whitespace-nowrap">₹1250 Only</span>
                </Link>

                <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4 mt-8 z-10 w-full">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center justify-center bg-gray-800 text-gray-300 font-bold py-3 px-6 sm:px-8 rounded-xl hover:bg-gray-700 transition-all hover:-translate-y-1 text-sm border border-gray-700 w-full sm:w-auto"
                    >
                      Return to Dashboard
                    </Link>
                    <button 
                      onClick={handleNativeShare}
                      className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-blue-400 font-bold py-3 px-6 sm:px-8 rounded-xl transition-all hover:-translate-y-1 text-sm border border-gray-700 w-full sm:w-auto"
                    >
                       Share Target Score 
                    </button>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(`I just scored ${score}/80 on the Versant AI test! Take a free demo and check your fluency level: https://versantpro.com`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 font-bold py-3 px-6 sm:px-8 rounded-xl transition-all hover:-translate-y-1 text-sm border border-gray-700 w-full sm:w-auto"
                    >
                       WhatsApp
                    </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Google & Email Auth Trap Modal Overlay */}
          {isLocked && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-100 py-8 px-6 text-center my-6">
                <div className="absolute top-0 left-0 h-2 bg-indigo-500 w-full"></div>
                
                <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Save Your Progress</h2>
                <p className="text-gray-500 mb-6 font-medium text-sm">Create a free account or log in to unlock your detailed AI performance report and save your score forever.</p>
                
                <button 
                  onClick={handleGoogleSignIn}
                  className="w-full flex justify-center items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-800 font-bold hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.238-2.626-.611-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.649-3.342-11.124-7.854l-6.571 4.819C9.656 39.663 16.318 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.237-2.626-.611-3.917z"/></svg>
                  Continue with Google
                </button>

                <div className="flex items-center my-5">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-3 text-gray-400 text-xs font-bold uppercase tracking-widest">OR</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                  {authError && <div className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{authError}</div>}
                  <div>
                    <input 
                      type="email" 
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="Email Address" 
                      className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                     <input 
                      type="password" 
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Password" 
                      className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                    />
                  </div>
                  <button type="submit" className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 text-sm">
                    {isLoginView ? 'Log In & View Score' : 'Create Account & View Score'}
                  </button>
                </form>
                
                <p className="mt-5 text-sm outline-none">
                  {isLoginView ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => {setIsLoginView(!isLoginView); setAuthError('');}} className="font-bold text-indigo-600 hover:text-indigo-800 underline focus:outline-none">
                    {isLoginView ? "Sign up" : "Log in"}
                  </button>
                </p>

                <div className="mt-6 text-gray-400 text-xs font-semibold flex items-center justify-center gap-1">
                   <FaCheckCircle className="text-indigo-500"/> Guaranteed Spam-Free
                </div>
              </div>
            </div>
          )}

        </main>
      )}
      <Footer />
    </div>
  );
}

export default ResultPage;