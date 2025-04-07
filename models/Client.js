import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  preferences: { type: [String], default: [] },
});

export default mongoose.model('Client', clientSchema);