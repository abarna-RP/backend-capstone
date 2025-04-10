import Stripe from "stripe";
import dotenv from "dotenv";
import Payment from '../models/Payment.js';
import mongoose from 'mongoose';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        const { client, counselor, amount, paymentMethod } = req.body;
         // Validate client and counselor IDs
         if (!mongoose.Types.ObjectId.isValid(client) || !mongoose.Types.ObjectId.isValid(counselor)) {
            return res.status(400).json({ message: 'Invalid client or counselor ID.' });
        }

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