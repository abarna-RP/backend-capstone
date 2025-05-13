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
 // Import the updated function
import { google } from 'googleapis';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

app.use(cors());
app.use(express.json());


const { OAuth2 } = google.auth;

const oAuth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // Ensure this is configured in your Google Cloud Console
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

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


app.post('/create-meet-link', async (req, res) => {
  try {
    const event = {
      summary: 'Counseling Session',
      description: 'Video call for the counseling session.',
      start: {
        dateTime: new Date().toISOString(), // You might want to allow scheduling
        timeZone: 'Asia/Kolkata', // Adjust to your timezone
      },
      end: {
        dateTime: new Date(Date.now() + 3600000).toISOString(), // Session duration (1 hour)
        timeZone: 'Asia/Kolkata', // Adjust to your timezone
      },
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(7), // Unique ID for the meeting
        },
      },
      attendees: [
        // You could potentially add the client's email here if you have it
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary', // Use 'primary' for the authenticated user's calendar
      resource: event,
      conferenceDataVersion: 1,
    });

    res.json({ meetLink: response.data.hangoutLink });
  } catch (error) {
    console.error('Error creating Google Meet link:', error);
    res.status(500).json({ error: 'Failed to create Google Meet link' });
  }
});

app.listen(PORT, () => {
  console.log(`Counselor backend server listening on port ${PORT}`);
});
