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
import { google } from 'googleapis';

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

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

app.post('/create-meet', async (req, res) => {
  const { startTime, endTime, timeZone, summary, attendeeEmail } = req.body;

  if (!summary || !startTime || !endTime || !attendeeEmail || !timeZone) {
    return res.status(400).json({ error: 'summary, startTime, endTime, attendeeEmail, and timeZone are required in the request body' });
  }

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: summary,
        start: { dateTime: new Date(startTime).toISOString(), timeZone: timeZone },
        end: { dateTime: new Date(endTime).toISOString(), timeZone: timeZone },
        attendees: [{ email: attendeeEmail }],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const meetLink = response.data?.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === 'video'
    )?.uri;

    res.json({ meetLink });
  } catch (error) {
    console.error('Google Meet creation failed:', error);
    res.status(500).json({ error: 'Failed to create Meet link' });
  }
});

app.use((req, res) => {
  console.log("404")
  res.status(404).json({ message: '404 Not Found' }); // Status code-ஐயும் மாத்துங்க
});

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));