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
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            uid, 
            email, 
            productType, 
            referredBy 
        } = JSON.parse(event.body);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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

        // 2. Process product purchase inside Firestore
        const isEbook = productType === 'ebook';
        let targetUid = uid && uid !== 'guest' ? uid : null;
        let customerEmail = email || null;

        // If guest or no uid, try to match by email
        if (!targetUid && customerEmail) {
            const usersSnap = await db.collection('users').where('email', '==', customerEmail.toLowerCase().trim()).limit(1).get();
            if (!usersSnap.empty) {
                targetUid = usersSnap.docs[0].id;
            }
        }

        if (isEbook) {
            // Ebook Purchase Logic
            if (targetUid) {
                const userRef = db.collection('users').doc(targetUid);
                await userRef.set({
                    hasPurchasedEbook: true,
                    ebookPurchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                    ebookTransactionId: razorpay_payment_id
                }, { merge: true });
            }

            // Record transaction in ebook_purchases
            const purchaseRef = db.collection('ebook_purchases').doc(razorpay_payment_id);
            await purchaseRef.set({
                uid: targetUid || 'guest',
                email: customerEmail ? customerEmail.toLowerCase().trim() : 'guest_checkout',
                transactionId: razorpay_payment_id,
                orderId: razorpay_order_id,
                status: 'success',
                productType: 'ebook',
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                downloadCount: 0
            });
        } else {
            // Premium Mock Test Pass Logic (which also bundles Ebook for free)
            if (targetUid) {
                const userRef = db.collection('users').doc(targetUid);
                const updateData = {
                    hasPaid: true,
                    paidTests: true,
                    paymentMethod: 'razorpay',
                    transactionId: razorpay_payment_id,
                    paidAt: admin.firestore.FieldValue.serverTimestamp(),
                    hasPurchasedEbook: true, // Bundled Ebook
                    ebookPurchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                    ebookTransactionId: razorpay_payment_id
                };

                if (referredBy) {
                    updateData.referredBy = referredBy;
                }

                await userRef.set(updateData, { merge: true });
            } else {
                console.warn("Premium Pass purchased but no UID found or matched.");
            }
        }

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
                success: true, 
                message: "Payment Verified and Access Granted",
                email: customerEmail,
                uid: targetUid || 'guest'
            })
        };

    } catch (error) {
        console.error("Payment Verification Failed:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server error during verification" })
        };
    }
};
