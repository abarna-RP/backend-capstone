import express from 'express';
import { createCheckoutSession } from "../Controllers/paymentController.js";

const router = express.Router();

router.post('/checkout', createCheckoutSession);

export default router;