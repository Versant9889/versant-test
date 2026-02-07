import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { AdminNav, AdminStatCard, UserTable, UserDetailsModal } from '../components/AdminComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        premiumUsers: 0,
        totalTests: 0,
        activeNow: 0
    });

    // Analytics Data for Charts
    const [activityData, setActivityData] = useState([]);

    const [selectedUser, setSelectedUser] = useState(null); // For Modal

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Listen for Inspect Modal Event from sub-components
    useEffect(() => {
        const handleOpenModal = (e) => setSelectedUser(e.detail);
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

            // Real-time Listener for Users
            const usersRef = collection(db, 'users');
            const q = query(usersRef); // Fetch all users, sort in memory to avoid index/missing field issues

            console.log("Setting up snapshot listener for users...");

            const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                console.log("Snapshot received!", snapshot.size, "docs");
                const userList = [];
                let premiumCount = 0;
                let activeCount = 0;
                let testsTotal = 0;

                // Process data for charts
                const joinDates = {};

                snapshot.docs.forEach(doc => {
                    const data = doc.data();

                    // Determine "Active" status (within last 5 mins)
                    let isActive = false;
                    if (data.lastActive) {
                        const lastActiveTime = data.lastActive.toDate();
                        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
                        if (lastActiveTime > fiveMinsAgo) isActive = true;
                    }
                    if (isActive) activeCount++;

                    // Aggregate Stats
                    if (data.paidTests) premiumCount++;
                    testsTotal += (data.testsCompleted || 0);

                    // Chart Data: Joins per day
                    if (data.createdAt) {
                        const dateStr = data.createdAt.toDate().toLocaleDateString();
                        joinDates[dateStr] = (joinDates[dateStr] || 0) + 1;
                    }

                    userList.push({
                        id: doc.id,
                        email: data.email || 'No Email',
                        name: data.displayName || data.name || 'User',
                        plan: data.paidTests ? 'Premium' : 'Free',
                        testsCount: data.testsCompleted || 0,
                        joinedAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || null),
                        lastActive: data.lastActive?.toDate ? data.lastActive.toDate().toISOString() : (data.lastActive || null),
                        currentPath: isActive ? (data.currentPath || 'Browsing') : 'Offline',
                        isOnline: isActive,
                        totalTimeSpent: data.totalTimeSpent || 0
                    });
                });

                // Sort key stats
                const chartData = Object.keys(joinDates).map(date => ({
                    date,
                    users: joinDates[date]
                })).slice(-7); // Last 7 days

                // Sort users in memory (newest first)
                userList.sort((a, b) => {
                    const dateA = a.joinedAt ? new Date(a.joinedAt) : new Date(0);
                    const dateB = b.joinedAt ? new Date(b.joinedAt) : new Date(0);
                    return dateB - dateA;
                });

                console.log("Stats Calculated:", {
                    totalUsers: userList.length,
                    premiumUsers: premiumCount,
                    totalTests: testsTotal,
                    activeNow: activeCount
                });

                setUsers(userList);
                setActivityData(chartData);
                setStats({
                    totalUsers: userList.length,
                    premiumUsers: premiumCount,
                    totalTests: testsTotal,
                    activeNow: activeCount
                });
                setLoading(false);
            }, (error) => {
                console.error("Real-time Fetch Error:", error);
                // If index missing, usually it's in expected behavior during dev
                if (error.code === 'failed-precondition') {
                    alert("Index Missing! Check console for link.");
                } else {
                    alert("Error fetching live data: " + error.message);
                }
                setLoading(false);
            });

            return () => unsubscribeSnapshot();
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

            <div className="max-w-7xl mx-auto px-6 pt-4 flex justify-end">
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition"
                >
                    Change Admin Password
                </button>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Mission Control</h1>
                        <p className="text-slate-400">Real-time surveillance of user activity.</p>
                    </div>
                    {stats.activeNow > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full animate-pulse">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-400 font-bold">{stats.activeNow} User{stats.activeNow !== 1 && 's'} Online Now</span>
                        </div>
                    )}
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <AdminStatCard title="Total Users" value={stats.totalUsers} color="indigo" icon={<span className="text-2xl">👥</span>} />
                    <AdminStatCard title="Premium Members" value={stats.premiumUsers} color="emerald" icon={<span className="text-2xl">💎</span>} />
                    <AdminStatCard title="Total Tests Taken" value={stats.totalTests} color="amber" icon={<span className="text-2xl">📝</span>} />
                    <AdminStatCard title="Active Now" value={stats.activeNow} color="rose" icon={<span className="text-2xl">🟢</span>} />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <h3 className="text-lg font-bold text-white mb-4">User Growth (Last 7 Days)</h3>
                        <div className="h-64 w-full">
                            {/* Recharts ResponsiveContainer needs a parent with definite height */}
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={activityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="date" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                                    <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <h3 className="text-lg font-bold text-white mb-4">Activity Overview</h3>
                        <div className="h-64 w-full flex items-center justify-center text-slate-500">
                            {/* Placeholder for future detailed activity chart */}
                            <p>Test vs Practice Distribution (Coming Soon)</p>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h3 className="text-lg font-bold text-white">Recent Users & Activity</h3>
                    </div>
                    <UserTable users={users} loading={loading} />
                </div>
            </main>

            {/* User Details Modal */}
            <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Change Password</h3>
                        <form onSubmit={handleChangePassword}>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded mb-4 p-3 text-white"
                                placeholder="New Password"
                                required />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded mb-6 p-3 text-white"
                                placeholder="Confirm Password"
                                required />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 bg-slate-700 py-2 rounded text-white">Cancel</button>
                                <button type="submit" className="flex-1 bg-indigo-600 py-2 rounded text-white">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
