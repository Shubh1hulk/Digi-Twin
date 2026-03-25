const express = require('express');
const authMiddleware = require('../middleware/auth');
const { simulateDecision } = require('../services/openai');
const { simulations, getUserById } = require('../services/mockDb');
const router = express.Router();
router.use(authMiddleware);
const useDB = () => { try { return require('mongoose').connection.readyState === 1; } catch(e) { return false; } };
router.post('/simulate', async (req, res) => {
  try {
    const { decision } = req.body;
    if (!decision) return res.status(400).json({ message: 'Decision text required' });
    const user = getUserById(req.userId);
    const scenarios = await simulateDecision(decision, user?.twinProfile);
    const simulation = { _id: `sim-${Date.now()}`, userId: req.userId, decision, scenarios, createdAt: new Date() };
    if (!useDB()) {
      simulations.push(simulation);
      if (user) user.simulationsCount = (user.simulationsCount || 0) + 1;
    }
    res.json({ simulation });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});
router.get('/history', async (req, res) => {
  try {
    const userSims = simulations.filter(s => s.userId === req.userId);
    res.json({ simulations: userSims.slice(-10).reverse() });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});
module.exports = router;
