import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import masterData from '../data/masterTest.json';

export default function TestPage() {
  // Navigation hook
  const navigate = useNavigate();

  // Test state
  const location = useLocation();
  const { testId } = location.state || {};
  const [currentTest, setCurrentTest] = useState('typing');
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true); // Toggle instructions

  // Typing test state
  const [typingInput, setTypingInput] = useState('');
  const [typingTimeLeft, setTypingTimeLeft] = useState(60); // 1 minute
  const [typingResults, setTypingResults] = useState({ wpm: 0, accuracy: 0 });

  // Sentence completion state
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentenceAnswers, setSentenceAnswers] = useState([]);
  const [sentenceTimeLeft, setSentenceTimeLeft] = useState(30); // 30 seconds per question
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
        const confirmLeave = window.confirm(
          'Your test progress will be lost if you go back. Are you sure you want to leave?'
        );
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
    const typingIndex = testIndex; // 1 typing question per test
    const sentenceStart = testIndex * 10; // 10 sentence completion questions per test
    const fillStart = testIndex * 10; // 10 fill in the blanks questions per test
    const jumbledStart = testIndex * 15; // 15 jumbled words questions per test
    const passageStart = testIndex * 3; // 3 passage reconstruction questions per test
    const emailIndex = testIndex; // 1 email writing question per test

    // Ensure the indices are within bounds
    if (
      typingIndex >= typing.length ||
      sentenceStart + 10 > sentence.length ||
      fillStart + 10 > fill.length ||
      jumbledStart + 15 > jumbled.length ||
      passageStart + 3 > passage.length ||
      emailIndex >= email.length
    ) {
      console.error(`Data for testId ${testId} is incomplete in masterTest.json`);
      return [];
    }

    // Load questions for the current test with all fields
    questions.push({ ...typing[typingIndex] }); // 1 typing question
    for (let i = sentenceStart; i < sentenceStart + 10; i++) {
      questions.push({ ...sentence[i] }); // 10 sentence completion, preserve all fields
    }
    for (let i = fillStart; i < fillStart + 10; i++) {
      questions.push({ ...fill[i] }); // 10 fill in the blanks, preserve all fields
    }
    for (let i = jumbledStart; i < jumbledStart + 15; i++) {
      questions.push({ ...jumbled[i] }); // 15 jumbled words, preserve all fields
    }
    for (let i = passageStart; i < passageStart + 3; i++) {
      questions.push({ ...passage[i] }); // 3 passage reconstruction
    }
    questions.push({ ...email[emailIndex] }); // 1 email writing

    return questions;
  };

  // Text-to-speech function for instructions
  const speakInstruction = (text) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      window.speechSynthesis.speak(utterance);
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

  // Reset the test completely
  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setCurrentTest('typing');
    setTypingInput('');
    setTypingTimeLeft(60);
    setTypingResults({ wpm: 0, accuracy: 0 });
    setCurrentSentenceIndex(0);
    setSentenceAnswers(Array(10).fill(''));
    setSentenceTimeLeft(30);
    setCurrentFillIndex(0);
    setFillAnswers(Array(10).fill(''));
    setFillTimeLeft(30);
    setCurrentJumbledIndex(0);
    setJumbledAnswers(Array(15).fill(''));
    setJumbledTimeLeft(30);
    setCurrentPassageIndex(0);
    setPassageInputs(Array(3).fill(''));
    setPassageInput('');
    setPassageTimeLeft(30);
    setWritingTimeLeft(90);
    setIsReadingPhase(true);
    setEmailInput('');
    setEmailTimeLeft(300);
    setShowInstructions(true);
  };

  // Typing test functions
  const evaluateTypingTest = () => {
    const typingQuestion = questions[0]; // First question is typing
    // Handle empty or whitespace-only input
    if (!typingInput.trim()) {
      console.log('Typing evaluation: Empty input, WPM: 0, Accuracy: 0');
      setTypingResults({ wpm: 0, accuracy: 0 });
      startSentenceCompletion();
      return;
    }

    // WPM calculation
    const words = typingInput.trim().split(/\s+/).filter((w) => w.length > 0);
    const timeInSeconds = Math.max(60 - typingTimeLeft, 1); // At least 1 second
    const timeInMinutes = timeInSeconds / 60;
    const wpm = Math.round(words.length / timeInMinutes);
    console.log(`Typing evaluation: Words: ${words.length}, Time (s): ${timeInSeconds}, WPM: ${wpm}`);

    // Accuracy calculation
    const reference = typingQuestion.paragraph;
    let correctChars = 0;
    const minLength = Math.min(typingInput.length, reference.length);
    // Count matching characters
    for (let i = 0; i < minLength; i++) {
      if (typingInput[i] === reference[i]) correctChars++;
    }
    // Penalize extra or missing characters
    const totalChars = reference.length;
    const errors = Math.abs(typingInput.length - reference.length); // Extra or missing chars
    const accuracy = Math.round(((correctChars / (totalChars + errors)) * 100) || 0);
    console.log(`Typing evaluation: Correct chars: ${correctChars}, Total chars: ${totalChars}, Errors: ${errors}, Accuracy: ${accuracy}%`);

    setTypingResults({ wpm, accuracy });
    startSentenceCompletion();
  };

  // Sentence completion functions
  const startSentenceCompletion = () => {
    setCurrentSentenceIndex(0);
    setSentenceTimeLeft(30);
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
      setSentenceTimeLeft(30);
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

  const evaluateEmailWriting = () => {
    setTestCompleted(true); // Mark test as completed before navigating
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
      },
    });
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
          text = "Improve your typing speed and accuracy through audio dictation. Listen to the audio carefully and type the dictated text into the input field. Click 'Start Section' to begin.";
          break;
        case 'sentence':
          text = "Test your vocabulary and grammar by completing sentences. Type the correct word to fill in each sentence’s blank within 30 seconds. Click 'Start Section' to begin.";
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
  }, [currentTest, typingTimeLeft, showInstructions]);

  useEffect(() => {
    if (currentTest === 'sentence' && sentenceTimeLeft > 0 && !showInstructions) {
      const timer = setInterval(() => {
        setSentenceTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleNextSentence();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentTest, sentenceTimeLeft, showInstructions]);

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
  }, [currentTest, fillTimeLeft, showInstructions]);

  useEffect(() => {
    if (currentTest == 'jumbled' && jumbledTimeLeft > 0 && !showInstructions) {
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
  }, [currentTest, jumbledTimeLeft, showInstructions]);

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
  }, [currentTest, passageTimeLeft, isReadingPhase, showInstructions]);

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
  }, [currentTest, writingTimeLeft, isReadingPhase, showInstructions]);

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
  }, [currentTest, emailTimeLeft, showInstructions]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Test introduction with enhanced validation
  if (!testId || testId < 1 || testId > 20) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-md border border-green-200 rounded-lg shadow-sm bg-white">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl text-green-800 font-semibold">Invalid Test Selected</h2>
          </div>
          <div className="p-6">
            <p className="text-green-700">Please select a test from the dashboard (Test 1 to Test 20).</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-md border border-green-200 rounded-lg shadow-sm bg-white">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl text-green-800 font-semibold">Versant Writing Test {testId}</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-green-700">This test has six sections:</p>
            <ol className="list-decimal pl-5 space-y-2 text-green-700">
              <li>Typing Test (1 minute)</li>
              <li>Sentence Completion (10 questions, 5 minutes)</li>
              <li>Fill in the Blanks (10 questions, 5 minutes)</li>
              <li>Jumbled Words (15 questions, 7.5 minutes)</li>
              <li>Passage Reconstruction (3 tasks, 6 minutes)</li>
              <li>Email Writing (5 minutes)</li>
            </ol>
            <button
              onClick={startTest}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Typing test instructions
  if (currentTest === 'typing' && showInstructions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-md bg-green-100 rounded-2xl shadow-md animate-fade-in">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl font-bold text-green-800">Typing Test</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-green-800">
              Improve your typing speed and accuracy through audio dictation. Listen to the audio carefully and type the dictated text into the input field. Click ‘Start Section’ to begin.
            </p>
            <button
              onClick={handleStartSection}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              Start Section
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Typing test
  if (currentTest === 'typing') {
    const typingQuestion = questions[0];
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-2xl border border-green-200 rounded-lg shadow-sm bg-white">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl text-green-800 font-semibold">Typing Test</h2>
            <p className="text-green-700">Time left: {formatTime(typingTimeLeft)}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-green-100 p-4 rounded border border-green-200">
              <p className="text-green-800">{typingQuestion.paragraph}</p>
            </div>
            <textarea
              value={typingInput}
              onChange={(e) => setTypingInput(e.target.value)}
              className="w-full h-32 p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Type the text above..."
              disabled={typingTimeLeft <= 0}
            />
            <button
              onClick={evaluateTypingTest}
              disabled={typingTimeLeft > 0 && typingInput.length === 0}
              className={`w-full py-2 px-4 rounded-md ${
                typingTimeLeft > 0
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {typingTimeLeft > 0 ? 'Press Enter to Skip' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sentence completion instructions
  if (currentTest === 'sentence' && showInstructions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-md bg-green-100 rounded-2xl shadow-md animate-fade-in">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl font-bold text-green-800">Sentence Completion</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-green-800">
              Test your vocabulary and grammar by completing sentences. Type the correct word to fill in each sentence’s blank within 30 seconds. Click ‘Start Section’ to begin.
            </p>
            <button
              onClick={handleStartSection}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              Start Section
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sentence completion
  if (currentTest === 'sentence') {
    const currentQuestion = questions[1 + currentSentenceIndex]; // Questions 1-10 are sentence completion
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-2xl border border-green-200 rounded-lg shadow-sm bg-white">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl text-green-800 font-semibold">Sentence Completion</h2>
            <p className="text-green-700">
              Question {currentSentenceIndex + 1} of 10 • Time: {sentenceTimeLeft}s
            </p>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-lg text-green-800">{currentQuestion.question}</p>
            <input
              ref={sentenceInputRef}
              type="text"
              value={sentenceAnswers[currentSentenceIndex]}
              onChange={handleSentenceAnswer}
              placeholder="Complete the sentence..."
              className="w-full p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              onClick={handleNextSentence}
              disabled={!sentenceAnswers[currentSentenceIndex]}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              {currentSentenceIndex < 9 ? 'Next (or press Enter)' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fill in blanks instructions
  if (currentTest === 'fill' && showInstructions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-md bg-green-100 rounded-2xl shadow-md animate-fade-in">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl font-bold text-green-800">Fill in the Blanks</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-green-800">
              Strengthen your language skills by filling in missing words. Select the correct word from the multiple-choice options within 30 seconds. Click ‘Start Section’ to begin.
            </p>
            <button
              onClick={handleStartSection}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              Start Section
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fill in blanks
  if (currentTest === 'fill') {
    const currentQuestion = questions[11 + currentFillIndex]; // Questions 11-20 are fill in the blanks
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-2xl border border-green-200 rounded-lg shadow-sm bg-white">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl text-green-800 font-semibold">Fill in the Blanks</h2>
            <p className="text-green-700">
              Question {currentFillIndex + 1} of 10 • Time: {fillTimeLeft}s
            </p>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-lg text-green-800">{currentQuestion.question}</p>
            <div className="space-y-2">
              {currentQuestion.options.map((option, i) => (
                <label key={i} className="flex items-center space-x-2 text-green-800">
                  <input
                    ref={i === 0 ? fillInputRef : null} // Focus the first radio button
                    type="radio"
                    value={option}
                    checked={fillAnswers[currentFillIndex] === option}
                    onChange={() => handleFillAnswer(option)}
                    className="text-green-600 border-green-300 focus:ring-green-500"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleNextFill}
              disabled={!fillAnswers[currentFillIndex]}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              {currentFillIndex < 9 ? 'Next (or press Enter)' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Jumbled words instructions
  if (currentTest === 'jumbled' && showInstructions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-md bg-green-100 rounded-2xl shadow-md animate-fade-in">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl font-bold text-green-800">Jumbled Words</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-green-800">
              Boost logical thinking by unscrambling jumbled sentences. Type the correct sentence by rearranging the words within 30 seconds. Click ‘Start Section’ to begin.
            </p>
            <button
              onClick={handleStartSection}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              Start Section
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Jumbled words
  if (currentTest === 'jumbled') {
    const currentQuestion = questions[21 + currentJumbledIndex]; // Questions 21-35 are jumbled words
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-2xl border border-green-200 rounded-lg shadow-sm bg-white">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl text-green-800 font-semibold">Jumbled Words</h2>
            <p className="text-green-700">
              Question {currentJumbledIndex + 1} of 15 • Time: {jumbledTimeLeft}s
            </p>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-lg text-green-800">
              Unscramble these words to make a correct sentence:
            </p>
            <p className="text-xl font-bold text-green-700">
              {currentQuestion.jumbled.replace(/\//g, ' ')}
            </p>
            <input
              ref={jumbledInputRef}
              type="text"
              value={jumbledAnswers[currentJumbledIndex]}
              onChange={handleJumbledAnswer}
              placeholder="Type the correct sentence..."
              className="w-full p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              onClick={handleNextJumbled}
              disabled={!jumbledAnswers[currentJumbledIndex]}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              {currentJumbledIndex < 14 ? 'Next (or press Enter)' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Passage reconstruction instructions
  if (currentTest === 'passage' && showInstructions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-md bg-green-100 rounded-2xl shadow-md animate-fade-in">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl font-bold text-green-800">Passage Reconstruction</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-green-800">
              Enhance memory and paraphrasing by reconstructing passages. Read the passage for 30 seconds, then rewrite it in your own words within 90 seconds. Click ‘Start Section’ to begin.
            </p>
            <button
              onClick={handleStartSection}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              Start Section
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Passage reconstruction
  if (currentTest === 'passage') {
    const currentPassage = questions[36 + currentPassageIndex]; // Questions 36-38 are passage reconstruction
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-2xl border border-green-200 rounded-lg shadow-sm bg-white">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl text-green-800 font-semibold">Passage Reconstruction</h2>
            <p className="text-green-700">
              Passage {currentPassageIndex + 1} of 3 •{' '}
              {isReadingPhase
                ? `Reading Time: ${formatTime(passageTimeLeft)}`
                : `Writing Time: ${formatTime(writingTimeLeft)}`}
            </p>
          </div>
          <div className="p-6 space-y-4">
            {isReadingPhase ? (
              <>
                <p className="text-lg text-green-800">
                  Read this passage carefully. It will disappear in {passageTimeLeft} seconds.
                </p>
                <div className="bg-green-100 p-4 rounded border border-green-200">
                  <p className="text-green-800">{currentPassage.sentences}</p>
                </div>
                <button
                  onClick={() => setIsReadingPhase(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                >
                  I'm Ready to Write (or press Enter)
                </button>
              </>
            ) : (
              <>
                <p className="text-lg text-green-800">Reconstruct the passage in your own words:</p>
                <textarea
                  ref={passageInputRef}
                  value={passageInput}
                  onChange={(e) => setPassageInput(e.target.value)}
                  placeholder="Write the passage here..."
                  className="w-full min-h-[200px] p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={handleNextPassage}
                  disabled={!passageInput}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                >
                  {currentPassageIndex < 2 ? 'Next Passage (or press Enter)' : 'Continue'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Email writing instructions
  if (currentTest === 'email' && showInstructions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-md bg-green-100 rounded-2xl shadow-md animate-fade-in">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl font-bold text-green-800">Email Writing</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-green-800">
              Practice professional communication by writing clear emails. Read the prompt and write a formal email within 5 minutes. Click ‘Start Section’ to begin.
            </p>
            <button
              onClick={handleStartSection}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              Start Section
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Email writing
  if (currentTest === 'email') {
    const emailQuestion = questions[39]; // Question 39 is email writing
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
        <div className="w-full max-w-2xl border border-green-200 rounded-lg shadow-sm bg-white">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-2xl text-green-800 font-semibold">Email Writing</h2>
            <p className="text-green-700">Time left: {formatTime(emailTimeLeft)}</p>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-lg text-green-800">{emailQuestion.prompt}</p>
            <textarea
              ref={emailInputRef}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Write your email here..."
              className="w-full min-h-[200px] p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              onClick={evaluateEmailWriting}
              disabled={!emailInput}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              {emailTimeLeft > 0 ? 'Submit (or press Enter)' : 'Finish Test'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If test is completed, redirect happened, so nothing to render here
  return null;
}