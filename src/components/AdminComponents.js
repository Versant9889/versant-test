import React from 'react';

// Admin Navigation
export function AdminNav({ onLogout }) {
    return (
        <nav className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-20 font-sans text-white">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold tracking-tight">VersantPro <span className="text-indigo-400">Admin</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors text-sm"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

// Admin Stats Card
export function AdminStatCard({ title, value, icon, color }) {
    const colorClasses = {
        indigo: "bg-indigo-500/10 text-indigo-400",
        emerald: "bg-emerald-500/10 text-emerald-400",
        amber: "bg-amber-500/10 text-amber-400",
        rose: "bg-rose-500/10 text-rose-400",
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color] || colorClasses.indigo}`}>
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-slate-400 font-medium">{title}</div>
        </div>
    );
}

// User List Table
export function UserTable({ users, loading }) {
    if (loading) {
        return <div className="text-center py-10 text-slate-400">Loading users...</div>;
    }

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">Registered Users</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 font-semibold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Tests Taken</th>
                            <th className="px-6 py-4">Last Active</th>
                            <th className="px-6 py-4">Current Page</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-700/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white">
                                                {user.email[0].toUpperCase()}
                                            </div>
                                            {user.isOnline && (
                                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{user.name || 'User'}</div>
                                            <div className="text-xs text-slate-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.plan === 'Premium'
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-slate-600/20 text-slate-400'
                                        }`}>
                                        {user.plan || 'Free'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-300">
                                    {user.testsCount || 0}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400">
                                    {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400 truncate max-w-xs font-mono">
                                    {user.currentPath || 'Unknown'}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('open-user-modal', { detail: user }))}
                                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Inspect
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// User Details Modal
export function UserDetailsModal({ user, onClose }) {
    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                            <p className="text-slate-400">{user.email}</p>
                            <div className="flex gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.plan === 'Premium' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                                    {user.plan} Plan
                                </span>
                                {user.isOnline && (
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/20">
                                        ● Online Now
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-8">
                    {/* Activity Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div className="text-slate-400 text-sm mb-1">Joined</div>
                            <div className="text-white font-mono">{user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div className="text-slate-400 text-sm mb-1">Last Active</div>
                            <div className="text-white font-mono">{user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}</div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-indigo-900/50 to-violet-900/50 p-5 rounded-2xl border border-indigo-500/20 flex divide-x divide-indigo-500/20">
                        <div className="flex-1 text-center">
                            <div className="text-2xl font-bold text-white">{user.testsCount}</div>
                            <div className="text-indigo-300 text-xs uppercase tracking-wider mt-1">Tests Completed</div>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="text-2xl font-bold text-white">
                                {user.totalTimeSpent ? Math.round(user.totalTimeSpent) + "m" : "< 1m"}
                            </div>
                            <div className="text-indigo-300 text-xs uppercase tracking-wider mt-1">Total Time Spent</div>
                        </div>
                    </div>

                    {/* Timeline (Mock) */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Activity Timeline</h3>
                        <div className="relative pl-4 border-l-2 border-slate-800 space-y-6">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-900"></div>
                                <div className="text-slate-300 text-sm">Account Created</div>
                                <div className="text-slate-500 text-xs">{user.joinedAt ? new Date(user.joinedAt).toLocaleString() : 'N/A'}</div>
                            </div>

                            {/* If we had session data, we would map it here. For now, showing current status */}
                            {user.currentPath && (
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-slate-900 animate-pulse"></div>
                                    <div className="text-indigo-300 text-sm font-bold">Currently Viewing</div>
                                    <div className="text-slate-400 text-xs font-mono bg-slate-800 inline-block px-2 py-1 rounded mt-1">{user.currentPath}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3 sticky bottom-0">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">
                        Reset Password
                    </button>
                    <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-sm font-medium transition-colors">
                        Ban User
                    </button>
                </div>
            </div>
        </div>
    );
}
