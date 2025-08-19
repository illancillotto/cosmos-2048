const express = require('express');
const { auth } = require('../utils/jwt');

const router = express.Router();

router.post('/spin', auth, async (req, res) => {
  try {
    const { seed } = req.body;
    const { address } = req.user;

    const random = seed ? Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000) : Math.random();
    const outcome = random < 0.1 ? 'MINT_BADGE' : 'NOTHING';

    res.status(200).json({
      outcome,
      player: address,
      timestamp: new Date().toISOString(),
      message: outcome === 'MINT_BADGE' ? 'Congratulations! You won a badge!' : 'Better luck next time!'
    });
  } catch (error) {
    console.error('Wheel spin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;