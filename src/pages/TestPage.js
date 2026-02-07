import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import masterData from '../data/masterTest.json';
import Footer from '../components/Footer';
import './TestPage.css';
import { gradeEmail, gradePassage } from '../utils/scoringUtils';

export default function TestPage() {
  // Add a class to the body when the component mounts, and remove it when it unmounts
  useEffect(() => {
    document.body.classList.add('test-page-active');
    return () => {
      document.body.classList.remove('test-page-active');
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { testId } = location.state || {};
  const [currentTest, setCurrentTest] = useState('typing');
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true); // Toggle instructions


  // Typing test state
  const [typingTimeLeft, setTypingTimeLeft] = useState(60); // 1 minute

  // Typing test state
  const [typingInput, setTypingInput] = useState('');
  const [typingResults, setTypingResults] = useState({ wpm: 0, accuracy: 0 });

  // Sentence completion state
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentenceAnswers, setSentenceAnswers] = useState([]);
  const [sentenceTimeLeft, setSentenceTimeLeft] = useState(15); // 15 seconds per question
  const sentenceInputRef = useRef(null);

  // Fill in blanks state
  const [currentFillIndex, setCurrentFillIndex] = useState(0);
  const [fillAnswers, setFillAnswers] = useState([]);
  const [fillTimeLeft, setFillTimeLeft] = useState(30); // 30 seconds per question
  const fillInputRef = useRef(null);

  // Jumbled words state
  const [currentJumbledIndex, setCurrentJumbledIndex] = useState(0);
  const [jumbledAnswers, setJumbledAnswers] = useState([]);
  const [jumbledTimeLeft, setJumbledTimeLeft] = useState(30); // 30 seconds per question
  const jumbledInputRef = useRef(null);

  // Passage reconstruction state
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [passageInputs, setPassageInputs] = useState([]);
  const [passageInput, setPassageInput] = useState('');
  const [passageTimeLeft, setPassageTimeLeft] = useState(30); // 30 seconds reading
  const [writingTimeLeft, setWritingTimeLeft] = useState(90); // 90 seconds writing
  const [isReadingPhase, setIsReadingPhase] = useState(true);
  const passageInputRef = useRef(null);

  // Email writing state
  const [emailInput, setEmailInput] = useState('');
  const [emailTimeLeft, setEmailTimeLeft] = useState(300); // 5 minutes
  const emailInputRef = useRef(null);

  // Handle refresh or tab close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (testStarted && !testCompleted) {
        e.preventDefault();
        e.returnValue = 'Your test progress will be lost if you refresh or close this tab. Are you sure you want to proceed?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [testStarted, testCompleted]);

  // Handle back button
  useEffect(() => {
    if (testStarted && !testCompleted) {
      // Push a new history entry to detect back navigation
      window.history.pushState(null, '', window.location.href);

      const handlePopState = (e) => {
        e.preventDefault();
        const confirmLeave = window.confirm('Your test progress will be lost if you go back. Are you sure you want to leave?');
        if (confirmLeave) {
          navigate('/dashboard'); // Navigate to dashboard if user confirms
        } else {
          // Push the state back to prevent navigation
          window.history.pushState(null, '', window.location.href);
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [testStarted, testCompleted, navigate]);

  // Fetch questions based on testId
  useEffect(() => {
    if (testId) {
      const loadedQuestions = loadTestQuestions(testId);
      setQuestions(loadedQuestions);
      console.log('Loaded questions:', loadedQuestions); // Debug: Verify question data

      // Initialize answer arrays based on question counts
      setSentenceAnswers(Array(10).fill('')); // 10 sentence completion questions
      setFillAnswers(Array(10).fill('')); // 10 fill in the blanks questions
      setJumbledAnswers(Array(15).fill('')); // 15 jumbled words questions
      setPassageInputs(Array(3).fill('')); // 3 passage reconstruction tasks
    }
  }, [testId]);


  const loadTestQuestions = (testId) => {
    // Validate testId (must be between 1 and 20)
    const testIndex = testId - 1; // Convert to zero-based index
    if (testIndex < 0 || testIndex >= 20) {
      console.error(`Invalid testId: ${testId}. Must be between 1 and 20.`);
      return [];
    }

    const questions = [];
    const typing = masterData.typing;
    const sentence = masterData.sentenceCompletion;
    const fill = masterData.fillBlanks;
    const jumbled = masterData.jumbledWords;
    const passage = masterData.passageReconstruction;
    const email = masterData.emailWriting;

    // Calculate indices based on testId
    // Use modulo to cycle through available questions if testId > available data
    const typingIndex = testIndex % typing.length;
    const emailIndex = testIndex % email.length;

    // Cycle the START index for array chunks
    const sentenceStart = (testIndex * 10) % Math.max(1, sentence.length);
    const fillStart = (testIndex * 10) % Math.max(1, fill.length);
    const jumbledStart = (testIndex * 15) % Math.max(1, jumbled.length);
    const passageStart = (testIndex * 3) % Math.max(1, passage.length);

    // Helper to extract a chunk of questions with wrapping
    const getChunk = (sourceArr, start, count) => {
      if (!sourceArr || sourceArr.length === 0) return [];
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(sourceArr[(start + i) % sourceArr.length]);
      }
      return result;
    };

    // 1. Typing (1 question) - Index 0
    questions.push(typing[typingIndex]);

    // 2. Sentence Completion (10 questions) - Indices 1-10
    questions.push(...getChunk(sentence, sentenceStart, 10));

    // 3. Fill in Blanks (10 questions) - Indices 11-20
    questions.push(...getChunk(fill, fillStart, 10));

    // 4. Jumbled Words (15 questions) - Indices 21-35
    questions.push(...getChunk(jumbled, jumbledStart, 15));

    // 5. Passage Reconstruction (3 questions) - Indices 36-38
    questions.push(...getChunk(passage, passageStart, 3));

    // 6. Email Writing (1 question) - Index 39
    questions.push(email[emailIndex]);

    return questions;
  };

  // Text-to-speech function for instructions
  const speakInstruction = (text) => {
    if ('speechSynthesis' in window) {
      const speak = () => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        // Small delay to ensure cancellation takes effect
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 0.9; // Slightly slower for better clarity
          utterance.pitch = 1.0;

          // Try to select a better voice
          const voices = window.speechSynthesis.getVoices();
          // Prioritize Google US English or Microsoft Zira/David or other high quality voices
          const preferredVoice = voices.find(voice =>
            (voice.name.includes('Google') && voice.lang === 'en-US') ||
            (voice.name.includes('Samantha') && voice.lang === 'en-US') ||
            (voice.name.includes('Natural') && voice.lang === 'en-US')
          );

          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }

          window.speechSynthesis.speak(utterance);
        }, 50);
      };

      if (window.speechSynthesis.getVoices().length) {
        speak();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          speak();
          // Remove listener to prevent multiple triggers
          window.speechSynthesis.onvoiceschanged = null;
        };
      }
    }
  };

  // Handle Start Section button
  const handleStartSection = () => {
    window.speechSynthesis?.cancel(); // Stop speech
    setShowInstructions(false);
  };

  // Define handleNextAction before useEffect
  const handleNextAction = () => {
    switch (currentTest) {
      case 'typing':
        if (typingTimeLeft > 0) return;
        evaluateTypingTest();
        break;
      case 'sentence':
        if (!sentenceAnswers[currentSentenceIndex]) return;
        handleNextSentence();
        break;
      case 'fill':
        if (!fillAnswers[currentFillIndex]) return;
        handleNextFill();
        break;
      case 'jumbled':
        if (!jumbledAnswers[currentJumbledIndex]) return;
        handleNextJumbled();
        break;
      case 'passage':
        if (isReadingPhase) {
          setIsReadingPhase(false);
        } else {
          if (!passageInput) return;
          handleNextPassage();
        }
        break;
      case 'email':
        if (!emailInput) return;
        evaluateEmailWriting();
        break;
      default:
        break;
    }
  };

  // Handle Enter key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNextAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNextAction,
    currentTest,
    typingTimeLeft,
    sentenceAnswers,
    currentSentenceIndex,
    fillAnswers,
    currentFillIndex,
    jumbledAnswers,
    currentJumbledIndex,
    isReadingPhase,
    passageInput,
    emailInput,
  ]);

  // Start the test
  const startTest = () => {
    setTestStarted(true);
    setCurrentTest('typing');
    setShowInstructions(true); // Show typing instructions first
  };

  // Typing test functions
  const evaluateTypingTest = () => {
    const typingQuestion = questions[0];
    if (!typingInput.trim()) {
      console.log('Typing evaluation: Empty input, WPM: 0, Accuracy: 0');
      setTypingResults({ wpm: 0, accuracy: 0 });
      startSentenceCompletion();
      return;
    }
    const inputWords = typingInput.trim().split(/\s+/).filter((w) => w.length > 0);
    const referenceWords = typingQuestion.paragraph.trim().split(/\s+/).filter((w) => w.length > 0);
    let correctWords = 0;
    const minWordCount = Math.min(inputWords.length, referenceWords.length);
    for (let i = 0; i < minWordCount; i++) {
      if (inputWords[i] === referenceWords[i]) correctWords++;
    }
    const timeInSeconds = Math.max(60 - typingTimeLeft, 1);
    const timeInMinutes = timeInSeconds / 60;
    const wpm = Math.round(correctWords / timeInMinutes) || 0;
    console.log(`Typing evaluation: Input words: ${inputWords.length}, Correct words: ${correctWords}, Time (s): ${timeInSeconds}, WPM: ${wpm}`);
    const reference = typingQuestion.paragraph.slice(0, typingInput.length);
    let correctChars = 0;
    for (let i = 0; i < typingInput.length; i++) {
      if (typingInput[i] === reference[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / typingInput.length) * 100) || 0;
    console.log(`Typing evaluation: Correct chars: ${correctChars}, Input chars: ${typingInput.length}, Accuracy: ${accuracy}%`);
    setTypingResults({ wpm, accuracy });
    startSentenceCompletion();
  };

  // Sentence completion functions
  const startSentenceCompletion = () => {
    setCurrentSentenceIndex(0);
    setSentenceTimeLeft(15);
    setCurrentTest('sentence');
    setShowInstructions(true); // Show instructions before starting
  };

  const handleSentenceAnswer = (e) => {
    const newAnswers = [...sentenceAnswers];
    newAnswers[currentSentenceIndex] = e.target.value;
    setSentenceAnswers(newAnswers);
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < 9) {
      // 10 questions (0-9)
      setCurrentSentenceIndex((prev) => prev + 1);
      setSentenceTimeLeft(15);
    } else {
      startFillInBlanks();
    }
  };

  // Auto-focus for sentence completion input
  useEffect(() => {
    if (currentTest === 'sentence' && sentenceInputRef.current && !showInstructions) {
      sentenceInputRef.current.focus();
    }
  }, [currentTest, currentSentenceIndex, showInstructions]);

  // Fill in blanks functions
  const startFillInBlanks = () => {
    setCurrentFillIndex(0);
    setFillTimeLeft(30);
    setCurrentTest('fill');
    setShowInstructions(true); // Show instructions before starting
  };

  const handleFillAnswer = (value) => {
    const newAnswers = [...fillAnswers];
    newAnswers[currentFillIndex] = value;
    setFillAnswers(newAnswers);
  };

  const handleNextFill = () => {
    if (currentFillIndex < 9) {
      // 10 questions (0-9)
      setCurrentFillIndex((prev) => prev + 1);
      setFillTimeLeft(30);
    } else {
      startJumbledWords();
    }
  };

  // Auto-focus for fill in the blanks (first radio button)
  useEffect(() => {
    if (currentTest === 'fill' && fillInputRef.current && !showInstructions) {
      fillInputRef.current.focus();
    }
  }, [currentTest, currentFillIndex, showInstructions]);

  // Jumbled words functions
  const startJumbledWords = () => {
    setCurrentJumbledIndex(0);
    setJumbledTimeLeft(30);
    setCurrentTest('jumbled');
    setShowInstructions(true); // Show instructions before starting
  };

  const handleJumbledAnswer = (e) => {
    const newAnswers = [...jumbledAnswers];
    newAnswers[currentJumbledIndex] = e.target.value;
    setJumbledAnswers(newAnswers);
  };

  const handleNextJumbled = () => {
    if (currentJumbledIndex < 14) {
      // 15 questions (0-14)
      setCurrentJumbledIndex((prev) => prev + 1);
      setJumbledTimeLeft(30);
    } else {
      startPassageReconstruction();
    }
  };

  // Auto-focus for jumbled words input
  useEffect(() => {
    if (currentTest === 'jumbled' && jumbledInputRef.current && !showInstructions) {
      jumbledInputRef.current.focus();
    }
  }, [currentTest, currentJumbledIndex, showInstructions]);

  // Passage reconstruction functions
  const startPassageReconstruction = () => {
    setCurrentPassageIndex(0);
    setPassageInput('');
    setPassageTimeLeft(30);
    setWritingTimeLeft(90);
    setIsReadingPhase(true);
    setCurrentTest('passage');
    setShowInstructions(true); // Show instructions before starting
  };

  const handleNextPassage = () => {
    const newInputs = [...passageInputs];
    newInputs[currentPassageIndex] = passageInput;
    setPassageInputs(newInputs);

    if (currentPassageIndex < 2) {
      // 3 passages (0-2)
      setCurrentPassageIndex((prev) => prev + 1);
      setPassageInput('');
      setPassageTimeLeft(30);
      setWritingTimeLeft(90);
      setIsReadingPhase(true);
    } else {
      startEmailWriting();
    }
  };

  // Auto-focus for passage reconstruction textarea (after reading phase)
  useEffect(() => {
    if (currentTest === 'passage' && !isReadingPhase && passageInputRef.current && !showInstructions) {
      passageInputRef.current.focus();
    }
  }, [currentTest, isReadingPhase, showInstructions]);

  // Email writing functions
  const startEmailWriting = () => {
    setEmailInput('');
    setEmailTimeLeft(300);
    setCurrentTest('email');
    setShowInstructions(true); // Show instructions before starting
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const evaluateEmailWriting = () => {
    setIsSubmitting(true);
    // 1. Calculate Email Score (0-10) using our new algorithm
    const emailResult = gradeEmail(emailInput);
    console.log("Email Grading:", emailResult);

    // 2. Calculate Passage Scores
    // We compare each user input against the original text in masterData
    // We need to look up the original passages again.
    const passageQuestions = questions.filter(q => q.sentences); // Identify passage questions
    const passageResults = passageInputs.map((input, index) => {
      const originalText = passageQuestions[index]?.sentences || "";
      return gradePassage(originalText, input);
    });
    console.log("Passage Grading:", passageResults);

    setTestCompleted(true); // Mark test as completed before navigating

    // Simulate AI processing delay
    setTimeout(() => {
      // Navigate to ResultPage.js with test results
      navigate('/result', {
        state: {
          testId,
          typingResults,
          sentenceAnswers,
          fillAnswers,
          jumbledAnswers,
          passageInputs,
          emailInput,
          questions,
          // NEW: Pass the calculated scores
          emailScore: emailResult,
          passageScores: passageResults
        },
      });
    }, 2500);
  };

  // Auto-focus for email writing textarea
  useEffect(() => {
    if (currentTest === 'email' && emailInputRef.current && !showInstructions) {
      emailInputRef.current.focus();
    }
  }, [currentTest, showInstructions]);

  // Dictation for instruction screens
  useEffect(() => {
    if (showInstructions) {
      let text = '';
      switch (currentTest) {
        case 'typing':
          text = "Improve your typing speed and accuracy. You will have 1 minute to type the paragraph shown. Click 'Start Section' to begin.";
          break;
        case 'sentence':
          text = "Test your vocabulary and grammar by completing sentences. Type the correct word to fill in each sentence’s blank within 15 seconds. Click 'Start Section' to begin.";
          break;
        case 'fill':
          text = "Strengthen your language skills by filling in missing words. Select the correct word from the multiple-choice options within 30 seconds. Click 'Start Section' to begin.";
          break;
        case 'jumbled':
          text = "Boost logical thinking by unscrambling jumbled sentences. Type the correct sentence by rearranging the words within 30 seconds. Click 'Start Section' to begin.";
          break;
        case 'passage':
          text = "Enhance memory and paraphrasing by reconstructing passages. Read the passage for 30 seconds, then rewrite it in your own words within 90 seconds. Click 'Start Section' to begin.";
          break;
        case 'email':
          text = "Practice professional communication by writing clear emails. Read the prompt and write a formal email within 5 minutes. Click 'Start Section' to begin.";
          break;
        default:
          break;
      }
      if (text) {
        speakInstruction(text);
      }
    }
    return () => window.speechSynthesis?.cancel(); // Cleanup on unmount or state change
  }, [showInstructions, currentTest]);

  // Timer effects
  useEffect(() => {
    if (currentTest === 'typing' && typingTimeLeft > 0 && !showInstructions) {
      const timer = setInterval(() => {
        setTypingTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            evaluateTypingTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentTest, typingTimeLeft, showInstructions, evaluateTypingTest]);

  useEffect(() => {
    if (currentTest === 'sentence' && sentenceTimeLeft > 0 && !showInstructions) {
      const timer = setInterval(() => {
        setSentenceTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleNextSentence();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentTest, fillTimeLeft, showInstructions, handleNextFill]);

  useEffect(() => {
    if (currentTest === 'fill' && fillTimeLeft > 0 && !showInstructions) {
      const timer = setInterval(() => {
        setFillTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleNextFill();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentTest, fillTimeLeft, showInstructions, handleNextFill]);

  useEffect(() => {
    if (currentTest === 'jumbled' && jumbledTimeLeft > 0 && !showInstructions) {
      const timer = setInterval(() => {
        setJumbledTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleNextJumbled();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentTest, jumbledTimeLeft, showInstructions, handleNextJumbled]);

  useEffect(() => {
    if (currentTest === 'passage' && isReadingPhase && passageTimeLeft > 0 && !showInstructions) {
      const timer = setInterval(() => {
        setPassageTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsReadingPhase(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentTest, passageTimeLeft, isReadingPhase, showInstructions, handleNextPassage]);

  useEffect(() => {
    if (currentTest === 'passage' && !isReadingPhase && writingTimeLeft > 0 && !showInstructions) {
      const timer = setInterval(() => {
        setWritingTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleNextPassage();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentTest, writingTimeLeft, isReadingPhase, showInstructions, handleNextPassage]);

  useEffect(() => {
    if (currentTest === 'email' && emailTimeLeft > 0 && !showInstructions) {
      const timer = setInterval(() => {
        setEmailTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            evaluateEmailWriting();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentTest, emailTimeLeft, showInstructions, evaluateEmailWriting]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleExitTest = () => {
    if (window.confirm('Are you sure you want to exit the test? Your progress will be lost and you cannot resume it.')) {
      navigate('/dashboard');
    }
  };



  // CHECK: Validation logic moved here to ensure all hooks run first
  if (!testId || testId < 1 || testId > 20) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="test-container-glass p-8 text-center bg-white rounded-xl shadow-xl">
          <h2 className="test-title text-2xl font-bold text-red-600 mb-4">Invalid Test Selected</h2>
          <p className="test-subtitle text-gray-600 mb-6">Please go back to the dashboard and select a valid test.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Loading Overlay
  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-opacity-90 fixed inset-0 z-50">
        <div className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-400 mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Responses...</h2>
          <p className="text-gray-300">Our AI is evaluating your performance.</p>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass">
            <h2 className="test-title">Versant Writing Test {testId}</h2>
            <div className="text-left test-subtitle space-y-2">
              <p>This test has six sections:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Typing Test (1 minute)</li>
                <li>Sentence Completion (10 questions, 2.5 minutes)</li>
                <li>Fill in the Blanks (10 questions, 5 minutes)</li>
                <li>Jumbled Words (15 questions, 7.5 minutes)</li>
                <li>Passage Reconstruction (3 tasks, 6 minutes)</li>
                <li>Email Writing (5 minutes)</li>
              </ol>
            </div>
            <button
              onClick={startTest}
              className="test-btn test-btn-primary"
            >
              Start Test
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Typing test instructions
  if (currentTest === 'typing' && showInstructions) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass max-w-md">
            <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">Typing Test</h2>
            <div className="test-question-area">
              <p className="test-subtitle">
                Improve your typing speed and accuracy through audio dictation. Listen to the audio carefully and type the dictated text into the input field. Click ‘Start Section’ to begin.
              </p>
            </div>
            <button
              onClick={handleStartSection}
              className="test-btn test-btn-primary"
            >
              Start Section
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Typing test
  if (currentTest === 'typing') {
    const typingQuestion = questions[0];
    if (!typingQuestion) {
      return (
        <>
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-lg text-gray-600">Loading test...</p>
          </div>
          <Footer />
        </>
      );
    }
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass">
            <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">Typing Test</h2>
            <div className="timer-display-circular">
              <div className="timer-text-circular">{formatTime(typingTimeLeft)}</div>
            </div>
            <div className="test-question-area">
              <p>{typingQuestion.paragraph}</p>
            </div>
            <textarea
              value={typingInput}
              onChange={(e) => setTypingInput(e.target.value)}
              className="test-textarea"
              placeholder="Type the text above..."
              disabled={typingTimeLeft <= 0}
            />
            <button
              onClick={evaluateTypingTest}
              disabled={typingTimeLeft > 0 && typingInput.length === 0}
              className={`test-btn ${typingTimeLeft > 0 ? 'test-btn-secondary' : 'test-btn-primary'}`}>
              {typingTimeLeft > 0 ? 'Press Enter to Skip' : 'Continue'}
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Sentence completion instructions
  if (currentTest === 'sentence' && showInstructions) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass max-w-md">
            <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">Sentence Completion</h2>
            <div className="test-question-area">
              <p className="test-subtitle">
                Test your vocabulary and grammar by completing sentences. Type the correct word to fill in each sentence’s blank within 30 seconds. Click ‘Start Section’ to begin.
              </p>
            </div>
            <button onClick={handleStartSection} className="test-btn test-btn-primary">Start Section</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Sentence completion
  if (currentTest === 'sentence') {
    const currentQuestion = questions[1 + currentSentenceIndex]; // Questions 1-10 are sentence completion
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass">
            <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">Sentence Completion</h2>
            <p className="test-subtitle">Question {currentSentenceIndex + 1} of 10</p>
            <div className="timer-display-circular">
              <div className="timer-text-circular">{sentenceTimeLeft}s</div>
            </div>
            <div className="test-question-area">
              <p>{currentQuestion.question}</p>
            </div>
            <input
              ref={sentenceInputRef}
              type="text"
              value={sentenceAnswers[currentSentenceIndex]}
              onChange={handleSentenceAnswer}
              placeholder="Complete the sentence..."
              className="test-input"
            />
            <button
              onClick={handleNextSentence}
              disabled={!sentenceAnswers[currentSentenceIndex]}
              className="test-btn test-btn-primary"
            >
              {currentSentenceIndex < 9 ? 'Next (or press Enter)' : 'Continue'}
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Fill in blanks instructions
  if (currentTest === 'fill' && showInstructions) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass max-w-md">
            <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">Fill in the Blanks</h2>
            <div className="test-question-area">
              <p className="test-subtitle">
                Strengthen your language skills by filling in missing words. Select the correct word from the multiple-choice options within 30 seconds. Click ‘Start Section’ to begin.
              </p>
            </div>
            <button onClick={handleStartSection} className="test-btn test-btn-primary">Start Section</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Fill in blanks
  if (currentTest === 'fill') {
    const currentQuestion = questions[11 + currentFillIndex]; // Questions 11-20 are fill in the blanks
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass">
            <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">Fill in the Blanks</h2>
            <p className="test-subtitle">Question {currentFillIndex + 1} of 10</p>
            <div className="timer-display-circular">
              <div className="timer-text-circular">{fillTimeLeft}s</div>
            </div>
            <div className="test-question-area">
              <p>{currentQuestion.question}</p>
              <div className="space-y-2 mt-4 text-left">
                {currentQuestion.options.map((option, i) => (
                  <label key={i} className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/20">
                    <input
                      ref={i === 0 ? fillInputRef : null}
                      type="radio"
                      value={option}
                      checked={fillAnswers[currentFillIndex] === option}
                      onChange={() => handleFillAnswer(option)}
                      className="h-4 w-4 text-green-300 bg-transparent border-white/50 focus:ring-green-300"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={handleNextFill}
              disabled={!fillAnswers[currentFillIndex]}
              className="test-btn test-btn-primary"
            >
              {currentFillIndex < 9 ? 'Next (or press Enter)' : 'Continue'}
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Jumbled words instructions
  if (currentTest === 'jumbled' && showInstructions) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass max-w-md">
            <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">Jumbled Words</h2>
            <div className="test-question-area">
              <p className="test-subtitle">
                Boost logical thinking by unscrambling jumbled sentences. Type the correct sentence by rearranging the words within 30 seconds. Click ‘Start Section’ to begin.
              </p>
            </div>
            <button onClick={handleStartSection} className="test-btn test-btn-primary">Start Section</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Jumbled words
  if (currentTest === 'jumbled') {
    const currentQuestion = questions[21 + currentJumbledIndex]; // Questions 21-35 are jumbled words
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass">
            <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">Jumbled Words</h2>
            <p className="test-subtitle">Question {currentJumbledIndex + 1} of 15</p>
            <div className="timer-display-circular">
              <div className="timer-text-circular">{jumbledTimeLeft}s</div>
            </div>
            <div className="test-question-area">
              <p>Unscramble these words to make a correct sentence:</p>
              <p className="text-xl font-bold mt-2">{currentQuestion.jumbled.replace(/\//g, ' ')}</p>
            </div>
            <input
              ref={jumbledInputRef}
              type="text"
              value={jumbledAnswers[currentJumbledIndex]}
              onChange={handleJumbledAnswer}
              placeholder="Type the correct sentence..."
              className="test-input"
            />
            <button
              onClick={handleNextJumbled}
              disabled={!jumbledAnswers[currentJumbledIndex]}
              className="test-btn test-btn-primary"
            >
              {currentJumbledIndex < 14 ? 'Next (or press Enter)' : 'Continue'}
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Passage reconstruction instructions
  if (currentTest === 'passage' && showInstructions) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass max-w-md">
            <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">Passage Reconstruction</h2>
            <div className="test-question-area">
              <p className="test-subtitle">
                Enhance memory and paraphrasing by reconstructing passages. Read the passage for 30 seconds, then rewrite it in your own words within 90 seconds. Click ‘Start Section’ to begin.
              </p>
            </div>
            <button onClick={handleStartSection} className="test-btn test-btn-primary">Start Section</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Passage reconstruction
  if (currentTest === 'passage') {
    const currentPassage = questions[36 + currentPassageIndex]; // Questions 36-38 are passage reconstruction
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass">
            <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">Passage Reconstruction</h2>
            <p className="test-subtitle">Passage {currentPassageIndex + 1} of 3</p>
            <div className="timer-display-circular">
              <div className="timer-text-circular">
                {isReadingPhase ? formatTime(passageTimeLeft) : formatTime(writingTimeLeft)}
              </div>
            </div>
            {isReadingPhase ? (
              <>
                <div className="test-question-area">
                  <p>Read this passage carefully. It will disappear in {passageTimeLeft} seconds.</p>
                  <p className="mt-4">{currentPassage.sentences}</p>
                </div>
                <button onClick={() => setIsReadingPhase(false)} className="test-btn test-btn-primary">
                  I'm Ready to Write (or press Enter)
                </button>
              </>
            ) : (
              <>
                <div className="test-question-area">
                  <p>Reconstruct the passage in your own words:</p>
                </div>
                <textarea
                  ref={passageInputRef}
                  value={passageInput}
                  onChange={(e) => setPassageInput(e.target.value)}
                  placeholder="Write the passage here..."
                  className="test-textarea min-h-[200px]"
                />
                <button onClick={handleNextPassage} disabled={!passageInput} className="test-btn test-btn-primary">
                  {currentPassageIndex < 2 ? 'Next Passage (or press Enter)' : 'Continue'}
                </button>
              </>
            )}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Email writing instructions
  if (currentTest === 'email' && showInstructions) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass max-w-md">
            <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">Email Writing</h2>
            <div className="test-question-area">
              <p className="test-subtitle">
                Practice professional communication by writing clear emails. Read the prompt and write a formal email within 5 minutes. Click ‘Start Section’ to begin.
              </p>
            </div>
            <button onClick={handleStartSection} className="test-btn test-btn-primary">Start Section</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Email writing
  if (currentTest === 'email') {
    const emailQuestion = questions[39]; // Question 39 is email writing
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="test-container-glass">
            <button onClick={handleExitTest} className="test-btn-exit-corner">
              &times;
            </button>
            <h2 className="test-title">Email Writing</h2>
            <div className="timer-display-circular">
              <div className="timer-text-circular">{formatTime(emailTimeLeft)}</div>
            </div>
            <div className="test-question-area">
              <p>{emailQuestion.prompt}</p>
            </div>
            <textarea
              ref={emailInputRef}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Write your email here..."
              className="test-textarea min-h-[200px]"
            />
            <button
              onClick={evaluateEmailWriting}
              disabled={!emailInput}
              className="test-btn test-btn-primary"
            >
              {emailTimeLeft > 0 ? 'Submit (or press Enter)' : 'Finish Test'}
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // If test is completed, redirect happened, so nothing to render here
  return <Footer />;
}