import React from 'react';

// Dashboard Navigation Component
export function DashboardNav({ studentData, onLogout }) {
    return (
        <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 font-sans">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">VersantPro</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-gray-900">{studentData.name}</div>
                        <div className="text-xs text-gray-500">{studentData.email}</div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

// Quick Stats Component
export function QuickStats({ studentData }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 font-sans">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                    {studentData.currentScore > 0 ? studentData.currentScore : '-'}/80
                </div>
                <div className="text-sm text-gray-600 font-medium">Highest Score</div>
                <div className="mt-3 flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>Target: 80</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{studentData.testsAttempted}</div>
                <div className="text-sm text-gray-600 font-medium">Tests Completed</div>
                <div className="mt-3 text-blue-600 text-sm font-semibold">Keep practicing!</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{studentData.testsRemaining}</div>
                <div className="text-sm text-gray-600 font-medium">Tests Remaining</div>
                <div className="mt-3 text-purple-600 text-sm font-semibold">Plan active</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                    </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{studentData.averageScore > 0 ? studentData.averageScore : '-'}</div>
                <div className="text-sm text-gray-600 font-medium">Average Score</div>
                <div className="mt-3 text-orange-600 text-sm font-semibold">Consistent effort!</div>
            </div>
        </div>
    );
}

// Plan Status Component
export function PlanStatus({ studentData }) {
    const formatDate = (dateString) => {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-8 text-white shadow-lg font-sans">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-2xl font-bold mb-1">{studentData.plan} Plan</div>
                        <div className="text-emerald-100">Valid until {formatDate()}</div>
                    </div>
                </div>
                <button className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors">
                    Upgrade Plan
                </button>
            </div>
        </div>
    );
}

// Skill Breakdown Component
export function SkillBreakdown({ skillBreakdown }) {
    const skills = [
        { name: 'Reading', score: skillBreakdown.reading, color: 'from-emerald-500 to-teal-500' },
        { name: 'Writing', score: skillBreakdown.writing, color: 'from-emerald-500 to-teal-500' },
        { name: 'Speaking', score: skillBreakdown.speaking, color: 'from-emerald-500 to-teal-500' },
        { name: 'Listening', score: skillBreakdown.listening, color: 'from-emerald-500 to-teal-500' }
    ];

    return (
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 font-sans">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Skill Breakdown</h2>
            <div className="space-y-5">
                {skills.map((skill) => (
                    <div key={skill.name}>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-700 font-semibold">{skill.name}</span>
                            <span className="text-emerald-600 font-bold">{skill.score || 0}/80</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`bg-gradient-to-r ${skill.color} h-3 rounded-full transition-all`}
                                style={{ width: `${((skill.score || 0) / 80) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <div className="font-semibold text-emerald-900 mb-1">Recommendation</div>
                        <div className="text-sm text-emerald-700">
                            Focus on all areas to improve your overall Versant score.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Account Details Component
export function AccountDetails({ studentData }) {
    const formatDate = (dateString) => {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 font-sans">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Details</h2>
            <div className="space-y-4">
                <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Full Name</div>
                    <div className="text-gray-900 font-medium">{studentData.name}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Email</div>
                    <div className="text-gray-900 font-medium">{studentData.email}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Status</div>
                    <div className="text-gray-900 font-medium text-sm">Active Member</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Last Login</div>
                    <div className="text-gray-900 font-medium">{formatDate()}</div>
                </div>
            </div>
        </div>
    );
}

// Available Tests Component
export function AvailableTests({ tests, onStartTest }) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8 font-sans">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Available Tests</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tests.map((test) => (
                    <div key={test.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all">
                        {test.recommended && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-3">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                RECOMMENDED
                            </div>
                        )}
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{test.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {test.duration || '50 mins'}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">{test.level || 'Intermediate'}</span>
                        </div>
                        <button
                            onClick={() => onStartTest(test)}
                            disabled={!test.paid}
                            className={`w-full text-white font-semibold py-3 rounded-lg transition-all ${test.paid
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                                    : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {test.paid ? 'Start Test' : 'Locked'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Test History Component
export function TestHistory({ completedTests }) {
    const formatDate = (dateString, timeString) => {
        // If we have a timestamp, use it. If separate date/time, handle accordingly.
        // Assuming dateString might be a timestamp number or string
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'bg-green-100 text-green-700';
        if (score >= 60) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 font-sans">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Test History</h2>
            {completedTests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tests completed yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    Test Name
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    Score
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    Result
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedTests.map((test) => (
                                <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                        {test.testId && test.testId !== 'unknown' ? `Test ${test.testId}` : 'Versant Test'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{formatDate(test.timestamp)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(test.totalScore || 0)}`}>
                                            {test.totalScore}/80
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-emerald-600 font-semibold text-sm">
                                            Completed
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
