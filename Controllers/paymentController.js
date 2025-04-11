import Stripe from "stripe";
import Payment from '../models/Payment.js';
import Client from '../models/Client.js'; // "User" என்பதற்கு பதிலாக "Client"
import Counselor from '../models/Counselor.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // mongoose இறக்குமதி

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        const { client, counselor, amount, paymentMethod } = req.body;

        // ObjectId வடிவம் சரிபார்க்கப்பட்டது
        if (!mongoose.Types.ObjectId.isValid(client) || !mongoose.Types.ObjectId.isValid(counselor)) {
            return res.status(400).json({ message: "Invalid client or counselor ID format" });
        }

        const clientExists = await Client.findById(client); // "User" என்பதற்கு பதிலாக "Client"
        const counselorExists = await Counselor.findById(counselor);

        if (!clientExists || !counselorExists) {
            return res.status(400).json({ message: "Invalid client or counselor ID" });
        }

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
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`, // {{}} நீக்கப்பட்டது
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        const payment = new Payment({
            client: clientExists._id,
            counselor: counselorExists._id,
            amount: amountNum,
            paymentMethod,
            stripeChargeId: session.id,
        });

        await payment.save();

        res.json({ url: session.url });

    } catch (error) {
        console.error("Payment error:", error); // முழு பிழை பதிவு
        res.status(500).json({ message: error.message || "Payment processing failed" });
    }
};