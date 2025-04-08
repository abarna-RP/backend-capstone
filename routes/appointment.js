import express from 'express';
import Appointment from '../models/Appointment.js';
import { verifyToken } from '../middleware/auth.js';
import { generateAgoraToken } from '../utils/videoCall.js';
import { body, validationResult } from 'express-validator';
const router = express.Router();

// Create appointment
router.post('/', verifyToken,[ body('client').notEmpty().withMessage('Client is required'),
body('counselor').notEmpty().withMessage('Counselor is required'),
body('date').notEmpty().withMessage('Date is required'),
body('sessionType').notEmpty().withMessage('Session type is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).send(appointment);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get appointments for client
router.get('/client/:clientId', verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ client: req.params.clientId }).populate('counselor');
    res.send(appointments);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Get appointments for counselor
router.get('/counselor/:counselorId', verifyToken, async (req, res) => {
    try{
        const appointments = await Appointment.find({counselor: req.params.counselorId}).populate('client');
        res.send(appointments);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Update appointment notes
router.put('/notes/:appointmentId', verifyToken, async (req, res) => {
    try{
        const appointment = await Appointment.findByIdAndUpdate(req.params.appointmentId, {notes: req.body.notes}, {new: true});
        res.send(appointment);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
router.get('/video-call/:appointmentId/:userId', verifyToken, async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const userId = req.params.userId;

    const channelName = `appointment-${appointmentId}`;
    const token = generateAgoraToken(channelName, Number(userId));

    res.send({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;