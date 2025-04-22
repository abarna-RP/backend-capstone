// controllers/paymentController.js
import Stripe from "stripe";
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Counselor from '../models/Counselor.js';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        const { client, counselor, amount, paymentMethod } = req.body;
        
       
        const clientExists = await User.findById(client)
        const counselorExists = await Counselor.findById(counselor)
       
       

        if (!clientExists || !counselorExists) {
            return res.status(400).json({
                message: "Invalid client or counselor ID"
            });
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
            success_url: `http://localhost:5173/success?session_id={{CHECKOUT_SESSION_ID}}`,
            cancel_url: `http://localhost:5173/cancel`,
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
        console.error("Payment error:", error);
        res.status(500).json({
            message: error.message || "Payment processing failed"
        });
    }
};
