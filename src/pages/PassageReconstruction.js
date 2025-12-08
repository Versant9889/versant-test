import React, { useState, useEffect, useRef } from 'react';
import Footer from '../components/Footer';

const PassageReconstruction = ({ questions, onTimeUp, passageInputs, onPassageInputChange }) => {
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [mode, setMode] = useState('read'); // 'read' or 'write'
  const [timeLeft, setTimeLeft] = useState(30); // 30s for reading, 90s for writing
  const inputRef = useRef(null);

  useEffect(() => {
    const readTime = 30;
    const writeTime = 90;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (mode === 'read') {
            setMode('write');
            return writeTime;
          } else { // mode === 'write'
            if (currentPassageIndex < questions.length - 1) {
              setCurrentPassageIndex(i => i + 1);
              setMode('read');
              return readTime;
            } else {
              clearInterval(timer);
              onTimeUp();
              return 0;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, currentPassageIndex, questions.length, onTimeUp]);

  useEffect(() => {
    if (mode === 'write') {
      inputRef.current?.focus();
    }
  }, [mode]);

  const handleInputChange = (e) => {
    const newInputs = [...passageInputs];
    newInputs[currentPassageIndex] = e.target.value;
    onPassageInputChange(newInputs);
  };

  const currentPassage = questions[currentPassageIndex];

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="test-container-glass">
          <h2 className="test-title">Passage Reconstruction</h2>
          <p className="test-subtitle">Passage {currentPassageIndex + 1} of {questions.length}</p>
          <div className="timer-display-circular">
            <div className="timer-text-circular">{timeLeft}s</div>
          </div>
          {mode === 'read' ? (
            <div className="test-question-area"><p>{currentPassage?.sentences}</p></div>
          ) : (
            <textarea ref={inputRef} value={passageInputs[currentPassageIndex]} onChange={handleInputChange} className="test-textarea h-48" placeholder="Rewrite the passage in your own words..." autoFocus />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PassageReconstruction;