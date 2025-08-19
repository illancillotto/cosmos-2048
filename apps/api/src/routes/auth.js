const express = require('express');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const router = express.Router();

router.post('/guest', async (req, res) => {
  try {
    const guestAddress = `guest#${Math.random().toString(36).substring(7)}`;
    
    const user = await User.findOneAndUpdate(
      { address: guestAddress },
      { address: guestAddress },
      { upsert: true, new: true }
    );

    const token = signToken({ address: user.address });

    res.status(201).json({
      token,
      address: user.address
    });
  } catch (error) {
    console.error('Guest auth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/wallet', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const user = await User.findOneAndUpdate(
      { address },
      { address },
      { upsert: true, new: true }
    );

    const token = signToken({ address: user.address });

    res.status(200).json({
      token,
      address: user.address
    });
  } catch (error) {
    console.error('Wallet auth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;