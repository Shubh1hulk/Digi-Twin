const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getInMemoryUser, createUser, getUserById } = require('../services/mockDb');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'lifetwin-dev-secret-2024';

const useDB = () => {
  try {
    return require('mongoose').connection.readyState === 1;
  } catch (e) {
    return false;
  }
};

const findUserByEmail = async (email) => {
  if (useDB()) {
    const User = require('../models/User');
    return User.findOne({ email });
  }
  return getInMemoryUser(email);
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    let user;
    if (useDB()) {
      const User = require('../models/User');
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({ name, email, password: hashedPassword });
    } else {
      user = await createUser({ name, email, password });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twinProfile: user.twinProfile,
        simulationsCount: user.simulationsCount || 0,
        chatSessionsCount: user.chatSessionsCount || 0
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twinProfile: user.twinProfile,
        simulationsCount: user.simulationsCount || 0,
        chatSessionsCount: user.chatSessionsCount || 0
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    let user;
    if (useDB()) {
      const User = require('../models/User');
      user = await User.findById(req.userId).select('-password');
    } else {
      user = getUserById(req.userId);
    }

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twinProfile: user.twinProfile,
        simulationsCount: user.simulationsCount || 0,
        chatSessionsCount: user.chatSessionsCount || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
