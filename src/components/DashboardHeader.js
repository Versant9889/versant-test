import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const DashboardHeader = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            alert('Signed out successfully!');
            navigate('/');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    <h1 className="text-2xl font-bold tracking-tight">English Mastery</h1>
                </div>
                <nav className="flex items-center space-x-6">
                    <button onClick={() => navigate('/dashboard')} className="text-sm font-medium hover:text-green-500 transition-colors duration-200 transform hover:scale-105">
                        Dashboard
                    </button>
                    <button onClick={() => navigate('/practice')} className="text-sm font-medium hover:text-green-500 transition-colors duration-200 transform hover:scale-105">
                        Practice Hub
                    </button>
                    <button onClick={() => navigate('/')} className="text-sm font-medium hover:text-green-500 transition-colors duration-200 transform hover:scale-105">
                        Home
                    </button>
                    <button onClick={handleSignOut} className="flex items-center space-x-2 text-sm font-medium bg-green-700 px-4 py-2 rounded-full hover:bg-green-600 transition-all duration-200">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default DashboardHeader;
