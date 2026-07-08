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

        // --- FILE RETRIEVAL & SIGNED URL GENERATION ---
        const bucketName = process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || `${admin.apps[0].options.projectId}.appspot.com`;
        const bucket = admin.storage().bucket(bucketName);
        const file = bucket.file('ebooks/versant_ebook.pdf');

        const [exists] = await file.exists();
        if (!exists) {
            console.error(`Ebook file not found in storage bucket: ${bucketName}`);
            return { 
                statusCode: 404, 
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: "Ebook file not found on storage server. Please ensure the PDF is uploaded inside the 'ebooks' folder as 'versant_ebook.pdf'." }) 
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

        // Generate temporary Signed URL (valid for 2 minutes)
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 120000 // 2 minutes
        });

        // Redirect user to secure Firebase download link
        return {
            statusCode: 302,
            headers: {
                Location: signedUrl,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            }
        };

    } catch (err) {
        console.error("Secure ebook download server failure:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error during download generation" })
        };
    }
};
