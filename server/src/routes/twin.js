const express = require('express');
const authMiddleware = require('../middleware/auth');
const { generateTwinProfile, generateTwinResponse } = require('../services/openai');
const { getUserById } = require('../services/mockDb');

const router = express.Router();
router.use(authMiddleware);

const useDB = () => {
  try {
    return require('mongoose').connection.readyState === 1;
  } catch (e) {
    return false;
  }
};

const updateUserProfile = async (userId, twinProfile) => {
  if (useDB()) {
    const User = require('../models/User');
    return User.findByIdAndUpdate(userId, { twinProfile }, { new: true });
  }
  const user = getUserById(userId);
  if (user) {
    user.twinProfile = { ...user.twinProfile, ...twinProfile };
  }
  return user;
};

router.post('/train', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array required' });
    }

    const profile = await generateTwinProfile({ messages });
    const user = getUserById(req.userId);
    const currentScore = user?.twinProfile?.completionScore || 0;
    const newScore = Math.min(100, currentScore + 15);

    await updateUserProfile(req.userId, { ...profile, completionScore: newScore });

    res.json({ success: true, profile, completionScore: newScore });
  } catch (err) {
    console.error('Train error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/quiz', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers) return res.status(400).json({ message: 'Answers required' });

    const profile = {
      communicationStyle: answers.style || 'analytical',
      tone: answers.tone || 'professional',
      preferences: answers.preferences || ['innovation', 'efficiency'],
      habits: answers.habits || ['strategic planning', 'continuous learning'],
      completionScore: 45
    };

    await updateUserProfile(req.userId, profile);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    let user;
    if (useDB()) {
      const User = require('../models/User');
      user = await User.findById(req.userId).select('twinProfile name email simulationsCount chatSessionsCount');
    } else {
      user = getUserById(req.userId);
    }

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      twinProfile: user.twinProfile,
      name: user.name,
      simulationsCount: user.simulationsCount || 0,
      chatSessionsCount: user.chatSessionsCount || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const user = getUserById(req.userId);
    const response = await generateTwinResponse(message, 'twin', user?.twinProfile);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
