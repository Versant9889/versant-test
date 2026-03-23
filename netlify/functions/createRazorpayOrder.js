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

        // The secure options for creating the order
        const options = {
            amount: 149900, // ₹1499 in paise (100 paise = 1 INR)
            currency: 'INR',
            receipt: 'receipt_' + Math.random().toString(36).substring(7),
            payment_capture: 1 // Auto-capture the payment
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
