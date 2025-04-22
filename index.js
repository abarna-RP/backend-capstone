//index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/dbConfig.js';
import authRoutes from './routes/auth.js';
import counselorRoutes from './routes/counselor.js';
import clientRoutes from './routes/client.js';
import appointmentRoutes from './routes/appointment.js';
import paymentRoutes from './routes/payment.js';
import { generateAgoraToken } from './utils/videoCall.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));


app.use('/auth', authRoutes);
app.use('/counselors', counselorRoutes);
app.use('/clients', clientRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/payments', paymentRoutes);
app.get('/video-token', (req, res) => {
  const { channelName, uid } = req.query;

  if (!channelName || !uid) {
    return res.status(400).send({ error: 'channelName and uid are required' });
  }

  try {
    console.log('Generating token for:', channelName, uid);
    const token = generateAgoraToken(channelName, uid);
    res.send({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).send({ error: 'Token generation failed' });
  }
});

app.use((req, res) => {
  console.log("404")
  res.json({ message: '404' })
})

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));