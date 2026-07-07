const Razorpay = require('razorpay');

exports.handler = async (event, context) => {
    // Only allow POST requests for security
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Initialize Razorpay SDK using your secret backend keys
        // These will be read from Netlify's Environment Variables in production
        const razorpay = new Razorpay({
            key_id: process.env.REACT_APP_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Extract user data from request body if available
        let uid = null;
        let email = null;
        let referredBy = null;
        let productType = 'premium_pass'; // default
        if (event.body) {
            try {
                const body = JSON.parse(event.body);
                uid = body.uid;
                email = body.email;
                referredBy = body.referredBy;
                if (body.productType) {
                    productType = body.productType;
                }
            } catch (e) {
                console.error("Failed to parse request body", e);
            }
        }

        // Determine price based on product
        let amount = 144900; // default ₹1449
        if (productType === 'ebook') {
            amount = 19900; // ₹199 in paise
        }

        // The secure options for creating the order
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'receipt_' + Math.random().toString(36).substring(7),
            payment_capture: 1, // Auto-capture the payment
            notes: {
                uid: uid || 'guest',
                email: email || 'unknown_email',
                productType: productType,
                referredBy: referredBy || ''
            }
        };

        // Create the order on Razorpay's servers
        const order = await razorpay.orders.create(options);

        // Send the real order_id back to the React frontend
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Allow frontend to read this
            },
            body: JSON.stringify({
                order_id: order.id,
                amount: order.amount,
                currency: order.currency
            })
        };
    } catch (error) {
        console.error("Razorpay Order Creation Failed:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not generate Razorpay Order ID' })
        };
    }
};
