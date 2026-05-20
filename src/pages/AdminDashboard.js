import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, limit, deleteDoc, doc, where, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { AdminNav, AdminStatCard, UserTable, UserDetailsModal } from '../components/AdminComponents';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [liveEvents, setLiveEvents] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [indexErrorUrl, setIndexErrorUrl] = useState(null);
    const [isFlushing, setIsFlushing] = useState(false);
    const [premiumUserIds, setPremiumUserIds] = useState(new Set());
    const [premiumUsersList, setPremiumUsersList] = useState([]);

    // Manual Access Grant State
    const [grantEmail, setGrantEmail] = useState('');
    const [grantPaymentId, setGrantPaymentId] = useState('');
    const [grantLoading, setGrantLoading] = useState(false);
    const [grantMessage, setGrantMessage] = useState(null); // { type: 'success'|'error', text: '' }

    // Affiliate Tracking State
    const [affiliateFilter, setAffiliateFilter] = useState(null);
    
    const [stats, setStats] = useState({
        totalUsers: 0,
        premiumUsers: 0,
        totalTests: 0,
        activeNow: 0
    });

    const [selectedSession, setSelectedSession] = useState(null); // For Modal

    // Change Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Listen for Inspect Modal Event from sub-components
    useEffect(() => {
        const handleOpenModal = (e) => setSelectedSession(e.detail);
        window.addEventListener('open-user-modal', handleOpenModal);
        return () => window.removeEventListener('open-user-modal', handleOpenModal);
    }, []);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            if (!user || user.email !== 'admin@versantapp.com') {
                if (!user) navigate('/admin/login');
                setLoading(false);
                return;
            }

            const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
                let total = snap.size;
                let premium = 0;
                let tests = 0;
                let premiumSet = new Set();
                let premiumList = [];
                snap.docs.forEach(d => {
                    const data = d.data();
                    // Check all possible legacy and current premium flags
                    if (data.paidTests || data.hasPaid || data.isPremium) {
                        premium++;
                        premiumSet.add(d.id);
                        premiumList.push({ id: d.id, ...data });
                    }
                    tests += data.testsCompleted || 0;
                });
                
                // Sort premium list by most recent activity
                premiumList.sort((a, b) => {
                    const timeA = a.lastActive?.toDate() || 0;
                    const timeB = b.lastActive?.toDate() || 0;
                    return timeB - timeA;
                });

                setPremiumUserIds(premiumSet);
                setPremiumUsersList(premiumList);
                setStats(s => ({ ...s, totalUsers: total, premiumUsers: premium, totalTests: tests }));
            });

            // 2. Analytics Events Collection (The Real-Time Engine)
            const qEvents = query(collection(db, 'analytics_events'), orderBy('timestamp', 'desc'), limit(500));
            
            const unsubEvents = onSnapshot(qEvents, (snap) => {
                setIndexErrorUrl(null); // clear errors if successful
                const events = [];
                snap.docs.forEach(doc => {
                    const data = doc.data();
                    events.push({ id: doc.id, ...data, time: data.timestamp?.toDate() || new Date() });
                });
                
                setLiveEvents(events);

                // Group Raw Events into "Sessions" to track active ghosts/users
                const sessionsMap = {};
                let activeCount = 0;
                const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

                events.forEach(evt => {
                     // The array is ordered newest first. 
                     // The FIRST time we encounter a userId, that is their "Current" state.
                     if (!sessionsMap[evt.userId]) {
                         const isOnline = evt.time > fiveMinsAgo;
                         if (isOnline) activeCount++;
                         
                         sessionsMap[evt.userId] = {
                             userId: evt.userId,
                             email: evt.email || 'Anonymous',
                             isRegistered: evt.isRegistered,
                             currentPath: evt.path,
                             lastActive: evt.time.toISOString(),
                             isOnline: isOnline,
                             totalClicks: 1,
                             history: [evt] // Seed history array
                         };
                     } else {
                         // Append older history events
                         sessionsMap[evt.userId].totalClicks++;
                         sessionsMap[evt.userId].history.push(evt);
                     }
                });

                const sessionsArray = Object.values(sessionsMap).sort((a,b) => new Date(b.lastActive) - new Date(a.lastActive));
                setActiveSessions(sessionsArray);
                setStats(s => ({ ...s, activeNow: activeCount }));
                setLoading(false);

            }, (err) => {
                console.error("Firebase Fetch Error:", err);
                if (err.message.includes("index")) {
                    // Extract the Firebase URL to automatically build the index
                    const urlMatch = err.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
                    if (urlMatch) setIndexErrorUrl(urlMatch[0]);
                }
                setLoading(false);
            });

            return () => { unsubUsers(); unsubEvents(); };
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/admin/login');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        try {
            const { updatePassword } = await import('firebase/auth');
            await updatePassword(auth.currentUser, newPassword);
            alert("Password updated successfully!");
            setShowPasswordModal(false);
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    // --- NEW: Export CSV Logic ---
    const handleExportCSV = () => {
        if (liveEvents.length === 0) return alert("There is no activity data to export.");
        
        // 1. Convert to CSV text format
        const headers = "Date & Time,User ID,Email,Event Type,Page Path,Registered User\n";
        const rows = liveEvents.map(evt => {
            return `"${evt.time.toLocaleString()}","${evt.userId}","${evt.email}","${evt.eventType}","${evt.path}","${evt.isRegistered ? "Yes" : "No"}"`;
        }).join('\n');
        
        // 2. Generate Download file
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VersantPro_Traffic_Backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // --- Manual Access Grant ---
    const handleGrantAccess = async (e) => {
        e.preventDefault();
        if (!grantEmail.trim()) return;
        setGrantLoading(true);
        setGrantMessage(null);
        try {
            // 1. Find user by email in Firestore
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', grantEmail.trim().toLowerCase()));
            const snap = await getDocs(q);

            if (snap.empty) {
                // Also check analytics_events for userId
                const eventsRef = collection(db, 'analytics_events');
                const evQ = query(eventsRef, where('email', '==', grantEmail.trim().toLowerCase()), limit(1));
                const evSnap = await getDocs(evQ);
                if (evSnap.empty) {
                    setGrantMessage({ type: 'error', text: `No user found with email: ${grantEmail}` });
                    setGrantLoading(false);
                    return;
                }
                const userId = evSnap.docs[0].data().userId;
                // Create/update user doc with this uid
                const userDocRef = doc(db, 'users', userId);
                await setDoc(userDocRef, {
                    email: grantEmail.trim().toLowerCase(),
                    hasPaid: true,
                    paidTests: true,
                    paymentMethod: 'razorpay_manual',
                    transactionId: grantPaymentId || 'manual_grant',
                    paidAt: serverTimestamp(),
                    grantedBy: 'admin'
                }, { merge: true });
                setGrantMessage({ type: 'success', text: `✅ Access granted to ${grantEmail} (found via analytics). UID: ${userId}` });
            } else {
                // User doc found directly
                const updatePromises = snap.docs.map(userDoc => 
                    updateDoc(userDoc.ref, {
                        hasPaid: true,
                        paidTests: true,
                        paymentMethod: 'razorpay_manual',
                        transactionId: grantPaymentId || 'manual_grant',
                        paidAt: serverTimestamp(),
                        grantedBy: 'admin'
                    })
                );
                await Promise.all(updatePromises);
                
                const uids = snap.docs.map(d => d.id).join(', ');
                setGrantMessage({ type: 'success', text: `✅ Access granted to ${grantEmail}. UIDs: ${uids}` });
            }
            setGrantEmail('');
            setGrantPaymentId('');
        } catch (err) {
            console.error('Grant error:', err);
            setGrantMessage({ type: 'error', text: 'Error: ' + err.message });
        }
        setGrantLoading(false);
    };

    // --- NEW: Clear Firebase Storage Logic ---
    const handleClearData = async () => {
        if (liveEvents.length === 0) return alert("Database is already empty.");
        const sure = window.confirm("WARNING: Did you Export to Excel first? This will completely wipe all traffic data from the database to free up storage. Proceed?");
        if (!sure) return;
        
        setIsFlushing(true);
        try {
            // Delete all fetched documents individually
            for (const evt of liveEvents) {
                await deleteDoc(doc(db, 'analytics_events', evt.id));
            }
            alert("Database Memory Flushed Successfully! Firebase storage is free again.");
        } catch (error) {
            console.error("Flush Error:", error);
            alert("Error while flushing: " + error.message);
        }
        setIsFlushing(false);
    };

    // --- Affiliate Tracking Calculations ---
    // Group premium users by 'referredBy'
    const affiliateStats = {};
    let totalAffiliateRevenue = 0;
    
    premiumUsersList.forEach(user => {
        if (user.referredBy) {
            const ref = user.referredBy;
            if (!affiliateStats[ref]) {
                affiliateStats[ref] = { count: 0, revenue: 0, payout: 0 };
            }
            affiliateStats[ref].count += 1;
            // Assuming flat ₹1449 per sale. Adjust if dynamic pricing exists.
            affiliateStats[ref].revenue += 1449;
            affiliateStats[ref].payout += (1449 * 0.30); // 30% payout
            totalAffiliateRevenue += 1449;
        }
    });

    const affiliateList = Object.keys(affiliateStats).map(ref => ({
        id: ref,
        ...affiliateStats[ref]
    })).sort((a, b) => b.revenue - a.revenue);

    // Apply Filter to Premium Users Table
    const displayedPremiumUsers = affiliateFilter 
        ? premiumUsersList.filter(u => u.referredBy === affiliateFilter)
        : premiumUsersList;

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Mission Control...</div>;

    if (!loading && auth.currentUser?.email !== 'admin@versantapp.com') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 p-4">
                <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <button onClick={handleLogout} className="w-full bg-slate-700 mt-4 py-2 rounded text-white">Log Out</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative">
            <AdminNav onLogout={handleLogout} />

            {/* Error Banner for Missing Index */}
            {indexErrorUrl && (
                <div className="bg-rose-600 text-white p-4 text-center font-bold">
                    ⚠️ Firebase Index Missing! To enable real-time tracking, you must click this link to build the database index: 
                    <a href={indexErrorUrl} target="_blank" rel="noreferrer" className="underline ml-2 text-white hover:text-rose-200">
                        Build Index Now
                    </a>
                </div>
            )}

            {isFlushing && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center flex-col">
                    <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="mt-4 text-rose-400 font-bold tracking-widest animate-pulse">FLUSHING DATABASE MEMORY...</div>
                </div>
            )}

            {/* Action Bar */}
            <div className="max-w-screen-2xl mx-auto px-6 pt-6 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex gap-3">
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold transition shadow-lg shadow-emerald-500/20">
                        <span>📥</span> Export Data (CSV)
                    </button>
                    <button onClick={handleClearData} className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-white font-bold transition shadow-lg shadow-rose-500/20">
                        <span>🗑️</span> Clear Old Data
                    </button>
                </div>
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition"
                >
                    🔑 Change Admin Password
                </button>
            </div>

            <main className="max-w-screen-2xl mx-auto px-6 py-6">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Global Mission Control</h1>
                        <p className="text-slate-400">Total website surveillance. Tracking all guests and users.</p>
                    </div>
                    {stats.activeNow > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                            <span className="text-green-400 font-bold">{stats.activeNow} Live on Site</span>
                        </div>
                    )}
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <AdminStatCard title="Total Registered Users" value={stats.totalUsers} color="indigo" icon={<span className="text-2xl">👥</span>} />
                    <AdminStatCard title="Premium Members" value={stats.premiumUsers} color="emerald" icon={<span className="text-2xl">💎</span>} />
                    <AdminStatCard title="Total Tests Taken" value={stats.totalTests} color="amber" icon={<span className="text-2xl">📝</span>} />
                    <AdminStatCard title="Total Tracked Sessions" value={activeSessions.length} color="rose" icon={<span className="text-2xl">📡</span>} />
                </div>

                {/* 🔑 Manual Access Grant Tool */}
                <div className="bg-slate-900 border border-yellow-500/30 rounded-xl p-6 mb-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 text-lg">🔑</div>
                        <div>
                            <h3 className="text-white font-bold text-base">Manual Premium Access Grant</h3>
                            <p className="text-slate-400 text-xs">Use when payment was captured but verification failed. Enter customer email + Payment ID.</p>
                        </div>
                    </div>
                    <form onSubmit={handleGrantAccess} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            required
                            value={grantEmail}
                            onChange={e => { setGrantEmail(e.target.value); setGrantMessage(null); }}
                            placeholder="Customer Email (e.g. religiontheo062022@gmail.com)"
                            className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500 placeholder-slate-500"
                        />
                        <input
                            type="text"
                            value={grantPaymentId}
                            onChange={e => setGrantPaymentId(e.target.value)}
                            placeholder="Payment ID (e.g. pay_Sia4Nv49...)"
                            className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500 placeholder-slate-500"
                        />
                        <button
                            type="submit"
                            disabled={grantLoading}
                            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {grantLoading ? '⏳ Granting...' : '🔓 Grant Access'}
                        </button>
                    </form>
                    {grantMessage && (
                        <div className={`mt-3 text-sm font-medium px-4 py-2.5 rounded-lg ${grantMessage.type === 'success' ? 'bg-emerald-900/40 border border-emerald-500/30 text-emerald-300' : 'bg-red-900/40 border border-red-500/30 text-red-300'}`}>
                            {grantMessage.text}
                        </div>
                    )}
                </div>

                {/* Live Surveillance Architecture */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 h-[700px]">
                    
                    {/* Live Terminal Feed */}
                    <div className="col-span-1 bg-black border border-slate-800 rounded-xl overflow-hidden flex flex-col font-mono relative shadow-2xl">
                        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center z-20">
                            <h3 className="text-sm font-bold text-emerald-400 tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_1s_infinite]"></span>
                                LIVE SPY FEED
                            </h3>
                            <span className="text-xs text-slate-500">Real-Time Log</span>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs z-20">
                            {liveEvents.map((evt, i) => (
                                <div key={evt.id || i} className="border-l-2 border-emerald-500/30 pl-3 py-1 bg-gradient-to-r hover:from-slate-900/50 to-transparent transition-colors">
                                    <div className="text-slate-500 mb-0.5">{evt.time.toLocaleTimeString()}</div>
                                    <div className="flex items-start justify-between">
                                        <div className={`${evt.isRegistered ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
                                            {evt.email || evt.userId.slice(0,12)}
                                        </div>
                                    </div>
                                    <div className="text-emerald-400 mt-0.5 break-all">
                                        [{evt.eventType}] <span className="text-slate-300 ml-1">{evt.path}</span>
                                    </div>
                                </div>
                            ))}
                            {liveEvents.length === 0 && <div className="text-slate-600 animate-pulse mt-4">Awaiting incoming signals...</div>}
                        </div>
                        {/* Terminal Scanline overlay */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] border-none z-10" style={{ backgroundSize: '100% 4px, 3px 100%' }}></div>
                    </div>

                    {/* Active Sessions Database */}
                    <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
                        <div className="p-6 border-b border-slate-800 bg-slate-800/30">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span>🌐</span> Global Active Sessions
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Tracking all registered users and anonymous website guests.</p>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <UserTable users={activeSessions} premiumUserIds={premiumUserIds} loading={loading} />
                        </div>
                    </div>
                </div>

                {/* 🤝 Affiliate & Partner Performance */}
                <div className="bg-slate-900 border border-emerald-500/30 rounded-xl overflow-hidden flex flex-col shadow-xl mb-8">
                    <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                                <span>🤝</span> Affiliate Performance
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Track sales from unique referral links. Click a row to filter the customers table below.</p>
                        </div>
                        <div className="bg-emerald-500/20 text-emerald-400 font-bold px-4 py-1.5 rounded-lg border border-emerald-500/30">
                            Total Affiliate Revenue: ₹{totalAffiliateRevenue.toLocaleString('en-IN')}
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto max-h-96">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950 text-xs uppercase text-slate-500 font-semibold sticky top-0">
                                <tr>
                                    <th className="px-6 py-4">Tracking ID</th>
                                    <th className="px-6 py-4">Referrals</th>
                                    <th className="px-6 py-4">Gross Revenue</th>
                                    <th className="px-6 py-4 text-rose-400">Payout Due (30%)</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-sm">
                                {affiliateList.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No affiliate sales yet.</td>
                                    </tr>
                                )}
                                {affiliateList.map(aff => (
                                    <tr key={aff.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-emerald-300">{aff.id}</td>
                                        <td className="px-6 py-4 text-white">{aff.count} Sales</td>
                                        <td className="px-6 py-4 text-emerald-400 font-medium">₹{aff.revenue.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-rose-400 font-bold">₹{aff.payout.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => setAffiliateFilter(affiliateFilter === aff.id ? null : aff.id)}
                                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${affiliateFilter === aff.id ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                                            >
                                                {affiliateFilter === aff.id ? 'Clear Filter' : 'Filter Sales'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Premium Customers Database */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl mb-8">
                    <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-yellow-500 flex items-center gap-2">
                                <span>💎</span> Verified Lifetime Premium Customers
                                {affiliateFilter && <span className="ml-3 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs">Filtered by: {affiliateFilter}</span>}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">A permanent record of all users who have successfully purchased the Versant Pro Pass.</p>
                        </div>
                        <div className="bg-yellow-500/20 text-yellow-500 font-bold px-4 py-1.5 rounded-lg border border-yellow-500/30">
                            Total Paid: {displayedPremiumUsers.length}
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto max-h-96">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950 text-xs uppercase text-slate-500 font-semibold sticky top-0">
                                <tr>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Purchase Date</th>
                                    <th className="px-6 py-4">Tests Taken</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {displayedPremiumUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No premium customers found.</td>
                                    </tr>
                                )}
                                {displayedPremiumUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-white">{user.email || <span className="text-slate-500 italic">Legacy Account (No Email)</span>}</div>
                                            <div className="text-xs font-mono text-slate-500 mt-1">{user.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-300">
                                                {user.paidAt ? user.paidAt.toDate().toLocaleDateString() : <span className="text-slate-600">Unknown Date</span>}
                                            </div>
                                            <div className="text-xs font-mono text-slate-500">
                                                {user.paymentMethod ? user.paymentMethod.toUpperCase() : 'UNKNOWN GATEWAY'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono text-slate-300">{user.testsCompleted || 0}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                Active Lifetime
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {premiumUsersList.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-slate-500 font-mono">
                                            No premium customers yet. Awaiting sales...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>

            {/* User Details Modal */}
            <UserDetailsModal user={selectedSession} onClose={() => setSelectedSession(null)} />

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Change Admin Password</h3>
                        <form onSubmit={handleChangePassword}>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded mb-4 p-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                placeholder="New Password"
                                required />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded mb-6 p-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                placeholder="Confirm Password"
                                required />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded text-white font-semibold transition">Cancel</button>
                                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded text-white font-semibold shadow-[0_0_15px_rgba(79,70,229,0.3)] transition">Update Securely</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
