const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  twinProfile: {
    communicationStyle: { type: String, default: '' },
    tone: { type: String, default: '' },
    preferences: [String],
    habits: [String],
    completionScore: { type: Number, default: 0 }
  },
  simulationsCount: { type: Number, default: 0 },
  chatSessionsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
