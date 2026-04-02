import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaMicrophone, FaHeadphones, FaQuestion, FaPuzzlePiece, FaBookOpen, FaCommentDots, FaLock, FaUnlock, FaPlay, FaVolumeMute, FaCheckCircle } from 'react-icons/fa';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../App.css';

const speakingSections = [
    { name: 'Read Aloud', path: '/pearson-versant-mock-test/module/readAloud', icon: <FaBookOpen />, description: 'Read the displayed sentence aloud clearly.' },
    { name: 'Repeats', path: '/pearson-versant-mock-test/module/repeats', icon: <FaMicrophone />, description: 'Listen to a sentence and repeat it exactly.' },
    { name: 'Short Answer', path: '/pearson-versant-mock-test/module/shortAnswer', icon: <FaQuestion />, description: 'Listen to a question and answer with a single word or phrase.' },
    { name: 'Sentence Builds', path: '/pearson-versant-mock-test/module/sentenceBuilds', icon: <FaPuzzlePiece />, description: 'Listen to jumbled phrases and rearrange them into a sentence.' },
    { name: 'Story Retelling', path: '/pearson-versant-mock-test/module/storyRetelling', icon: <FaHeadphones />, description: 'Listen to a short story and retell it in your own words.' },
    { name: 'Open Questions', path: '/pearson-versant-mock-test/module/openQuestions', icon: <FaCommentDots />, description: 'Speak for 40 seconds on a general topic.' },
];

const SpeakingHub = () => {
    const navigate = useNavigate();
    const [isPremium, setIsPremium] = useState(false);

    // Tests 1-20
    const tests = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Full Speaking Test ${i + 1}`,
        desc: 'Complete assessment including all 6 sections.',
        duration: '18 mins',
        questions: 63
    }));

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                // Check either paidTests or hasPaid just to be safe
                if (docSnap.exists() && (docSnap.data().paidTests || docSnap.data().hasPaid)) {
                    setIsPremium(true);
                } else {
                    setIsPremium(false);
                }
            } else {
                setIsPremium(false);
            }
        });
        
        return () => unsubscribe();
    }, []);

    const handleStartTest = (testId) => {
        if (!isPremium && testId > 1) {
            navigate('/pricing');
            return;
        }
        navigate('/pearson-versant-mock-test/module/full', { state: { testId } });
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Helmet>
                <title>Speaking & Listening Hub | VersantPro</title>
                <meta name="description" content="Master your Versant speaking and listening skills with targeted practice." />
            </Helmet>
            <Header page="speakingHub" />

            {/* Hero Section */}
            <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-16 px-4 text-center shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <FaHeadphones className="text-4xl text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Speaking & Listening Practice</h1>
                    <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto font-medium">
                        Sharpen your pronunciation, fluency, and comprehension with our AI-powered mock tests.
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">

                {/* Full Tests Section */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm">
                            <FaMicrophone />
                        </span>
                        Full Mock Tests (1-20)
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tests.map((test) => {
                            const isLocked = !isPremium && test.id > 1;

                            return (
                                <button
                                    key={test.id}
                                    onClick={() => handleStartTest(test.id)}
                                    className={`group flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left ${isLocked
                                        ? 'bg-gray-50 border-gray-100 opacity-70 hover:opacity-100' // Locked state
                                        : 'bg-white border-emerald-50 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1' // Active
                                        }`}
                                >
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 mb-1">{test.title}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                            <span>⏱ {test.duration}</span>
                                        </div>
                                    </div>

                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLocked ? 'bg-gray-200 text-gray-400' : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors'
                                        }`}>
                                        {isLocked ? <FaLock className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Section Practice */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm">
                            <FaPuzzlePiece />
                        </span>
                        Practice by Section
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {speakingSections.map((section) => (
                            <Link
                                key={section.name}
                                to={section.path}
                                className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 group-hover:w-2 transition-all"></div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                            {section.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                            {section.description}
                                        </p>
                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Start Practice <FaPlay className="text-[10px]" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </main>

            <Footer />

        </div>
    );
};

export default SpeakingHub;
