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
    // Webhooks should always respond with 200 OK quickly to prevent retries
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        
        // 1. Verify Webhook Signature
        const signature = event.headers['x-razorpay-signature'];
        if (!signature || !secret) {
            console.error("Missing webhook signature or secret.");
            return { statusCode: 400, body: 'Missing signature' };
        }

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(event.body)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error("Invalid webhook signature.");
            return { statusCode: 403, body: 'Invalid signature' };
        }

        // 2. Parse Payload
        const payload = JSON.parse(event.body);

        // We only care about payment.captured or order.paid
        if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
            
            // Extract the payment entity
            const paymentEntity = payload.payload.payment ? payload.payload.payment.entity : null;
            
            if (!paymentEntity) {
                console.error("Payment entity not found in payload.");
                return { statusCode: 200, body: 'OK' };
            }

            const notes = paymentEntity.notes || {};
            const uid = notes.uid;
            const email = notes.email || paymentEntity.email;
            const referredBy = notes.referredBy;
            const transactionId = paymentEntity.id;

            if (!uid || uid === 'unknown_uid') {
                console.error("Missing UID in payment notes. Cannot update Firestore for transaction:", transactionId);
                return { statusCode: 200, body: 'Missing UID' };
            }

            console.log(`Processing successful payment for UID: ${uid}`);

            // 3. Securely Update Firestore
            const userRef = db.collection('users').doc(uid);
            
            // We use { merge: true } via set() just in case the document somehow doesn't exist yet
            // This is safer than update() which fails if doc is missing
            const updateData = {
                hasPaid: true,
                paidTests: true,
                paymentMethod: 'razorpay',
                transactionId: transactionId,
                paidAt: admin.firestore.FieldValue.serverTimestamp()
            };

            if (email && email !== 'unknown_email') {
                updateData.email = email;
            }

            if (referredBy) {
                updateData.referredBy = referredBy;
            }

            await userRef.set(updateData, { merge: true });
            
            console.log(`Successfully granted premium access to UID: ${uid}`);
        }

        return { statusCode: 200, body: 'OK' };

    } catch (error) {
        console.error("Webhook processing failed:", error);
        // We still return 200 if it's our internal error so Razorpay doesn't spam retries infinitely,
        // though returning 500 would trigger Razorpay's exponential backoff retries.
        // For critical failures (like DB down), returning 500 is better so it retries.
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
