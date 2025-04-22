// models/counselor.js
import mongoose from 'mongoose';

const counselorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: [String], required: true },
  availability: { type: [Date], default: [] },
  bio: { type: String },
  sessionRate: {type: Number},
});

export default mongoose.model('Counselor', counselorSchema);