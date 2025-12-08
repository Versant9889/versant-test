import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import masterData from '../../data/masterTest.json';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../TestPage.css';

const SentenceBuilds = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [testCompleted, setTestCompleted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Load jumbled words questions from masterData
    const jumbledWordsQuestions = masterData.jumbledWords;
    // Shuffle and pick 20 questions
    const shuffled = [...jumbledWordsQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 20);
    setQuestions(selectedQuestions);
    setAnswers(Array(20).fill(''));
  }, []);

  useEffect(() => {
    if (questions.length > 0 && !testCompleted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleNextQuestion();
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, questions, testCompleted]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentQuestionIndex]);

  const handleAnswerChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(20);
    } else {
      setTestCompleted(true);
    }
  };

  if (testCompleted) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass">
            <h2 className="test-title">Practice Complete!</h2>
            <p className="test-subtitle">You have completed the Sentence Builds practice.</p>
            <Link to="/practice" className="test-btn test-btn-primary mt-4">
              Back to Practice Hub
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="test-container-glass">
          <h2 className="test-title">Sentence Builds</h2>
          <div className="w-full px-4">
            <div className="flex justify-between text-sm font-medium text-white mb-1">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2.5">
              <div className="bg-green-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="timer-display-circular">
            <div className="timer-text-circular">{timeLeft}s</div>
          </div>
          <div className="test-question-area">
            <p>Unscramble these words to make a correct sentence:</p>
            <p className="text-xl font-bold mt-2">{currentQuestion?.jumbled.replace(/\//g, ' ')}</p>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={answers[currentQuestionIndex] || ''}
            onChange={handleAnswerChange}
            placeholder="Type the correct sentence..."
            className="test-input"
            autoFocus
          />
          <button
            onClick={handleNextQuestion}
            className="test-btn test-btn-primary mt-4"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SentenceBuilds;
