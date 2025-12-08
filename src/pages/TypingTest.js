import React, { useState, useEffect, useRef } from 'react';
import Footer from '../components/Footer';

const TypingTest = ({ paragraph, timeLimit, onTimeUp, inputValue, onInputChange }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const inputRef = useRef(null);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onTimeUp();
    }
  }, [timeLeft, onTimeUp]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="test-container-glass">
          <h2 className="test-title">Typing Test</h2>
          <div className="timer-display-circular">
            <div className="timer-text-circular">{formatTime(timeLeft)}</div>
          </div>
          <div className="test-question-area">
            <p>{paragraph}</p>
          </div>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            className="test-textarea h-48"
            placeholder="Start typing the text above..."
            autoFocus
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TypingTest;