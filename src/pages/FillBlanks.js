import React, { useState, useEffect, useRef } from 'react';
import Footer from '../components/Footer';

const FillBlanks = ({ questions, onTimeUp, answers, onAnswerChange }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
            return 30;
          } else {
            clearInterval(timer);
            onTimeUp();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestionIndex, questions.length, onTimeUp]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentQuestionIndex]);

  const handleOptionChange = (option) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = option;
    onAnswerChange(newAnswers);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="test-container-glass">
          <h2 className="test-title">Fill in the Blanks</h2>
          <p className="test-subtitle">Question {currentQuestionIndex + 1} of {questions.length}</p>
          <div className="timer-display-circular">
            <div className="timer-text-circular">{timeLeft}s</div>
          </div>
          <div className="test-question-area">
            <p>{currentQuestion?.question}</p>
            <div className="space-y-2 mt-4">
              {currentQuestion?.options.map((option, i) => (
                <label key={i} className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/20">
                  <input ref={i === 0 ? inputRef : null} type="radio" value={option} checked={answers[currentQuestionIndex] === option} onChange={() => handleOptionChange(option)} className="h-4 w-4 text-green-300 bg-transparent border-white/50 focus:ring-green-300" />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FillBlanks;