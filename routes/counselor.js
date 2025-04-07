import express from 'express';
import Counselor from '../models/Counselor.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all counselors
router.get('/', async (req, res) => {
  try {
    const counselors = await Counselor.find();
    res.send(counselors);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update counselor profile
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const counselor = await Counselor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!counselor) return res.status(404).send('Counselor not found');
    res.send(counselor);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// update availability
router.put('/availability/:id', verifyToken, async (req, res) => {
  try {
    const counselor = await Counselor.findByIdAndUpdate(req.params.id, {availability: req.body.availability}, {new:true});
    res.send(counselor);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;