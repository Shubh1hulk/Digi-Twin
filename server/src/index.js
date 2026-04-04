require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const twinRoutes = require('./routes/twin');
const simulatorRoutes = require('./routes/simulator');
const chatRoutes = require('./routes/chat');
const modelsRoutes = require('./routes/models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/twin', twinRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/models', modelsRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri !== 'mongodb://localhost:27017/lifetwin') {
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connected');
    } catch (err) {
      console.log('⚡ MongoDB connection failed, using in-memory mock data');
    }
  } else {
    console.log('⚡ Running with in-memory mock data (no MongoDB configured)');
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 LifeTwin server running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
  });
});
