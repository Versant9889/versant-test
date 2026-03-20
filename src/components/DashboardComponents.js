import React from 'react';
import { FaUserCircle, FaSignOutAlt, FaTrophy, FaClipboardList, FaChartLine, FaStar, FaCheckCircle } from 'react-icons/fa';

// Dashboard Navigation Component
export function DashboardNav({ studentData, onLogout }) {
    return (
        <nav className="w-full bg-white border-b border-gray-100/50 sticky top-0 z-30 font-sans backdrop-blur-md bg-white/80">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                        VersantPro
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-gray-900">{studentData.name}</div>
                        <div className="text-xs text-gray-500">{studentData.email}</div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 font-semibold rounded-lg transition-all border border-gray-200 hover:border-red-200"
                    >
                        <FaSignOutAlt className="text-sm" /> Logout
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
            {/* Highest Score */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        <FaTrophy />
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Score</span>
                </div>
                <div className="text-3xl font-extrabold text-gray-900 mb-1">
                    {studentData.currentScore > 0 ? studentData.currentScore : '-'}<span className="text-gray-400 text-lg">/80</span>
                </div>
                <div className="text-sm text-gray-500 font-medium">Highest Score</div>
            </div>

            {/* Tests Completed */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        <FaClipboardList />
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Activity</span>
                </div>
                <div className="text-3xl font-extrabold text-gray-900 mb-1">{studentData.testsAttempted}</div>
                <div className="text-sm text-gray-500 font-medium">Tests Completed</div>
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        <FaChartLine />
                    </div>
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Avg</span>
                </div>
                <div className="text-3xl font-extrabold text-gray-900 mb-1">
                    {studentData.averageScore > 0 ? studentData.averageScore : '-'}
                </div>
                <div className="text-sm text-gray-500 font-medium">Average Score</div>
            </div>

            {/* Plan Status (Mini) */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-white/20 transition-all"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 opacity-90">
                        <FaStar className="text-yellow-300" />
                        <span className="text-xs font-bold uppercase tracking-wider">Plan Status</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{studentData.plan}</div>
                    <div className="text-emerald-100 text-sm">Active Member</div>
                </div>
            </div>
        </div>
    );
}

// Plan Status Component (Legacy - can be removed if not used, or kept for full width)
export function PlanStatus({ studentData }) {
    return null; // Merged into Quick Stats or not needed
}

// Skill Breakdown Component
export function SkillBreakdown({ skillBreakdown }) {
    const skills = [
        { name: 'Reading', score: skillBreakdown.reading, color: 'bg-emerald-500' },
        { name: 'Writing', score: skillBreakdown.writing, color: 'bg-teal-500' },
        { name: 'Speaking', score: skillBreakdown.speaking, color: 'bg-blue-500' },
        { name: 'Listening', score: skillBreakdown.listening, color: 'bg-indigo-500' }
    ];

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaChartLine className="text-emerald-600" /> Skill Analysis
            </h2>
            <div className="space-y-6">
                {skills.map((skill) => (
                    <div key={skill.name}>
                        <div className="flex justify-between mb-2 text-sm">
                            <span className="text-gray-600 font-medium">{skill.name}</span>
                            <span className="text-gray-900 font-bold">{skill.score || 0}/80</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`${skill.color} h-2.5 rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${((skill.score || 0) / 80) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Account Details Component
export function AccountDetails({ studentData }) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaUserCircle className="text-emerald-600" /> Profile
            </h2>
            <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Name</div>
                    <div className="text-gray-900 font-medium">{studentData.name}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Email</div>
                    <div className="text-gray-900 font-medium">{studentData.email}</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                    <div className="text-xs text-emerald-600 font-semibold uppercase mb-1">Plan</div>
                    <div className="text-emerald-900 font-bold">{studentData.plan}</div>
                </div>
            </div>
        </div>
    );
}

// Available Tests Component (Deprecated in new design, but kept for safety if needed)
export function AvailableTests({ tests, onStartTest }) {
    return null;
}

// Test History Component
export function TestHistory({ completedTests }) {
    const formatDate = (dateString) => {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'text-emerald-600 bg-emerald-50';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            </div>

            {completedTests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    No tests completed yet. Start your first test today!
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Test</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {completedTests.slice(0, 5).map((test) => (
                                <tr key={test.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {test.testId && test.testId !== 'unknown' ? `Test ${test.testId}` : 'Versant Practice'}
                                        </div>
                                        <div className="text-xs text-gray-500 capitalize">{test.type || 'Full Test'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(test.timestamp)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getScoreColor(test.totalScore || 0)}`}>
                                            {test.totalScore}/80
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase">
                                            <FaCheckCircle className="text-emerald-500" /> Completed
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


