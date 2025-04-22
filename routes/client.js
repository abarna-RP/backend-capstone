// routes/client.js
import express from 'express';
import Client from '../models/Client.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get client by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).send('Client not found');
    res.send(client);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update client profile
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).send('Client not found');
    res.send(client);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;