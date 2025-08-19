const express = require('express');
const Score = require('../models/Score');
const { auth } = require('../utils/jwt');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { score, runId, commit } = req.body;
    const { address } = req.user;

    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: 'Valid score is required' });
    }

    const newScore = new Score({
      address,
      score,
      runId,
      commit
    });

    await newScore.save();

    res.status(201).json({
      message: 'Score saved successfully',
      score: {
        address,
        score,
        createdAt: newScore.createdAt
      }
    });
  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;