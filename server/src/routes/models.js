const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getAvailableModels } = require('../services/modelManager');
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

/** List all models with availability flags */
router.get('/available', (req, res) => {
  try {
    res.json(getAvailableModels());
  } catch (err) {
    console.error('models/available error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/** Get the requesting user's current model preferences */
router.get('/preferences', async (req, res) => {
  try {
    let preferences;
    if (useDB()) {
      const User = require('../models/User');
      const user = await User.findById(req.userId).select('modelPreferences');
      preferences = user?.modelPreferences;
    } else {
      const user = getUserById(req.userId);
      preferences = user?.modelPreferences;
    }

    res.json({
      preferredLLMModel: preferences?.preferredLLMModel || process.env.DEFAULT_LLM_MODEL || 'gpt-3.5-turbo',
      preferredRAGFramework: preferences?.preferredRAGFramework || process.env.DEFAULT_RAG_FRAMEWORK || 'langchain',
      preferredEmbeddingModel: preferences?.preferredEmbeddingModel || process.env.DEFAULT_EMBEDDING_MODEL || 'openai-embeddings',
    });
  } catch (err) {
    console.error('models/preferences GET error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/** Save the requesting user's model preferences */
router.put('/preferences', async (req, res) => {
  try {
    const { preferredLLMModel, preferredRAGFramework, preferredEmbeddingModel } = req.body;

    const update = {};
    if (preferredLLMModel) update.preferredLLMModel = preferredLLMModel;
    if (preferredRAGFramework) update.preferredRAGFramework = preferredRAGFramework;
    if (preferredEmbeddingModel) update.preferredEmbeddingModel = preferredEmbeddingModel;

    if (useDB()) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(
        req.userId,
        { $set: { modelPreferences: update } },
        { new: true }
      );
    } else {
      // In-memory fallback
      const user = getUserById(req.userId);
      if (user) {
        user.modelPreferences = { ...(user.modelPreferences || {}), ...update };
      }
    }

    res.json({ success: true, preferences: update });
  } catch (err) {
    console.error('models/preferences PUT error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
