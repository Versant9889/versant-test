const admin = require('firebase-admin');

// Ensure Firebase Admin is only initialized once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

// Function to generate PayPal Access Token
async function generateAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    // Default to sandbox for testing; switch to api-m.paypal.com for production
    const PAYPAL_API_BASE = process.env.PAYPAL_ENVIRONMENT === 'live' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

    const auth = Buffer.from(clientId + ":" + clientSecret).toString("base64");
    
    // Dynamic import for node-fetch if using commonjs
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    const data = await response.json();
    return { token: data.access_token, apiBase: PAYPAL_API_BASE };
}

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { orderID, uid } = JSON.parse(event.body);

        if (!orderID || !uid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing orderID or uid' })
            };
        }

        // 1. Authenticate with PayPal
        const { token, apiBase } = await generateAccessToken();
        
        // Dynamic import for node-fetch
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

        // 2. Fetch the Order details from PayPal
        const orderResponse = await fetch(`${apiBase}/v2/checkout/orders/${orderID}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const orderData = await orderResponse.json();

        // 3. Verify the order is strictly COMPLETED and the amount is strictly 14.99 USD
        if (orderData.status !== 'COMPLETED') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: `PayPal order is not confirmed completed. Status: ${orderData.status}` })
            };
        }

        const exactAmountPaid = parseFloat(orderData.purchase_units[0].amount.value);
        const exactCurrency = orderData.purchase_units[0].amount.currency_code;
        
        if (exactAmountPaid < 14.99 || exactCurrency !== 'USD') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: `Invalid payment amount or currency detected. Found ${exactAmountPaid} ${exactCurrency}` })
            };
        }

        // 4. Verification Passed: Update User Document in Firestore via Admin Bypass
        const userRef = db.collection('users').doc(uid);
        await userRef.update({
            hasPaid: true,
            paidTests: true,
            paymentMethod: 'paypal',
            transactionId: orderID,
            paidAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'PayPal payment highly verified! User instantly upgraded to PRO.' 
            })
        };

    } catch (error) {
        console.error('PayPal Verification Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error verifying PayPal payment.' })
        };
    }
};
