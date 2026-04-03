
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaPenNib, FaBookOpen, FaLock, FaUnlock, FaCheckCircle, FaStar } from 'react-icons/fa';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ReadingHub = () => {
    const navigate = useNavigate();
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    // Tests 1-20
    const tests = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Mock Test ${i + 1}`,
        description: `Full Reading & Writing Assessment ${i + 1}`,
        duration: '50 mins',
        questions: 35,
        difficulty: i < 5 ? 'Easy' : i < 15 ? 'Medium' : 'Hard' // Progressive difficulty
    }));

    useEffect(() => {
        const checkAccess = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().paidTests) {
                    setIsPremium(true);
                }
            }
            setLoading(false);
        };
        checkAccess();
    }, []);

    const handleStartTest = (testId) => {
        // Temporarily unlock all tests for development/testing
        // if (!isPremium && testId > 1) {
        //     alert("Upgrade to Premium to access all 20 tests!");
        //     return;
        // }
        navigate('/versant-reading-and-writing-mock-test/start', { state: { testId } });
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Helmet>
                <title>Reading & Writing Hub | VersantPro</title>
            </Helmet>
            <Header page="readingHub" />

            <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="text-center mb-12 animate-fade-in-down">
                    <span className="inline-block p-3 rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
                        <FaPenNib className="text-3xl" />
                    </span>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Reading & Writing Practice</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Master grammar, vocabulary, and composition with our 20 comprehensive mock tests.
                    </p>
                </div>

                {/* Tests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tests.map((test) => {
                        // Temporarily unlock all tests
                        const isLocked = false; // !isPremium && test.id > 1;

                        return (
                            <div
                                key={test.id}
                                className={`relative group bg-white rounded-2xl p-6 border-2 transition-all duration-300 ${isLocked
                                    ? 'border-gray-100 opacity-75 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'
                                    : 'border-emerald-50 hover:border-emerald-500 shadow-sm hover:shadow-xl hover:-translate-y-1'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${isLocked ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-600'}`}>
                                        <FaBookOpen className="text-xl" />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${test.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                        test.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {test.difficulty}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{test.title}</h3>
                                <p className="text-sm text-gray-500 mb-6">{test.description}</p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 font-medium">
                                    <span>⏱ {test.duration}</span>
                                    <span>📝 {test.questions} Qs</span>
                                </div>

                                <button
                                    onClick={() => handleStartTest(test.id)}
                                    disabled={isLocked}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isLocked
                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-900 text-white hover:bg-emerald-600 shadow-lg hover:shadow-emerald-200'
                                        }`}
                                >
                                    {isLocked ? (
                                        <>Locked <FaLock className="text-xs" /></>
                                    ) : (
                                        <>Start Test <FaUnlock className="text-xs" /></>
                                    )}
                                </button>

                                {!isPremium && test.id === 1 && (
                                    <div className="absolute top-2 right-2">
                                        <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow animate-bounce">
                                            FREE
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ReadingHub;
