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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
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

        const { action, targetEmail, targetUid, paymentId } = JSON.parse(event.body);

        if (!action || (!targetEmail && !targetUid)) {
            return { 
                statusCode: 400, 
                headers, 
                body: JSON.stringify({ error: "Missing required parameters: action, targetEmail, or targetUid" }) 
            };
        }

        const emailClean = targetEmail ? targetEmail.trim().toLowerCase() : null;

        if (action === 'grant') {
            let uidsUpdated = [];
            
            // 1. Check if user document exists in users collection
            let usersSnap = [];
            if (targetUid) {
                const userDoc = await db.collection('users').doc(targetUid).get();
                if (userDoc.exists) {
                    usersSnap.push(userDoc);
                }
            } else if (emailClean) {
                const snap = await db.collection('users').where('email', '==', emailClean).get();
                usersSnap = snap.docs;
            }

            if (usersSnap.length === 0) {
                // Check if user is present in analytics events to resolve their UID
                let resolvedUid = null;
                if (emailClean) {
                    const eventSnap = await db.collection('analytics_events').where('email', '==', emailClean).limit(1).get();
                    if (!eventSnap.empty) {
                        resolvedUid = eventSnap.docs[0].data().userId;
                    }
                }

                if (!resolvedUid) {
                    return { 
                        statusCode: 404, 
                        headers, 
                        body: JSON.stringify({ error: `No registered user or traffic matches found for email: ${targetEmail}` }) 
                    };
                }

                // Create new user doc
                await db.collection('users').doc(resolvedUid).set({
                    email: emailClean,
                    hasPaid: true,
                    paidTests: true,
                    paymentMethod: 'razorpay_manual',
                    transactionId: paymentId || 'manual_grant',
                    paidAt: admin.firestore.FieldValue.serverTimestamp(),
                    grantedBy: 'admin'
                }, { merge: true });
                uidsUpdated.push(resolvedUid);
            } else {
                // Update matched documents
                const batch = db.batch();
                usersSnap.forEach(d => {
                    uidsUpdated.push(d.id);
                    batch.set(d.ref, {
                        hasPaid: true,
                        paidTests: true,
                        paymentMethod: 'razorpay_manual',
                        transactionId: paymentId || 'manual_grant',
                        paidAt: admin.firestore.FieldValue.serverTimestamp(),
                        grantedBy: 'admin'
                    }, { merge: true });
                });
                await batch.commit();
            }

            return { 
                statusCode: 200, 
                headers, 
                body: JSON.stringify({ message: "Access successfully granted", uids: uidsUpdated }) 
            };

        } else if (action === 'revoke') {
            let uidsRevoked = [];

            // 1. Revoke Premium flags in users collection
            let usersSnap = [];
            if (targetUid) {
                const userDoc = await db.collection('users').doc(targetUid).get();
                if (userDoc.exists) {
                    usersSnap.push(userDoc);
                }
            } else if (emailClean) {
                const snap = await db.collection('users').where('email', '==', emailClean).get();
                usersSnap = snap.docs;
            }

            if (usersSnap.length > 0) {
                const batch = db.batch();
                usersSnap.forEach(d => {
                    uidsRevoked.push(d.id);
                    batch.set(d.ref, {
                        hasPaid: false,
                        paidTests: false,
                        isPremium: false,
                        hasPurchasedEbook: false,
                        revokedAt: admin.firestore.FieldValue.serverTimestamp(),
                        revokedBy: 'admin'
                    }, { merge: true });
                });
                await batch.commit();
            }

            // 2. Revoke transactions in ebook_purchases
            let ebookRevokedCount = 0;
            if (paymentId) {
                const docRef = db.collection('ebook_purchases').doc(paymentId);
                const docSnap = await docRef.get();
                if (docSnap.exists) {
                    await docRef.update({
                        status: 'revoked',
                        revokedAt: admin.firestore.FieldValue.serverTimestamp(),
                        revokedBy: 'admin'
                    });
                    ebookRevokedCount = 1;
                }
            } else if (emailClean) {
                const ebookSnap = await db.collection('ebook_purchases').where('email', '==', emailClean).get();
                if (!ebookSnap.empty) {
                    const batch = db.batch();
                    ebookSnap.forEach(d => {
                        ebookRevokedCount++;
                        batch.update(d.ref, {
                            status: 'revoked',
                            revokedAt: admin.firestore.FieldValue.serverTimestamp(),
                            revokedBy: 'admin'
                        });
                    });
                    await batch.commit();
                }
            }

            if (uidsRevoked.length === 0 && ebookRevokedCount === 0) {
                return { 
                    statusCode: 404, 
                    headers, 
                    body: JSON.stringify({ error: `No active records found for email/uid: ${targetEmail || targetUid}` }) 
                };
            }

            return { 
                statusCode: 200, 
                headers, 
                body: JSON.stringify({ 
                    message: "Access successfully revoked", 
                    uids: uidsRevoked, 
                    ebookRecords: ebookRevokedCount 
                }) 
            };
        }

        return { 
            statusCode: 400, 
            headers, 
            body: JSON.stringify({ error: "Invalid action type" }) 
        };

    } catch (error) {
        console.error("Admin action server error:", error);
        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ error: "Internal server error performing action" }) 
        };
    }
};
