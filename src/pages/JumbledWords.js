import React, { useState, useEffect, useRef } from 'react';
import Footer from '../components/Footer';

const JumbledWords = ({ questions, onTimeUp, answers, onAnswerChange }) => {
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

  const handleInputChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    onAnswerChange(newAnswers);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="test-container-glass">
          <h2 className="test-title">Sentence Builds</h2>
          <p className="test-subtitle">Question {currentQuestionIndex + 1} of {questions.length}</p>
          <div className="timer-display-circular">
            <div className="timer-text-circular">{timeLeft}s</div>
          </div>
          <div className="test-question-area">
            <p>Unscramble these words to make a correct sentence:</p>
            <p className="text-xl font-bold mt-2">{currentQuestion?.jumbled.replace(/\//g, ' ')}</p>
          </div>
          <input ref={inputRef} type="text" value={answers[currentQuestionIndex]} onChange={handleInputChange} className="test-input" autoFocus />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JumbledWords;