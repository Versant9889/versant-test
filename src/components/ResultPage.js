import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import Footer from './Footer';
import Header from './Header';

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
  const dataSavedRef = React.useRef(false);

  // AI Evaluation Effect
  useEffect(() => {
    if (!state || !state.emailInput) return;

    const runAIEvaluation = async () => {
      // Avoid re-running if we already have AI data or if key is missing/limit reached
      if (state.aiAnalysisDone) return;

      // Import lazily to avoid load issues if SDK not handy (though we installed it)
      const { evaluateWithAI } = await import('../utils/geminiScoring');

      // 1. Evaluate Email
      // We use a functional update or just local variables if we want to batch
      // But here we might want to show partial progress if we had a complex UI.
      // For now, let's do parallel execution.

      console.log("Starting AI Evaluation...");

      try {
        // Sequential execution to respect rate limits/reliability
        // 1. Evaluate Email
        let emailResult = await evaluateWithAI('email', {
          prompt: state.questions[39]?.prompt || "Write an email...",
          response: state.emailInput
        });

        // 2. Evaluate Passages in BATCH (to save API calls and avoid rate limits)
        const passageData = state.passageInputs.map((input, i) => ({
          original: state.questions[36 + i]?.sentences || "",
          response: input
        }));

        let passageResults = [];
        // Add a small delay between email and passage calls to be safe
        await new Promise(r => setTimeout(r, 2000));

        try {
          passageResults = await evaluateWithAI('passage_batch', passageData);
        } catch (e) {
          console.error("Batch Passage Error", e);
          passageResults = [];
        }

        console.log("AI Results:", emailResult, passageResults);

        // Update state with AI results so we can display them
        setResults(prevResults => {
          const newResults = [...prevResults]; // Shallow copy

          // Find and update Email Section
          const emailIdx = newResults.findIndex(r => r.section === 'Email Writing');
          if (emailIdx !== -1) {
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
          if (passIdx !== -1) {
            newResults[passIdx].aiAnalysis = passageResults;
            // Update individual question scores/feedback
            // This is tricky because `questions` array inside result might correspond by index
            newResults[passIdx].questions = newResults[passIdx].questions.map((q, i) => ({
              ...q,
              aiFeedback: passageResults[i]
            }));

            // Recalculate total if valid
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

  // Handle case where state is missing (e.g., direct navigation to /results)
  useEffect(() => {
    if (!state) {
      setLoading(false);
      return;
    }

    if (dataSavedRef.current) return;

    const saveResult = async (resultData) => {
      try {
        // Safe guard: Check session storage to prevent duplicate saves on refresh/back-nav
        const savedTests = JSON.parse(sessionStorage.getItem('versant_saved_tests') || '[]');
        const resultSignature = `${testId}_${new Date().toDateString()}`; // Simple daily check or strictly by ID if ID is unique per attempt
        // actually testId is 1..20, reusing it is possible. 
        // But in a single session, we shouldn't save the EXACT same result twice.
        // Let's use a flag in history state if possible, but sessionStorage is easier.
        // We will assume if the exact same test items are present, it's a dupe.

        // Better: Use a session-lived ID for the attempt? 
        // For now, let's just ensure we don't save the SAME testId twice in the last 1 minute?
        // Or simply trust the user won't take the saved test again immediately?

        // Let's use the 'dataSavedRef' for strict single-mount, and sessionStorage for refresh.
        // We can store a unique token for the *current evaluation*.
        // But we don't have a unique token in state. 

        // fallback: check if we saved this testId very recently?
        const lastSaved = sessionStorage.getItem(`last_saved_${testId}`);
        if (lastSaved && (Date.now() - parseInt(lastSaved)) < 60000 * 5) {
          console.log("Result already saved recently. Skipping.");
          return;
        }

        const user = auth.currentUser;
        if (user) {
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
    };

    if (isPractice) {
      // This is the logic for the practice hub tests, which the user said is working.
      // I am not touching this.
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

    } else {
      // This is the logic for the full test from the dashboard.
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
      dataSavedRef.current = true; // Mark as saved
      saveResult({
        testId: testId || 'unknown',
        totalScore,
        sections: detailedResults,
        type: 'full_test'
      });
    }

    setLoading(false);
  }, [state]);


  return (
    <div className="bg-gray-100 min-h-screen">
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
        <main className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Test Result</h1>
            <p className="text-center text-gray-600 mb-6">Test ID: {testId}</p>

            <div className="text-center mb-8">
              <p className="text-lg font-medium text-gray-700">Overall Score</p>
              <p className="text-6xl font-bold text-green-600">{score}</p>
            </div>

            <div className="space-y-8">
              {Array.isArray(results) && results.map((sectionResult, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {sectionResult.section}
                    </h2>
                    {sectionResult.section === 'Typing' ? (
                      <span className="text-xl font-bold text-gray-700">{sectionResult.wpm} WPM</span>
                    ) : (
                      typeof sectionResult.score !== 'undefined' && (
                        <span className="text-xl font-bold text-gray-700">{sectionResult.score} / {sectionResult.total}</span>
                      )
                    )}
                  </div>

                  {sectionResult.section === 'Typing' && (
                    <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                      <p>Accuracy: <span className="font-bold">{sectionResult.accuracy}%</span></p>
                    </div>
                  )}

                  {sectionResult.questions && sectionResult.questions.map((res, qIndex) => (
                    <div key={qIndex} className={`p-4 mt-4 rounded-lg border ${res.isCorrect === false ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <p className="font-semibold text-gray-700 mb-2">
                        Q{qIndex + 1}: {res.question?.replace('___', '...')?.replace(/\//g, ' ')}
                      </p>
                      <p className={`text-sm ${res.isCorrect ? 'text-green-700' : 'text-gray-800'}`}>
                        Your Answer: <span className="font-bold">{res.userAnswer}</span>
                      </p>

                      {/* Sub-score display for Passage/Email */}
                      {typeof res.score !== 'undefined' && (
                        <div className="mt-2 text-sm text-indigo-600 font-medium bg-indigo-50 p-2 rounded">
                          Score: {res.score}/10
                          {res.matchPercentage && ` (Keywords Matched: ${res.matchPercentage}%)`}
                        </div>
                      )}

                      {/* AI Feedback Display */}
                      {res.aiFeedback && !res.aiFeedback.error && (
                        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <h4 className="text-indigo-900 font-bold flex items-center gap-2">
                            <span className="text-xl">✨</span> AI Analysis
                          </h4>
                          <div className="text-sm text-indigo-800 mt-1">
                            {res.aiFeedback.grammar_feedback && <p><strong>Grammar:</strong> {res.aiFeedback.grammar_feedback}</p>}
                            {res.aiFeedback.missing_points && res.aiFeedback.missing_points.length > 0 && (
                              <div className="mt-1">
                                <strong>Missing Points:</strong>
                                <ul className="list-disc pl-5 mt-1">
                                  {res.aiFeedback.missing_points.map((pt, k) => <li key={k}>{pt}</li>)}
                                </ul>
                              </div>
                            )}
                            {!res.aiFeedback.grammar_feedback && !res.aiFeedback.missing_points && (
                              <p className="italic text-indigo-600">No specific improvements found.</p>
                            )}

                            {res.aiFeedback.ideal_response && (
                              <div className="mt-3 pt-2 border-t border-indigo-200">
                                <strong>🌟 Possible Response:</strong>
                                <p className="italic text-indigo-900 bg-white/50 p-2 rounded mt-1 border border-indigo-100">
                                  "{res.aiFeedback.ideal_response}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* AI Error Fallback */}
                      {res.aiFeedback && res.aiFeedback.error && (
                        <div className="mt-3 p-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded">
                          AI Analysis Failed: {res.aiFeedback.details || "Unknown Error"}
                        </div>
                      )}

                      {/* Fallback/Legacy Feedback for Email (modified to prioritize AI) */}
                      {!res.aiFeedback && res.feedback && (
                        <div className="mt-2 text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
                          <strong>Feedback:</strong> {res.feedback}
                        </div>
                      )}

                      {/* Email AI Analysis Specific UI */}
                      {sectionResult.aiAnalysis && sectionResult.section === 'Email Writing' && (
                        <div className="mt-3 p-4 bg-violet-50 border border-violet-200 rounded-lg shadow-sm">
                          {sectionResult.aiAnalysis.error ? (
                            <div className="text-red-500 font-bold">
                              AI Grading Error: {sectionResult.aiAnalysis.details || sectionResult.aiAnalysis.error}
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-violet-900 font-bold flex items-center gap-2">
                                  <span className="text-xl">🤖</span> AI Advanced Grader
                                </h4>
                                <span className="px-2 py-1 bg-violet-200 text-violet-800 rounded text-xs font-bold">
                                  CEFR Level: {sectionResult.aiAnalysis.cefr_level || 'N/A'}
                                </span>
                              </div>
                              <div className="text-sm text-violet-800 space-y-2">
                                <p><strong>Feedback:</strong> {sectionResult.aiAnalysis.feedback || "No feedback generated."}</p>
                                {sectionResult.aiAnalysis.corrections && sectionResult.aiAnalysis.corrections.length > 0 && (
                                  <div>
                                    <strong>Corrections:</strong>
                                    <ul className="list-disc pl-5 mt-1 bg-white/50 p-2 rounded">
                                      {sectionResult.aiAnalysis.corrections.map((c, k) => <li key={k}>{c}</li>)}
                                    </ul>
                                  </div>
                                )}
                                <p><strong>Tone:</strong> {sectionResult.aiAnalysis.tone_analysis || "Not analyzed"}</p>

                                {sectionResult.aiAnalysis.ideal_response && (
                                  <div className="mt-3 pt-3 border-t border-violet-200">
                                    <strong>🌟 Improved AI Draft:</strong>
                                    <div className="italic text-violet-900 bg-white/60 p-3 rounded mt-2 border border-violet-100 whitespace-pre-wrap font-serif">
                                      {sectionResult.aiAnalysis.ideal_response}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {(typeof res.isCorrect !== 'undefined' && !res.isCorrect) && (
                        <p className="text-sm text-gray-600 mt-1">
                          Correct Answer: <span className="font-bold">{res.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/dashboard"
                className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      )}
      <Footer />
    </div>
  );
}

export default ResultPage;