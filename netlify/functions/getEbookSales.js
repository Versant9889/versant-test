const admin = require('firebase-admin');

// Ensure Firebase Admin is only initialized once
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
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { 
                statusCode: 401, 
                headers, 
                body: JSON.stringify({ error: "Missing or invalid authorization header" }) 
            };
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // Assert true admin email
        if (decodedToken.email !== 'admin@versantapp.com') {
            return { 
                statusCode: 403, 
                headers, 
                body: JSON.stringify({ error: "Access Denied: Admin authorization required" }) 
            };
        }

        // Retrieve sales documents
        const snap = await db.collection('ebook_purchases').get();
        const list = [];
        
        snap.forEach(doc => {
            const data = doc.data();
            list.push({
                id: doc.id,
                ...data,
                paidAt: data.paidAt ? { seconds: data.paidAt.seconds, nanoseconds: data.paidAt.nanoseconds } : null
            });
        });

        // Sort by timestamp descending
        list.sort((a, b) => {
            const secA = a.paidAt?.seconds || 0;
            const secB = b.paidAt?.seconds || 0;
            return secB - secA;
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(list)
        };

    } catch (error) {
        console.error("Failed to query admin sales report:", error);
        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ error: "Failed to retrieve sales logs" }) 
        };
    }
};
