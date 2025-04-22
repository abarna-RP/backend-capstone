//models/appoinment.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'Counselor', required: true },
  date: { type: Date, required: true },
  sessionType: { type: String, required: true },
  notes: {type: String},
});

export default mongoose.model('Appointment', appointmentSchema);