import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaPen, FaPuzzlePiece, FaKeyboard, FaRandom, FaEnvelope, FaParagraph } from 'react-icons/fa';
import '../App.css';

const practiceSections = [
  { name: 'Typing Test', path: '/practice/typing', icon: <FaKeyboard />, description: 'Test your typing speed and accuracy.' },
  { name: 'Sentence Completion', path: '/practice/sentenceCompletion', icon: <FaPen />, description: 'Complete sentences with the correct words.' },
  { name: 'Fill in the Blanks', path: '/practice/fillBlanks', icon: <FaPuzzlePiece />, description: 'Fill in the blanks to complete the sentences.' },
  { name: 'Jumbled Words', path: '/practice/jumbledWords', icon: <FaRandom />, description: 'Unscramble the words to form a correct sentence.' },
  { name: 'Email Writing', path: '/practice/emailWriting', icon: <FaEnvelope />, description: 'Practice writing professional emails.' },
  { name: 'Passage Reconstruction', path: '/practice/passageReconstruction', icon: <FaParagraph />, description: 'Read a passage and then reconstruct it.' },
];

const PracticeHub = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Practice Hub | Versant Practice Test</title>
        <meta name="description" content="Practice Versant test sections individually to master your skills." />
      </Helmet>
      <Header page="practiceHub" />

      <main>
        {/* Hero Section */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900">Practice Hub</h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Practice section individually
            </p>
          </div>
        </header>

        {/* Practice Sections Grid */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {practiceSections.map((section) => (
              <Link
                key={section.name}
                to={section.path}
                className="card-split rounded-xl overflow-hidden shadow-lg group"
              >
                <div className="split-accent p-6 pb-4">
                  <div className="w-12 h-12 rounded-lg bg-white bg-opacity-20 flex items-center justify-center mb-3">
                    {React.cloneElement(section.icon, { className: 'w-6 h-6 text-white' })}
                  </div>
                  <h2 className="text-white font-bold text-xl mb-1">{section.name}</h2>
                  <p className="text-green-100 text-sm">Practice Now</p>
                </div>
                <div className="bg-white p-6 pt-4">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{section.description}</p>
                  <button className="button-style bg-green-600 text-white font-semibold py-2 px-5 rounded-lg w-full hover:bg-green-700">
                    Start Practicing
                  </button>
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

export default PracticeHub;