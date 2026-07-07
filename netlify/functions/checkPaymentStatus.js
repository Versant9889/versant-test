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
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { payment_id } = event.queryStringParameters || {};
        if (!payment_id) {
            return { 
                statusCode: 400, 
                headers, 
                body: JSON.stringify({ error: "Missing payment_id parameter" }) 
            };
        }

        const purchaseDoc = await db.collection('ebook_purchases').doc(payment_id).get();
        if (!purchaseDoc.exists) {
            return { 
                statusCode: 200, 
                headers, 
                body: JSON.stringify({ verified: false, reason: "record_not_found" }) 
            };
        }

        const purchaseData = purchaseDoc.data();
        if (purchaseData.status === 'success') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    verified: true,
                    email: purchaseData.email,
                    uid: purchaseData.uid
                })
            };
        }

        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ verified: false, reason: "payment_pending" }) 
        };

    } catch (error) {
        console.error("Check payment status server error:", error);
        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ error: "Internal server error check" }) 
        };
    }
};
