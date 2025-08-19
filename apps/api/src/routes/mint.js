const express = require('express');
const { auth } = require('../utils/jwt');

const router = express.Router();

router.post('/badge', auth, async (req, res) => {
  try {
    const { recipient } = req.body;
    const { address } = req.user;

    const targetAddress = recipient || address;

    if (!targetAddress) {
      return res.status(400).json({ error: 'Recipient address is required' });
    }

    const stubTxHash = `stub-tx-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const stubTokenId = `badge-${Date.now()}`;

    res.status(200).json({
      ok: true,
      txHash: stubTxHash,
      tokenId: stubTokenId,
      recipient: targetAddress,
      minter: address,
      timestamp: new Date().toISOString(),
      message: 'Badge minted successfully (stub response)'
    });
  } catch (error) {
    console.error('Badge mint error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;