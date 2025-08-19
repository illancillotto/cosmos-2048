require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./db');

const authRoutes = require('./routes/auth');
const scoresRoutes = require('./routes/scores');
const leaderboardRoutes = require('./routes/leaderboard');
const wheelRoutes = require('./routes/wheel');
const mintRoutes = require('./routes/mint');

const app = express();

connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3017', 'http://web:3017']
    : true,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    service: 'cosmos-2048-api'
  });
});

app.use('/auth', authRoutes);
app.use('/scores', scoresRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/wheel', wheelRoutes);
app.use('/mint', mintRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5017;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Cosmos 2048 API running on port ${PORT}`);
});