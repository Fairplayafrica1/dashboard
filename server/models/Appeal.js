const mongoose = require('mongoose');

const appealSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  type: {
    type: String,
    enum: ['fraud_flag', 'suspension', 'ban', 'false_infringement'],
    required: true,
  },
  reason: { type: String, required: true },
  evidence: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNote: { type: String, default: '' },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Appeal', appealSchema);