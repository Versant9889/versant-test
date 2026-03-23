const crypto = require('crypto');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

// Initialize Firebase for the Server environment
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Prevent re-initialization if function is kept warm
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (e) {
    if (e.code === 'app/duplicate-app') {
        app = require('firebase/app').getApp();
    }
}
const auth = getAuth(app);
const db = getFirestore(app);

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

        // 2. Authenticate the Server as the "Admin" to bypass client-level Firestore rules
        const adminEmail = "admin@versantapp.com";
        const adminPass = process.env.ADMIN_PASSWORD; // Must be added to Netlify Environment Variables
        
        await signInWithEmailAndPassword(auth, adminEmail, adminPass);

        // 3. Unlock the Premium Content
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { hasPaid: true });

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
