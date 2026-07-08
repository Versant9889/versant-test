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
    // Only allow GET requests for downloads
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { payment_id, email, token } = event.queryStringParameters || {};
        const authHeader = event.headers.authorization || (token ? `Bearer ${token}` : null);

        let isAuthorized = false;
        let targetUid = null;
        let targetEmail = email ? email.toLowerCase().trim() : null;
        let transactionId = payment_id || null;

        // --- AUTHENTICATION & AUTHORIZATION METHOD 1: Registered User (Bearer Token) ---
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const idToken = authHeader.split('Bearer ')[1];
            try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                targetUid = decodedToken.uid;

                const userDoc = await db.collection('users').doc(targetUid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    targetEmail = userData.email ? userData.email.toLowerCase().trim() : targetEmail;
                    
                    // User is authorized if they have purchased the ebook OR have premium mock tests (bundled)
                    if (userData.hasPurchasedEbook === true || userData.hasPaid === true || userData.paidTests === true) {
                        isAuthorized = true;
                        transactionId = userData.ebookTransactionId || userData.transactionId || 'auth_token_bypass';
                    }
                }
            } catch (authError) {
                console.error("Token verification failed in download:", authError);
                return { statusCode: 401, body: JSON.stringify({ error: "Invalid authentication token" }) };
            }
        }

        // --- AUTHENTICATION & AUTHORIZATION METHOD 2: Guest Checkout (Payment ID + Email match) ---
        if (!isAuthorized && transactionId && targetEmail) {
            // First check if purchase document exists in ebook_purchases
            const purchaseDoc = await db.collection('ebook_purchases').doc(transactionId).get();
            if (purchaseDoc.exists) {
                const purchaseData = purchaseDoc.data();
                if (purchaseData.email && purchaseData.email.toLowerCase().trim() === targetEmail && purchaseData.status === 'success') {
                    isAuthorized = true;
                    targetUid = purchaseData.uid !== 'guest' ? purchaseData.uid : null;
                }
            }

            // Fallback: If no direct ebook_purchases doc, check if matching registered user with this email has purchased
            if (!isAuthorized) {
                const usersSnap = await db.collection('users').where('email', '==', targetEmail).limit(1).get();
                if (!usersSnap.empty) {
                    const matchedUser = usersSnap.docs[0].data();
                    if (matchedUser.hasPurchasedEbook === true || matchedUser.hasPaid === true || matchedUser.paidTests === true) {
                        isAuthorized = true;
                        targetUid = usersSnap.docs[0].id;
                        transactionId = matchedUser.ebookTransactionId || matchedUser.transactionId || transactionId;
                    }
                }
            }
        }

        // If not authorized, block request
        if (!isAuthorized) {
            return { 
                statusCode: 403, 
                body: JSON.stringify({ error: "Unauthorized access. No verified purchase record found for this transaction." }) 
            };
        }

        // --- FILE RETRIEVAL FROM LOCAL DIRECTORY & BINARY RESPONDING ---
        const fs = require('fs');
        const path = require('path');
        const pdfPath = path.join(__dirname, 'versant_ebook.pdf');

        if (!fs.existsSync(pdfPath)) {
            console.error(`Ebook file not found at: ${pdfPath}`);
            return { 
                statusCode: 404, 
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: "Ebook file not found on server. Please contact support." }) 
            };
        }

        // Increment download counters asynchronously
        if (targetUid) {
            db.collection('users').doc(targetUid).update({
                ebookDownloadCount: admin.firestore.FieldValue.increment(1)
            }).catch(e => console.error("Error incrementing user download count:", e));
        }

        if (transactionId && transactionId !== 'auth_token_bypass') {
            db.collection('ebook_purchases').doc(transactionId).update({
                downloadCount: admin.firestore.FieldValue.increment(1)
            }).catch(e => console.error("Error incrementing transaction download count:", e));
        }

        const fileBuffer = fs.readFileSync(pdfPath);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="versant_test_mastery_guide.pdf"',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            },
            body: fileBuffer.toString('base64'),
            isBase64Encoded: true
        };

    } catch (err) {
        console.error("Secure ebook download server failure:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error during download generation" })
        };
    }
};
