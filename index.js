import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import counselorRoutes from './routes/counselor.js';
import clientRoutes from './routes/client.js';
import appointmentRoutes from './routes/appointment.js';
import paymentRoutes from './routes/payment.js';
import { generateAgoraToken } from './utils/videoCall.js';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

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
  const channelName = req.query.channelName;
  const uid = Number(req.query.uid);
  try {
    const token = generateAgoraToken(channelName, uid);
    res.send({ token });
  } catch (error) {
    console.error("error generating token", error);
    res.status(500).send({error : "token generation failed"});
  }

});
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

