const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
  title: String,
  shortTerm: String,
  longTerm: String,
  risks: [String],
  opportunities: [String],
  score: Number
});

const simulationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  decision: { type: String, required: true },
  scenarios: [scenarioSchema],
  createdAt: { type: Date, default: Date.now }
});

const chatMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mode: { type: String, enum: ['twin', 'advisor'], default: 'advisor' },
  message: String,
  response: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Simulation: mongoose.models.Simulation || mongoose.model('Simulation', simulationSchema),
  ChatMessage: mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema)
};
