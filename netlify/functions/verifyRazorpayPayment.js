const crypto = require('crypto');
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
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, uid } = JSON.parse(event.body);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !uid) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing required parameters" }) };
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        
        // 1. Mathematically verify the Payment Signature (Fraud Prevention)
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            console.error("Signature tampering detected!");
            return { statusCode: 403, body: JSON.stringify({ error: "Invalid payment signature" }) };
        }

        // 2. Unlock the Premium Content via Secure Admin SDK
        const userRef = db.collection('users').doc(uid);
        await userRef.update({
            hasPaid: true,
            paidTests: true,
            paymentMethod: 'razorpay',
            transactionId: razorpay_payment_id,
            paidAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: true, message: "Payment Verified and Account Unlocked" })
        };

    } catch (error) {
        console.error("Payment Verification Failed:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server error during verification" })
        };
    }
};
