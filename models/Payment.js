import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'Counselor', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String },
  stripeChargeId: { type: String }, // Add stripeChargeId
});

export default mongoose.model('Payment', paymentSchema);
