const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: [
      'user_registered', 'user_login', 'movie_uploaded', 'movie_deleted',
      'scan_completed', 'infringement_detected', 'takedown_sent',
      'account_suspended', 'account_banned', 'account_reinstated',
      'fraud_detected', 'ownership_verified', 'ownership_rejected',
      'appeal_submitted', 'appeal_approved', 'appeal_rejected',
    ],
    required: true,
  },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);