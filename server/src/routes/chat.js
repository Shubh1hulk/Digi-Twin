const express = require('express');
const authMiddleware = require('../middleware/auth');
const { generateTwinResponse } = require('../services/openai');
const { chatMessages, getUserById } = require('../services/mockDb');
const router = express.Router();
router.use(authMiddleware);
const useDB = () => { try { return require('mongoose').connection.readyState === 1; } catch(e) { return false; } };
router.post('/message', async (req, res) => {
  try {
    const { message, mode = 'advisor' } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });
    const user = getUserById(req.userId);
    const response = await generateTwinResponse(message, mode, user?.twinProfile);
    const chatMsg = { _id: `msg-${Date.now()}`, userId: req.userId, mode, message, response, createdAt: new Date() };
    if (!useDB()) {
      chatMessages.push(chatMsg);
      if (user) user.chatSessionsCount = (user.chatSessionsCount || 0) + 1;
    }
    res.json({ response, messageId: chatMsg._id });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});
router.get('/history', async (req, res) => {
  try {
    const userMsgs = chatMessages.filter(m => m.userId === req.userId);
    res.json({ messages: userMsgs.slice(-50).reverse() });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});
module.exports = router;
