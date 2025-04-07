import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'counselor'], required: true },
  profile: { type: mongoose.Schema.Types.ObjectId, refPath: 'role' },
});

export default mongoose.model('User', userSchema);