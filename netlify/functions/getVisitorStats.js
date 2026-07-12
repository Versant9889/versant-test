const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}
const db = admin.firestore();

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        // Secure check: verify requester is admin (just like getEbookSales.js)
        const authHeader = event.headers.authorization || '';
        if (!authHeader.startsWith('Bearer ')) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized access" }) };
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.email !== 'admin@versantapp.com') {
            return { statusCode: 403, headers, body: JSON.stringify({ error: "Access Denied" }) };
        }

        // Get date string (Today's date in client's timezone)
        const { date } = event.queryStringParameters || {};
        if (!date) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing date parameter' }) };
        }

        // Calculate Yesterday string in client's timezone format (YYYY-MM-DD)
        const todayParts = date.split('-');
        const todayYear = parseInt(todayParts[0], 10);
        const todayMonth = parseInt(todayParts[1], 10) - 1; // 0-based
        const todayDay = parseInt(todayParts[2], 10);

        const todayDate = new Date(todayYear, todayMonth, todayDay);
        const yesterdayDate = new Date(todayDate);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);

        const yYear = yesterdayDate.getFullYear();
        const yMonth = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
        const yDay = String(yesterdayDate.getDate()).padStart(2, '0');
        const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

        // Query visitor logs for Today and Yesterday
        const visitorSnap = await db.collection('daily_visitors')
            .where('date', 'in', [date, yesterdayStr])
            .get();

        let todayUnique = 0;
        let todayRepeated = 0;
        let yesterdayUnique = 0;
        let yesterdayRepeated = 0;

        visitorSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.date === date) {
                todayUnique++;
                if (data.isRepeated) todayRepeated++;
            } else if (data.date === yesterdayStr) {
                yesterdayUnique++;
                if (data.isRepeated) yesterdayRepeated++;
            }
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                today: { unique: todayUnique, repeated: todayRepeated },
                yesterday: { unique: yesterdayUnique, repeated: yesterdayRepeated }
            })
        };
    } catch (error) {
        console.error("Error in getVisitorStats:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
