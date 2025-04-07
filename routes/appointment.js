import express from 'express';
import Appointment from '../models/Appointment.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create appointment
router.post('/', verifyToken, async (req, res) => {
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

export default router;