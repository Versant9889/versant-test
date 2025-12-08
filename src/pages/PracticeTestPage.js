import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import masterTest from '../data/masterTest.json';
import ScoreCard from '../components/ScoreCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './TestPage.css';

const PracticeTestPage = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [questionPage, setQuestionPage] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const getInitialTime = () => {
    switch (section) {
      case 'typing':
        return 60;
      case 'sentenceCompletion':
      case 'fillBlanks':
        return 15;
      case 'emailWriting':
        return 300;
      case 'passageReconstruction':
        return 120;
      default:
        return 30; // for jumbledWords
    }
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTime());
  const [showDetailedScore, setShowDetailedScore] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('test-page-active');
    return () => {
      document.body.classList.remove('test-page-active');
    };
  }, []);

  const loadQuestions = () => {
    const sectionQuestions = masterTest[section] || [];
    const questionsPerPage = (section === 'typing' || section === 'emailWriting' || section === 'passageReconstruction') ? 1 : 20;
    const startIndex = questionPage * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const newQuestions = sectionQuestions.slice(startIndex, endIndex);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowScore(false);
    setShowInstructions(true);
    setShowDetailedScore(false);
    setScore(0);
    setTimeLeft(getInitialTime());
  };

  useEffect(() => {
    loadQuestions();
  }, [section, questionPage]);

  const speakInstruction = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (showInstructions) {
      const time = getInitialTime();
      const instructionText = `This section is ${section.replace(/([A-Z])/g, ' $1').trim()}. You will have ${time} seconds. Click 'Start Section' to begin.`;
      speakInstruction(instructionText);
    }
  }, [showInstructions, section]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(getInitialTime());
    } else {
      handleSubmit();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !showInstructions && !showScore) {
        if (section !== 'typing' && section !== 'emailWriting' && section !== 'passageReconstruction') {
          handleNextQuestion();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestionIndex, showInstructions, showScore, section]);

  useEffect(() => {
    if (!showInstructions && !showScore) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, showInstructions, showScore]);

  useEffect(() => {
    if (!showInstructions && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestionIndex, showInstructions]);

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers({ ...userAnswers, [questionId]: answer });
  };

  const handleSubmit = () => {
    if (section === 'typing') {
      const question = questions[0]; // Only one question for typing
      const userAnswer = userAnswers[question.id] || '';
      const inputWords = userAnswer.trim().split(/\s+/).filter(Boolean);
      const referenceWords = question.paragraph.trim().split(/\s+/).filter(Boolean);
      let correctWords = 0;
      for (let i = 0; i < inputWords.length; i++) {
        if (i < referenceWords.length && inputWords[i] === referenceWords[i]) {
          correctWords++;
        }
      }
      const timeTaken = getInitialTime() - timeLeft;
      const wpm = timeTaken > 0 ? Math.round((correctWords / timeTaken) * 60) : 0;
      setScore(wpm);
    } else if (section === 'emailWriting' || section === 'passageReconstruction') {
        setScore(0); // No auto-scoring for these sections
    } else {
      let newScore = 0;
      questions.forEach(question => {
        const userAnswer = userAnswers[question.id];
        if (typeof userAnswer === 'string' && typeof question.answer === 'string') {
          if (userAnswer.trim().toLowerCase() === question.answer.toLowerCase()) {
            newScore++;
          }
        } else if (userAnswer === question.answer) {
          newScore++;
        }
      });
      setScore(newScore);
    }
    setShowScore(true);
  };

  const handleTakeAnotherTest = () => {
    setQuestionPage(prevPage => prevPage + 1);
  };
  
  const handleExitTest = () => {
    if (window.confirm('Are you sure you want to exit the test? Your progress will be lost.')) {
      navigate('/practice');
    }
  };

  const getQuestionText = (question) => {
    if (!question) return '';
    switch (section) {
        case 'jumbledWords':
            return question.jumbled.replace(/\//g, ' ');
        case 'typing':
            return question.paragraph;
        case 'emailWriting':
            return question.prompt;
        case 'passageReconstruction':
            return question.sentences;
        default:
            return question.question;
    }
  }

  const renderQuestion = (question) => {
    switch (section) {
      case 'fillBlanks':
        return (
          <div className="space-y-2 mt-4 text-left">
            {question.options.map((option, i) => (
              <label key={i} className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/20">
                <input
                  ref={i === 0 ? inputRef : null}
                  type="radio"
                  value={option}
                  checked={userAnswers[question.id] === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                  className="h-4 w-4 text-green-300 bg-transparent border-white/50 focus:ring-green-300"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'jumbledWords':
      case 'sentenceCompletion':
        return (
          <input
            ref={inputRef}
            type="text"
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            value={userAnswers[question.id] || ''}
            className="test-input"
          />
        );
      case 'typing':
      case 'emailWriting':
      case 'passageReconstruction':
        return (
          <textarea
            ref={inputRef}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            value={userAnswers[question.id] || ''}
            className="test-textarea h-48"
            placeholder="Start writing..."
          />
        );
      default:
        return <p>Unsupported question type.</p>;
    }
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="test-container-glass max-w-md">
          <button onClick={handleExitTest} className="test-btn-exit-corner">
            &times;
          </button>
          <h2 className="test-title">{section.replace(/([A-Z])/g, ' $1').trim()}</h2>
          <div className="test-question-area">
            <p className="test-subtitle">
              This section is {section.replace(/([A-Z])/g, ' $1').trim()}. You will have {getInitialTime()} seconds. Click 'Start Section' to begin.
            </p>
          </div>
          <button onClick={() => setShowInstructions(false)} className="test-btn test-btn-primary">Start Section</button>
        </div>
      </div>
    );
  }

  if (showScore) {
    if (showDetailedScore) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="test-container-glass">
                <ScoreCard score={score} total={questions.length} questions={questions} userAnswers={userAnswers} />
                <div className="flex justify-center mt-4 space-x-4">
                    <button
                        onClick={() => setShowDetailedScore(false)}
                        className="test-btn test-btn-secondary"
                    >
                        Back to Summary
                    </button>
                    <button
                        onClick={handleTakeAnotherTest}
                        className="test-btn test-btn-primary"
                    >
                        Take Another Test
                    </button>
                    <button
                        onClick={() => navigate('/practice')}
                        className="test-btn test-btn-secondary"
                    >
                        Back to Practice Hub
                    </button>
                </div>
            </div>
          </div>
        );
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="test-container-glass bg-green-900 text-white">
            <h2 className="test-title">Test Complete!</h2>
            <p className="test-subtitle">
              {section === 'typing'
                ? `Your score is ${score} WPM.`
                : (section === 'emailWriting' || section === 'passageReconstruction')
                ? 'You have completed the section.'
                : `You scored ${score} out of ${questions.length}.`
              }
            </p>
                        <div className="flex justify-center mt-4 space-x-4">
                            <button
                                onClick={() => setShowDetailedScore(true)}
                                className="test-btn test-btn-primary"
                            >
                                View Detailed Scorecard
                            </button>
                            <button
                                onClick={handleTakeAnotherTest}
                                className="test-btn test-btn-secondary"
                            >
                                Take Another Test
                            </button>
                            <button
                                onClick={() => navigate('/practice')}
                                className="test-btn test-btn-secondary"
                            >
                                Back to Practice Hub
                            </button>
                        </div>        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        {questions.length > 0 && currentQuestion ? (
          <div className="test-container-glass">
             <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">{section.replace(/([A-Z])/g, ' $1').trim()}</h2>
            <p className="test-subtitle">Question {currentQuestionIndex + 1} of {questions.length}</p>
            <div className="timer-display-circular">
              <div className="timer-text-circular">{timeLeft}s</div>
            </div>
            <div className="test-question-area">
                <p>{getQuestionText(currentQuestion)}</p>
            </div>
            {renderQuestion(currentQuestion)}
            <button
                onClick={handleNextQuestion}
                className="test-btn test-btn-primary"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Submit'}
              </button>
          </div>
        ) : (
          <p>Loading questions or no more questions available...</p>
        )}
      </div>
    </>
  );
};

export default PracticeTestPage;