const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  runId: {
    type: String,
    trim: true
  },
  commit: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

scoreSchema.index({ address: 1 });
scoreSchema.index({ score: -1 });
scoreSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Score', scoreSchema);