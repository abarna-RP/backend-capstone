import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Counselor from '../models/Counselor.js';
import Client from '../models/Client.js';

const router = express.Router();

// ✅ Registration Route
router.post('/register', async (req, res) => {
  console.log("Registration request received");
  console.log(req.body);

  const { username, email, password, role, name, specialization, preferences, sessionRate } = req.body;

  try {
    // Validate email format
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    let profile;
    if (role === 'counselor') {
      profile = new Counselor({ name, specialization, sessionRate });
    } else if (role === 'client') {
      profile = new Client({ name, preferences });
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await profile.save();

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      profile: profile._id,
    });

    await newUser.save();

    const token = jwt.sign({ _id: newUser._id, role: newUser.role }, process.env.JWT_SECRET_KEY);
    res.status(201).json({
      token,
      role: newUser.role,
      userId: newUser._id,
      username: newUser.username
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
  
    res.json({
      token,
      role: user.role,
      userId: user._id,
      username: user.username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});


export default router;
