import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
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

  // Handle case where state is missing (e.g., direct navigation to /results)
  useEffect(() => {
    if (!state) {
      setLoading(false);
      return;
    }

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

    } else {
      // This is the logic for the full test from the dashboard.
      // This is what needs to be fixed.
      const detailedResults = [];
      let totalScore = 0;

      // Typing
      if (typingResults) {
        totalScore += typingResults.wpm || 0;
        detailedResults.push({
          section: 'Typing',
          wpm: typingResults.wpm,
          accuracy: typingResults.accuracy
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
      const passageResults = passageQs.map((q, i) => ({
        question: q.sentences,
        userAnswer: passageInputs[i] || 'Not Answered',
      }));
      detailedResults.push({ section: 'Passage Reconstruction', questions: passageResults });

      // Email Writing
      const emailQ = allQuestions[39];
      detailedResults.push({
        section: 'Email Writing',
        questions: [{ question: emailQ.prompt, userAnswer: emailInput || 'Not Answered' }]
      });

      setScore(totalScore);
      setResults(detailedResults);
    }

    setLoading(false);
  }, [state]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading results...</div>;
  }

  if (!state) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
          <div className="w-full max-w-2xl border border-green-200 rounded-lg shadow-sm bg-white text-center p-8">
              <h2 className="text-2xl text-green-800 font-semibold mb-4">No Results Available</h2>
              <p className="text-green-700 mb-6">Please complete a test to view your results.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md"
              >
                Go to Dashboard
              </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
                      <p className={`text-sm ${res.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        Your Answer: <span className="font-bold">{res.userAnswer}</span>
                      </p>
                      {(typeof res.isCorrect !== 'undefined' && !res.isCorrect) && (
                        <p className="text-sm text-gray-600">
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