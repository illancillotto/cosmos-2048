const express = require('express');
const Score = require('../models/Score');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 50;
    limit = Math.min(limit, 200);

    const leaderboard = await Score.aggregate([
      {
        $sort: { score: -1, createdAt: 1 }
      },
      {
        $group: {
          _id: '$address',
          bestScore: { $first: '$score' },
          at: { $first: '$createdAt' }
        }
      },
      {
        $project: {
          _id: 0,
          address: '$_id',
          bestScore: 1,
          at: 1
        }
      },
      {
        $sort: { bestScore: -1, at: 1 }
      },
      {
        $limit: limit
      }
    ]);

    const leaderboardWithRanks = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    res.status(200).json({
      leaderboard: leaderboardWithRanks,
      total: leaderboardWithRanks.length
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;