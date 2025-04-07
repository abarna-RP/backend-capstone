import Stripe from "stripe";
import dotenv from "dotenv";
import Payment from '../models/Payment.js';
import { verifyToken } from '../middleware/auth.js';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        const { client, counselor, amount, paymentMethod } = req.body;

        const line_items = [{
            price_data: {
                currency: "usd",
                product_data: { name: "Counseling Session" },
                unit_amount: Math.round(amount * 100), // Amount in cents
            },
            quantity: 1, // We are charging for one session
        }];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}", // Use localhost success URL
            cancel_url: "http://localhost:5173/cancel", // Use localhost cancel URL
        });

        const payment = new Payment({
            client,
            counselor,
            amount,
            paymentMethod,
            stripeChargeId: session.id, // Store stripe checkout session id.
        });

        await payment.save();

        res.json({ url: session.url });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
};