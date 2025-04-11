import Stripe from "stripe";
import Payment from '../models/Payment.js';
import Client from '../models/Client.js'; // Add these imports
import Counselor from '../models/Counselor.js';

export const createCheckoutSession = async (req, res) => {
    try {
        const { client, counselor, amount, paymentMethod } = req.body;

        // Validate IDs exist in database
        const [clientExists, counselorExists] = await Promise.all([
            Client.findById(client),
            Counselor.findById(counselor)
        ]);

        if (!clientExists || !counselorExists) {
            return res.status(400).json({ 
                message: "Invalid client or counselor ID" 
            });
        }

        // Convert amount to number if sent as string
        const amountNum = Number(amount);
        if (isNaN(amountNum)) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const line_items = [{
            price_data: {
                currency: "usd",
                product_data: { name: "Counseling Session" },
                unit_amount: Math.round(amountNum * 100),
            },
            quantity: 1,
        }];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        const payment = new Payment({
            client: clientExists._id, // Use validated ID
            counselor: counselorExists._id,
            amount: amountNum,
            paymentMethod,
            stripeChargeId: session.id,
        });

        await payment.save();

        res.json({ url: session.url });

    } catch (error) {
        console.error("Payment error:", error);
        res.status(500).json({ 
            message: error.message || "Payment processing failed" 
        });
    }
};