import Stripe from "stripe";
import dotenv from "dotenv";
import Client from '../models/Client.js'; 
import Counselor from '../models/Counselor.js'; 
import mongoose from 'mongoose'; 

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        const { client, counselor, amount } = req.body;

        if (!mongoose.Types.ObjectId.isValid(client) || !mongoose.Types.ObjectId.isValid(counselor)) {
            return res.status(400).json({ message: "Invalid client or counselor ID format" });
        }

        
        const [clientExists, counselorExists] = await Promise.all([
            Client.findById(client),
            Counselor.findById(counselor)
        ]);

        if (!clientExists || !counselorExists) {
            return res.status(400).json({ message: "Invalid client or counselor ID" });
        }

       
        const amountNum = Number(amount);
        if (!amount || isNaN(amountNum)) {
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
            success_url: "http://localhost:5173/success", 
            cancel_url: "http://localhost:5173/cancel", 
        });

        res.json({ url: session.url });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
};