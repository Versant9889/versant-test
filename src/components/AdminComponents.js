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
        return <div className="text-center py-10 text-slate-400">Loading tracking grid...</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700/50">
                    <tr>
                        <th className="px-6 py-4">Identity</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Total Actions</th>
                        <th className="px-6 py-4">Last Ping</th>
                        <th className="px-6 py-4">Current URL Path</th>
                        <th className="px-6 py-4">Live Track</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {users.map((session) => (
                        <tr key={session.userId} className="hover:bg-slate-800/50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner ${session.isRegistered ? 'bg-indigo-600' : 'bg-slate-600'}`}>
                                            {session.email[0].toUpperCase()}
                                        </div>
                                        {session.isOnline && (
                                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white tracking-wide">
                                            {session.isRegistered ? session.email : 'Anonymous Guest'}
                                        </div>
                                        <div className="text-xs font-mono text-slate-500">{session.userId.slice(0, 15)}...</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${session.isRegistered
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                    : 'bg-slate-700/30 text-slate-400 border border-slate-600/30'
                                    }`}>
                                    {session.isRegistered ? 'Registered User' : 'Web Traffic'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-slate-300">
                                {session.totalClicks} <span className="text-slate-500 text-xs font-sans">clicks</span>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-slate-400">
                                {new Date(session.lastActive).toLocaleTimeString()}
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-xs font-mono text-emerald-400 bg-emerald-900/10 px-2 py-1 rounded inline-block truncate max-w-[150px]">
                                    {session.currentPath}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent('open-user-modal', { detail: session }))}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 rounded text-xs font-bold text-white transition-colors"
                                >
                                    Inspect Route
                                </button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-mono">
                                No radar contacts found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// Detailed Session Tracking Modal
export function UserDetailsModal({ user: session, onClose }) {
    if (!session) return null;

    // session.history contains the chronological array of analytics_events
    // We reverse it to show newest at the top, or oldest at top. Let's do newest at top.
    const history = [...(session.history || [])].sort((a,b) => b.time - a.time);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm font-sans">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg ${session.isRegistered ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                            {session.email[0].toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white">{session.isRegistered ? session.email : 'Anonymous Web Guest'}</h2>
                                {session.isOnline && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
                                        Live Now
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-400 font-mono text-xs mt-1">ID: {session.userId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto bg-slate-950 flex-1">
                    
                    {/* Security Info */}
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 mb-8 flex justify-between items-center">
                        <div>
                            <div className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Session Data</div>
                            <div className="text-white font-mono text-sm">{history.length} Event Packets Intercepted</div>
                        </div>
                        <div className="text-right">
                            <div className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">User Agent</div>
                            <div className="text-slate-400 font-mono text-xs truncate max-w-[200px]" title={history[0]?.userAgent}>{history[0]?.userAgent || 'Unknown System'}</div>
                        </div>
                    </div>

                    {/* True Chronological Timeline */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span>📡</span> Real-Time Action Log
                        </h3>
                        
                        <div className="relative pl-4 border-l-2 border-slate-800/80 space-y-6">
                            {history.map((evt, idx) => {
                                const isLatest = idx === 0;
                                return (
                                    <div key={evt.id || idx} className="relative group">
                                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-slate-950 ${isLatest ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-600'}`}></div>
                                        
                                        <div className="flex gap-4 items-start">
                                            <div className="w-20 pt-0.5 text-xs font-mono text-slate-500 flex-shrink-0">
                                                {evt.time.toLocaleTimeString()}
                                            </div>
                                            <div className={`flex-1 rounded-lg p-3 border border-transparent group-hover:bg-slate-900 group-hover:border-slate-800 transition-colors ${isLatest ? 'bg-slate-900/50 border-slate-800/50' : ''}`}>
                                                <div className="text-xs font-bold tracking-wider text-indigo-400 mb-1">[{evt.eventType}]</div>
                                                <div className="text-sm text-white font-mono flex items-center gap-2">
                                                    <span className="text-slate-500">→</span> {evt.path}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
