import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaPlayCircle, FaCheckCircle, FaStar, FaChartPie, FaMicrophoneAlt, FaGlobe, FaArrowRight } from 'react-icons/fa';

export default function VersantHomepage() {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full min-h-screen overflow-auto bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
      <Helmet>
        <title>Versant Practice Test 2026 | Accurate AI Speaking Simulator</title>
        <meta name="description" content="Pass the Versant English Test on your first try. Get instant AI grading on pronunciation, sentence builds, and story retelling with our 20 full-length mock exams." />
      </Helmet>

      <Header />

      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-32 px-6 overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-emerald-100 text-sm font-semibold mb-8 border border-white/20 shadow-lg">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span> 
            Updated for 2026 Industry Standards
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight drop-shadow-md">
            Pass the Versant Test <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">On Your First Try</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-emerald-50 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Stop guessing your score. Get instant AI grading on your fluency, pronunciation, and vocabulary with 20 hyper-realistic mock exams.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto mt-4 relative z-20">
            {/* Speaking & Listening Demo Card */}
            <div 
              onClick={() => navigate('/versant-mock-test/module/full', { state: { testId: 1 } })}
              className="cursor-pointer group flex flex-col items-center p-8 bg-emerald-950/40 backdrop-blur-md rounded-[2rem] border border-emerald-500/30 hover:bg-emerald-900/60 hover:border-emerald-400 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(16,185,129,0.4)]"
            >
               <FaMicrophoneAlt className="text-5xl text-emerald-400 mb-5 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Evaluate your skills</h3>
               <p className="text-emerald-100/90 mb-8 font-medium text-lg">Take a Free Speaking Demo Test</p>
               <span className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full text-slate-900 font-extrabold group-hover:from-emerald-400 group-hover:to-teal-300 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                 Start Demo <FaArrowRight className="text-xl" />
               </span>
            </div>

            {/* Reading & Writing Demo Card */}
            <div 
              onClick={() => navigate('/test', { state: { testId: 1 } })}
              className="cursor-pointer group flex flex-col items-center p-8 bg-teal-950/40 backdrop-blur-md rounded-[2rem] border border-teal-500/30 hover:bg-teal-900/60 hover:border-teal-400 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(20,184,166,0.3)]"
            >
               <FaGlobe className="text-5xl text-teal-400 mb-5 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Evaluate your skills</h3>
               <p className="text-teal-100/90 mb-8 font-medium text-lg">Reading & Writing Demo Test</p>
               <span className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full text-slate-900 font-extrabold group-hover:from-teal-400 group-hover:to-emerald-300 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                 Start Demo <FaArrowRight className="text-xl" />
               </span>
            </div>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-4 text-emerald-200/80 text-sm font-medium">
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-emerald-900" src="https://i.pravatar.cc/100?img=1" alt="User" />
              <img className="w-10 h-10 rounded-full border-2 border-emerald-900" src="https://i.pravatar.cc/100?img=2" alt="User" />
              <img className="w-10 h-10 rounded-full border-2 border-emerald-900" src="https://i.pravatar.cc/100?img=3" alt="User" />
              <img className="w-10 h-10 rounded-full border-2 border-emerald-900" src="https://i.pravatar.cc/100?img=4" alt="User" />
            </div>
            <div className="text-left leading-tight">
              <div className="flex text-yellow-400 mb-0.5"><FaStar/><FaStar/><FaStar/><FaStar/><FaStar/></div>
              <span>Trusted by 5,000+ students globally</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Sneak Peek (Visual Hook) */}
      <section className="relative w-full max-w-6xl mx-auto -mt-16 px-6 z-20 slide-up delay-200">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-2">
           <div className="bg-slate-100 rounded-t-2xl py-3 px-4 flex items-center gap-2 border-b border-slate-200">
             <div className="w-3 h-3 rounded-full bg-red-400"></div>
             <div className="w-3 h-3 rounded-full bg-amber-400"></div>
             <div className="w-3 h-3 rounded-full bg-green-400"></div>
             <div className="ml-4 text-xs font-mono text-slate-500 flex-1 text-center">dashboard.versantpro.com</div>
           </div>
           {/* Mockup Dashboard Image / HTML Representation */}
           <div className="p-8 bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
             <div className="md:col-span-2 space-y-6">
                <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
                <div className="h-8 w-64 bg-slate-300 rounded-full"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-slate-400 text-sm mb-2">Overall Score</div>
                    <div className="text-4xl font-bold text-emerald-600">68<span className="text-2xl text-slate-400">/80</span></div>
                  </div>
                  <div className="h-32 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                    <div className="text-slate-400 text-sm mb-2">Fluency Level</div>
                    <div className="text-2xl font-bold text-slate-800">Advanced (C1)</div>
                  </div>
                </div>
                <div className="h-20 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-800">Speaking Test 1 Complete</div>
                    <div className="text-sm text-emerald-600">AI Audio analysis finished in 2.4s</div>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">Review Mistakes</button>
                </div>
             </div>
             <div className="hidden md:flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm h-full">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 36 36" className="w-full h-full text-emerald-500 drop-shadow-md">
                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-emerald-500" strokeDasharray="80, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-black text-slate-800">80%</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">GSE Scale</span>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Everything you need to succeed</h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
            Traditional coaching centers charge $500+. We built the exact same AI evaluation infrastructure for a fraction of the price.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "20 Full Mock Exams", desc: "Never run out of practice material. We generated 1260+ unique questions mirroring the exact real exam difficulty.", icon: <FaGlobe className="w-8 h-8"/>, color: "text-blue-500", bg: "bg-blue-50" },
            { title: "Offline Voice AI", desc: "Our proprietary algorithm analyzes your speech offline, ensuring 100% privacy and zero latency during your test.", icon: <FaMicrophoneAlt className="w-8 h-8"/>, color: "text-emerald-500", bg: "bg-emerald-50" },
            { title: "Radar Analytics", desc: "Identify whether your grammar, fluency, pronunciation, or vocabulary is dragging your score down.", icon: <FaChartPie className="w-8 h-8"/>, color: "text-purple-500", bg: "bg-purple-50" },
          ].map((feat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
              <div className={`w-16 h-16 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center mb-6`}>
                {feat.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{feat.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="w-full bg-slate-900 text-white py-24 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Don't just take our word for it</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Rahul Sharma", score: "68 -> 76", review: "I failed my corporate Versant round twice. After practicing 10 mock tests here, I finally cleared it and got the job. The AI feedback on sentence tracking is insanely accurate." },
              { name: "Jessica T.", score: "54 -> 65", review: "The audio visualizer helped me realize I was pausing too much during the Story Retelling section. The UI is exactly like the real exam." },
              { name: "Ahmed K.", score: "72 -> 79", review: "Worth every penny. The radar charts pinpointed my vocabulary weakness. The instant grading saves days of waiting for a human tutor." }
            ].map((test, idx) => (
              <div key={idx} className="bg-slate-800/80 backdrop-blur border border-slate-700 p-8 rounded-3xl relative">
                <div className="flex text-yellow-500 mb-6 text-xl"><FaStar/><FaStar/><FaStar/><FaStar/><FaStar/></div>
                <p className="text-slate-300 mb-8 italic text-lg leading-relaxed">"{test.review}"</p>
                <div className="flex justify-between items-center border-t border-slate-700 pt-6">
                  <div>
                    <div className="font-bold text-white mb-1">{test.name}</div>
                    <div className="text-emerald-400 text-sm font-mono bg-emerald-900/40 px-3 py-1 rounded-full inline-block">Score: {test.score}</div>
                  </div>
                  <FaCheckCircle className="text-emerald-500 text-3xl opacity-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full px-6 py-24 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Ready to secure your future?</h2>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">Sign up now and get your very first full-length Mock Test completely free. No credit card required.</p>
        <button 
          onClick={() => navigate('/signup')} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-6 rounded-full font-extrabold text-2xl shadow-2xl transition-all transform hover:scale-105"
        >
          Create Free Account
        </button>
        <div className="mt-6 text-slate-500 text-sm">Takes 30 seconds. Instant Access.</div>
      </section>

      <Footer />
    </div>
  );
}