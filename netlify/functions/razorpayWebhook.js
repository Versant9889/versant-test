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
            const productType = notes.productType || 'premium_pass';
            const transactionId = paymentEntity.id;
            const orderId = paymentEntity.order_id;

            console.log(`Processing successful webhook payment: ${transactionId} for product: ${productType}`);

            const isEbook = productType === 'ebook';
            let targetUid = uid && uid !== 'guest' && uid !== 'unknown_uid' ? uid : null;
            let customerEmail = email && email !== 'unknown_email' ? email.toLowerCase().trim() : null;

            // Match by email if guest
            if (!targetUid && customerEmail) {
                const usersSnap = await db.collection('users').where('email', '==', customerEmail).limit(1).get();
                if (!usersSnap.empty) {
                    targetUid = usersSnap.docs[0].id;
                }
            }

            if (isEbook) {
                // Ebook Webhook Process
                if (targetUid) {
                    const userRef = db.collection('users').doc(targetUid);
                    await userRef.set({
                        hasPurchasedEbook: true,
                        ebookPurchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                        ebookTransactionId: transactionId
                    }, { merge: true });
                }

                // Record transaction in ebook_purchases
                const purchaseRef = db.collection('ebook_purchases').doc(transactionId);
                await purchaseRef.set({
                    uid: targetUid || 'guest',
                    email: customerEmail || 'guest_checkout',
                    transactionId: transactionId,
                    orderId: orderId || 'webhook_captured',
                    status: 'success',
                    productType: 'ebook',
                    paidAt: admin.firestore.FieldValue.serverTimestamp(),
                    downloadCount: 0
                });
            } else {
                // Premium Test Pass Webhook Process (bundles Ebook)
                if (targetUid) {
                    const userRef = db.collection('users').doc(targetUid);
                    const updateData = {
                        hasPaid: true,
                        paidTests: true,
                        paymentMethod: 'razorpay',
                        transactionId: transactionId,
                        paidAt: admin.firestore.FieldValue.serverTimestamp(),
                        hasPurchasedEbook: true,
                        ebookPurchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                        ebookTransactionId: transactionId
                    };

                    if (customerEmail) {
                        updateData.email = customerEmail;
                    }

                    if (referredBy) {
                        updateData.referredBy = referredBy;
                    }

                    await userRef.set(updateData, { merge: true });
                } else {
                    console.warn(`Premium Pass webhook received but no target UID matching email ${customerEmail}`);
                }
            }
            
            console.log(`Successfully processed webhook for transaction: ${transactionId}`);
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
