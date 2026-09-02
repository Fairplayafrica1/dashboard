const mongoose = require('mongoose');

const infringementSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  youtubeVideoId: { type: String, required: true },
  youtubeVideoUrl: { type: String, required: true },
  youtubeTitle: { type: String },
  youtubeChannel: { type: String },
  youtubeChannelId: { type: String },
  youtubeThumbnail: { type: String },
  youtubePublishedAt: { type: Date },
  matchConfidence: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['detected', 'notified', 'takedown_sent', 'resolved', 'dismissed'],
    default: 'detected'
  },
  takedownSentAt: { type: Date },
  resolvedAt: { type: Date },
  notes: { type: String, default: '' },
}, { timestamps: true });

infringementSchema.index({ movie: 1, youtubeVideoId: 1 }, { unique: true });

module.exports = mongoose.model('Infringement', infringementSchema);