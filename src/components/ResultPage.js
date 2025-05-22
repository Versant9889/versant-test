import React from 'react';
import { useLocation } from 'react-router-dom';

export default function ResultPage() {
  const { state } = useLocation();
  const {
    testId,
    typingResults,
    sentenceAnswers,
    fillAnswers,
    jumbledAnswers,
    passageInputs,
    emailInput,
    questions,
  } = state || {};

  // Handle case where state is missing (e.g., direct navigation to /results)
  if (!state || !questions || !typingResults) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-2xl border border-green-200 rounded-lg shadow-sm bg-white">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl text-green-800 font-semibold">No Results Available</h2>
          </div>
          <div className="p-6">
            <p className="text-green-700">Please complete a test to view results.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
      <div className="w-full max-w-2xl border border-green-200 rounded-lg shadow-sm bg-white">
        <div className="p-6 border-b border-green-200">
          <h2 className="text-2xl text-green-800 font-semibold">Test {testId} Completed!</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Typing Test Results */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-green-800">Typing Test</h3>
            <p className="text-green-700">Speed: {typingResults.wpm} WPM</p>
            <p className="text-green-700">Accuracy: {typingResults.accuracy}%</p>
          </div>

          {/* Sentence Completion Results */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-green-800">Sentence Completion</h3>
            {questions.slice(1, 11).map((question, i) => (
              <div key={i} className="bg-green-100 p-3 rounded border border-green-200">
                <p className="text-green-800"><strong>Question:</strong> {question.question}</p>
                <p className="text-green-800"><strong>Your answer:</strong> {sentenceAnswers[i] || '(No answer)'}</p>
                <p className="text-green-800"><strong>Correct answer:</strong> {question.acceptableAnswers?.join(', ') || 'N/A'}</p>
              </div>
            ))}
          </div>

          {/* Fill in the Blanks Results */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-green-800">Fill in the Blanks</h3>
            {questions.slice(11, 21).map((question, i) => (
              <div key={i} className="bg-green-100 p-3 rounded border border-green-200">
                <p className="text-green-800"><strong>Question:</strong> {question.question}</p>
                <p className="text-green-800"><strong>Your answer:</strong> {fillAnswers[i] || '(No answer)'}</p>
                <p className="text-green-800"><strong>Correct answer:</strong> {question.answer || 'N/A'}</p>
              </div>
            ))}
          </div>

          {/* Jumbled Words Results */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-green-800">Jumbled Words</h3>
            {questions.slice(21, 36).map((question, i) => (
              <div key={i} className="bg-green-100 p-3 rounded border border-green-200">
                <p className="text-green-800"><strong>Jumbled words:</strong> {question.jumbled.replace(/\//g, ' ')}</p>
                <p className="text-green-800"><strong>Your answer:</strong> {jumbledAnswers[i] || '(No answer)'}</p>
                <p className="text-green-800"><strong>Correct answer:</strong> {question.answer || 'N/A'}</p>
              </div>
            ))}
          </div>

          {/* Passage Reconstruction Results */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-green-800">Passage Reconstruction</h3>
            {questions.slice(36, 39).map((passage, i) => (
              <div key={i} className="bg-green-100 p-3 rounded border border-green-200">
                <p className="text-green-800"><strong>Original Passage:</strong> {passage.sentences}</p>
                <p className="text-green-800"><strong>Your Reconstruction:</strong> {passageInputs[i] || '(No answer)'}</p>
              </div>
            ))}
          </div>

          {/* Email Writing Results */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-green-800">Email Writing</h3>
            <div className="bg-green-100 p-3 rounded border border-green-200">
              <p className="text-green-800"><strong>Prompt:</strong> {questions[39].prompt}</p>
              <p className="text-green-800"><strong>Your Response:</strong> {emailInput || '(No answer)'}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.reload()} // Simple way to restart; adjust as needed
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              Retake Test {testId}
            </button>
            <button
              className="w-full border border-green-600 text-green-600 hover:bg-green-50 py-2 px-4 rounded-md"
              disabled
            >
              View Detailed Results (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}