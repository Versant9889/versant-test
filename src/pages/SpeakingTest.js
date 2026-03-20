import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import speakingData from '../data/speakingTest.json';
import { FaMicrophone, FaStop, FaPlay, FaCheck, FaVolumeUp } from 'react-icons/fa';
import '../App.css';

// --- Helper Functions for Scoring ---
const calculateSimilarity = (s1, s2) => {
    if (!s1 || !s2) return 0;
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
};

const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) costs[j] = j;
            else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
};

const SpeakingTest = () => {
    const { mode } = useParams(); // 'full' or specific section (e.g., 'readAloud')
    const navigate = useNavigate();
    const location = useLocation();
    const testId = (location.state?.testId || 1).toString();

    // --- State ---
    const [sectionName, setSectionName] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [isInstruction, setIsInstruction] = useState(true); // Start with instructions
    const [isRecording, setIsRecording] = useState(false);
    const [isListening, setIsListening] = useState(false); // True when TTS is playing
    const [transcript, setTranscript] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const recognitionRef = useRef(null);
    const transcriptRef = useRef('');
    const timersRef = useRef([]); // Track active timers
    const testResponsesRef = useRef([]); // Track all responses for the result page

    // --- Navigation Warning ---
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (questions.length > 0 && !showResult) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [questions, showResult]);

    // Helper to clear all timers
    const clearAllTimers = () => {
        timersRef.current.forEach(id => clearTimeout(id));
        timersRef.current = [];
    };

    // Full Test Order
    const sectionOrder = [
        'readAloud',
        'repeats',
        'shortAnswer',
        'sentenceBuilds',
        'storyRetelling',
        'openQuestions'
    ];

    // --- Initialization ---
    useEffect(() => {
        let targetSection = mode;
        if (mode === 'full') {
            targetSection = sectionOrder[0];
        }

        clearAllTimers(); // Reset timers on section change

        // Load Data based on the active test ID (Default to 1)
        const currentTestData = speakingData[testId] || speakingData["1"] || {};
        const sectionData = currentTestData[targetSection] || [];
        setSectionName(targetSection);
        setQuestions(sectionData);
        setCurrentQuestionIndex(0);

        // Only reset score and responses if mode changes conceptually 
        // For full mode, keep appending.
        if (targetSection === sectionOrder[0]) {
            setScore(0);
            testResponsesRef.current = [];
        }

        setShowResult(false);
        setFeedbackMessage('');
        setTranscript('');
        transcriptRef.current = '';
        setIsInstruction(true); // Always start new section with instruction

    }, [mode]);

    // --- Speech Recognition Setup ---
    useEffect(() => {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let finalTrans = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    finalTrans += event.results[i][0].transcript;
                }
                setTranscript(finalTrans);
                transcriptRef.current = finalTrans; // Sync ref
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
                setFeedbackMessage("Error: " + event.error);
            };

            recognitionRef.current = recognition;
        } else {
            setFeedbackMessage("⚠️ Your browser does not support Speech Recognition. Please use Chrome.");
        }
    }, []);

    // --- Audio Visualization & Voice Logic ---
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const streamRef = useRef(null);

    // Stop Audio Stream
    const stopAudioStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    // Start Visualizer
    const startVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioCtx;

            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const canvas = canvasRef.current;
            if (!canvas) return;
            const canvasCtx = canvas.getContext("2d");

            const draw = () => {
                if (!isRecording) return; // Stop drawing if not recording
                requestAnimationFrame(draw);

                analyser.getByteFrequencyData(dataArray);

                canvasCtx.fillStyle = 'rgb(249, 250, 251)'; // Match bg-gray-50
                canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

                const barWidth = (canvas.width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i] / 2;

                    // Gradient Wave
                    const r = barHeight + 25 * (i / bufferLength);
                    const g = 250 * (i / bufferLength);
                    const b = 50;

                    canvasCtx.fillStyle = `rgb(${r},${g},${b})`;
                    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                    x += barWidth + 1;
                }
            };

            draw();

        } catch (err) {
            console.error("Error accessing microphone for visualizer:", err);
        }
    };

    // Cleanup Audio on Unmount or Stop
    useEffect(() => {
        if (!isRecording) {
            stopAudioStream();
        } else {
            startVisualizer();
        }
        return () => stopAudioStream();
    }, [isRecording]);


    // --- Improved TTS ---
    const speakText = (text, onEnd) => {
        if (!text) { if (onEnd) onEnd(); return; }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);

        // Voice Selection Strategy: Prefer "Google US English" or any "Female" voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name === 'Google US English') ||
            voices.find(v => v.name.includes('Samantha')) ||
            voices.find(v => v.name.includes('Female')) ||
            voices.find(v => v.lang === 'en-US');

        if (preferredVoice) utter.voice = preferredVoice;

        utter.lang = 'en-US';
        utter.rate = 1.0; // Slightly faster/natural

        utter.onend = () => {
            if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utter);
    };


    // --- Auto-Flow Logic ---
    // --- Auto-Flow Logic ---
    useEffect(() => {
        // 0. Handle Instruction Phase
        if (isInstruction) {
            const instructionText = speakingData.instructions ? speakingData.instructions[sectionName] : "Please follow the instructions.";

            setIsListening(true);

            const instTimer = setTimeout(() => {
                speakText(instructionText, () => {
                    const waitTimer = setTimeout(() => {
                        setIsInstruction(false);
                        setIsListening(false);
                    }, 2000); // 2s delay
                    timersRef.current.push(waitTimer);
                });
            }, 1000);
            timersRef.current.push(instTimer);

            return () => {
                clearAllTimers();
                window.speechSynthesis.cancel();
            };
        }

        if (!questions.length) return;
        const q = questions[currentQuestionIndex];
        if (!q) return;

        // 1. Reset State
        setTranscript('');
        transcriptRef.current = '';
        setFeedbackMessage('');
        setIsRecording(false);
        setIsListening(false);
        stopAudioStream();

        if (recognitionRef.current) recognitionRef.current.abort();

        // --- TIMING CONFIGURATION ---
        let prepTime = 0;
        let recordingTime = 10000;
        switch (sectionName) {
            case 'readAloud': prepTime = 500; recordingTime = 8000; break;
            case 'repeats': prepTime = 500; recordingTime = 8000; break;
            case 'shortAnswer': prepTime = 500; recordingTime = 6000; break;
            case 'sentenceBuilds': prepTime = 500; recordingTime = 10000; break;
            case 'storyRetelling': prepTime = 1000; recordingTime = 30000; break;
            case 'openQuestions': prepTime = 2000; recordingTime = 40000; break;
            default: prepTime = 500; recordingTime = 10000;
        }

        // Helper to start recording flow
        const startRecordingSequence = () => {
            setIsListening(false);

            // Start prep timer
            const prepTimer = setTimeout(() => {
                handleStartRecording();

                // Stop after Recording Time
                const recTimer = setTimeout(() => {
                    handleStopRecording();
                    // Move Next
                    const nextTimer = setTimeout(() => {
                        handleNext();
                    }, 1000);
                    timersRef.current.push(nextTimer);
                }, recordingTime);
                timersRef.current.push(recTimer);
            }, prepTime);
            timersRef.current.push(prepTimer);
        };

        // 2. Play Audio or Start Direct Flow
        let textToPlay = '';
        if (['repeats', 'shortAnswer', 'storyRetelling', 'openQuestions'].includes(sectionName)) {
            textToPlay = q.text || q.question || q.audioText;
        } else if (sectionName === 'sentenceBuilds') {
            textToPlay = q.parts ? q.parts.join('. ') : '';
        }

        if (textToPlay) {
            // Need to wait for voices to load? 
            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = () => {
                    speakText(textToPlay, () => startRecordingSequence());
                };
            }

            const flowTimer = setTimeout(() => {
                speakText(textToPlay, () => {
                    startRecordingSequence();
                });
            }, 800);
            timersRef.current.push(flowTimer);
        } else {
            // Read Aloud
            startRecordingSequence();
        }

        return () => {
            clearAllTimers();
            window.speechSynthesis.cancel();
            stopAudioStream();
        };

    }, [currentQuestionIndex, sectionName, questions, isInstruction]);

    // --- Handlers ---
    const handleStartRecording = () => {
        if (!recognitionRef.current) return;
        // 1. Reset State
        setTranscript('');
        transcriptRef.current = ''; // Reset Ref
        setFeedbackMessage('');
        setIsRecording(false);
        setIsListening(false);
        try {
            setIsRecording(true);
            recognitionRef.current.start();
        } catch (e) {
            console.error(e);
        }
    };

    const handleStopRecording = () => {
        if (!recognitionRef.current) return;
        setIsRecording(false);
        try { recognitionRef.current.stop(); } catch (e) { }

        // Save Response Object
        const textToSave = transcriptRef.current || '';
        const currentQ = questions[currentQuestionIndex];

        if (currentQ) {
            // Prevent duplicate saves for the same question
            const existingIdx = testResponsesRef.current.findIndex(r => r.section === sectionName && r.questionId === currentQ.id);
            if (existingIdx !== -1) return;

            // Calculate Score immediately
            const points = calculateScoreForQuestion();
            setScore(prev => prev + points);

            testResponsesRef.current.push({
                testId: testId,
                section: sectionName,
                questionId: currentQ.id,
                questionText: currentQ.text || currentQ.question || currentQ.audioText || (currentQ.parts ? currentQ.parts.join('. ') : ''),
                transcript: textToSave,
                score: points
            });
        }
    };



    const calculateScoreForQuestion = () => {
        // Use Ref to get latest text inside the timeout callback
        const textToScore = transcriptRef.current;
        if (!textToScore) return 0;

        const q = questions[currentQuestionIndex];
        if (!q) return 0;

        const userText = textToScore.trim().toLowerCase();
        let points = 0;

        // Fluency Bonus (Speed)
        const wordCount = userText.split(' ').length;
        // Placeholder for fluency logic
        // if (wordCount > 0) {
        //     const expectedDuration = 10; // seconds
        //     const actualDuration = 10; // Need to track recording duration
        //     const wpm = wordCount / (actualDuration / 60);
        //     if (wpm > 120) points += 2; // Example bonus
        // }

        // 1. Read Aloud / Repeats / Sentence Builds (Exact Match)
        if (['readAloud', 'repeats', 'sentenceBuilds'].includes(sectionName)) {
            const target = (q.text || q.answer || '').toLowerCase();
            const sim = calculateSimilarity(userText, target);
            if (sim > 0.85) points = 10;
            else if (sim > 0.6) points = 7;
            else if (sim > 0.4) points = 4;
            else points = 1;
        }
        // 2. Short Answer (Keyword Match)
        else if (sectionName === 'shortAnswer') {
            if (q.answer && q.answer.some(ans => userText.includes(ans.toLowerCase()))) {
                points = 10;
            }
        }
        // 3. Open Ended (Story / Open)
        else {
            // Mock scoring based on length for now
            if (userText.split(' ').length > 15) points = 8;
            else if (userText.length > 5) points = 4;
            // Ideally: send to Gemini API here
        }
        return points;
    };

    const handleNext = () => {
        // Ensure we save whatever was recorded if they click next early before the timer ends
        handleStopRecording();

        // Navigation Logic
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // End of this section
            if (mode === 'full') {
                const currentIdx = sectionOrder.indexOf(sectionName);
                if (currentIdx < sectionOrder.length - 1) {
                    const nextSec = sectionOrder[currentIdx + 1];
                    const currentTestData = speakingData[testId] || speakingData["1"] || {};
                    setSectionName(nextSec);
                    setQuestions(currentTestData[nextSec] || []);
                    setCurrentQuestionIndex(0);
                    setIsInstruction(true); // Trigger instruction for new section
                } else {
                    navigate('/result', {
                        state: {
                            mode: 'speaking',
                            testResponses: testResponsesRef.current,
                            totalAppScore: score,
                            testId: 1 // Default to 1, could be dynamic later
                        }
                    });
                }
            } else {
                navigate('/result', {
                    state: {
                        mode: 'speaking',
                        isPractice: true,
                        section: sectionName,
                        testResponses: testResponsesRef.current,
                        totalAppScore: score,
                        testId: 1
                    }
                });
            }
        }
    };

    // --- Render ---

    if (showResult) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaCheck className="text-4xl text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Test Complete!</h2>
                    <p className="text-gray-500 mb-6">Great job finishing the {mode === 'full' ? 'full speaking assessment' : sectionName} module.</p>

                    <div className="bg-indigo-50 rounded-xl p-4 mb-8">
                        <span className="block text-sm text-indigo-600 font-bold uppercase tracking-wider">Estimated Score</span>
                        <span className="block text-5xl font-extrabold text-indigo-700 mt-2">{score}</span>
                    </div>

                    <button
                        onClick={() => navigate('/speaking')}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                    >
                        Back to Speaking Hub
                    </button>
                </div>
            </div>
        );
    }

    // Instruction View
    if (isInstruction) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-8 animate-pulse">
                    <FaVolumeUp className="text-4xl text-indigo-600" />
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                    Part {sectionOrder.indexOf(sectionName) + 1}: {sectionName.replace(/([A-Z])/g, ' $1').trim()}
                </h2>
                <div className="bg-gray-50 p-8 rounded-2xl max-w-2xl border border-gray-100 shadow-sm">
                    <p className="text-2xl text-gray-700 leading-relaxed font-medium">
                        "{speakingData.instructions ? speakingData.instructions[sectionName] : 'Please follow the instructions.'}"
                    </p>
                </div>
                <p className="mt-8 text-gray-400 text-sm tracking-widest uppercase">
                    Listen to instructions • Starting soon...
                </p>
            </div>
        );
    }

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return <div className="min-h-screen flex items-center justify-center">Loading Question...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Navbar */}
            <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <h1 className="font-bold text-gray-800 text-lg">Versant Speaking Test</h1>
                <div className="bg-gray-100 rounded-full px-4 py-1 text-sm font-medium text-gray-600">
                    {sectionName.replace(/([A-Z])/g, ' $1').trim()} • Q{currentQuestionIndex + 1}/{questions.length}
                </div>
            </div>

            {/* Main Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">

                {/* Question Card */}
                <div className="bg-white rounded-3xl shadow-xl w-full p-8 md:p-12 text-center transition-all duration-300">

                    {/* Status Indicator */}
                    {isListening ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold mb-8 animate-pulse">
                            <FaVolumeUp /> Playing Audio...
                        </div>
                    ) : isRecording ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full font-bold mb-8 animate-pulse">
                            <FaMicrophone /> Recording...
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-full font-bold mb-8">
                            Waiting...
                        </div>
                    )}

                    {/* Prompt Display */}
                    <div className="mb-10 min-h-[120px] flex items-center justify-center">
                        {sectionName === 'readAloud' ? (
                            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 leading-snug">
                                "{currentQ.text}"
                            </h2>
                        ) : sectionName === 'openQuestions' ? (
                            <h2 className="text-2xl font-medium text-gray-800">
                                {currentQ.question}
                            </h2>
                        ) : (
                            <div className="text-gray-400 italic text-xl flex flex-col items-center gap-2">
                                <FaVolumeUp className="text-3xl" />
                                <span>Listen carefully... (No text displayed)</span>
                            </div>
                        )}
                    </div>

                    {/* Hidden Transcript Area (For Real Test Feel) */}
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-center border-2 border-dashed border-gray-200">
                        {isRecording ? (
                            <p className="text-gray-500 animate-pulse">Recording your response...</p>
                        ) : (
                            <p className="text-gray-400">Audio will play, then recording starts automatically.</p>
                        )}
                    </div>

                    {/* Auto-Flow Controls Indicator / Visualizer */}
                    <div className="flex flex-col items-center gap-4 w-full h-32 justify-end">
                        {isRecording ? (
                            <div className="flex flex-col items-center animate-fade-in">
                                <p className="text-red-500 font-bold mb-2 animate-pulse">🔴 Recording Live...</p>
                                <canvas ref={canvasRef} width="400" height="80" className="w-full max-w-sm bg-gray-50 rounded-lg" />
                            </div>
                        ) : (
                            <div className="w-full max-w-md">
                                {isListening ? (
                                    <div className="flex flex-col items-center">
                                        <FaVolumeUp className="text-4xl text-blue-500 mb-2 animate-bounce" />
                                        <div className="h-1 w-full bg-blue-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 animate-progress"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-1 w-full bg-gray-200 rounded-full"></div>
                                )}
                            </div>
                        )}

                        <p className="text-sm text-gray-400 font-medium tracking-wide">
                            {isListening ? "Listen Carefully" : isRecording ? "Speak Now" : "Preparing..."}
                        </p>
                    </div>

                    {feedbackMessage && <p className="mt-4 text-red-500 text-sm">{feedbackMessage}</p>}

                    {/* Manual Navigation Controls (Centered Bottom) */}
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-3 px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-full font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Next Question <FaPlay className="text-xs" />
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default SpeakingTest;
