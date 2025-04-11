import express from 'express';
import { createCheckoutSession } from "../Controllers/paymentController.js";
import { verifyToken } from '../middleware/auth.js'; // Verify token middleware

const router = express.Router();

// Create checkout session route
router.post('/checkout', verifyToken, createCheckoutSession); // Add verifyToken middleware

export default router;