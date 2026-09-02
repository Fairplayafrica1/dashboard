const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  genre: { type: String, default: '' },
  releaseYear: { type: Number },
  fileUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  cloudinaryPublicId: { type: String },
  fingerprint: { type: String, default: '' },

    ownerCode: { type: String, default: '' },
    watermarkedUrl: { type: String, default: '' },
    watermarkStatus: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'error'],
    default: 'pending',
    },
    ownershipVerified: { type: Boolean, default: false },
    legalDeclaration: {
    agreed: { type: Boolean, default: false },
    agreedAt: { type: Date },
    ipAddress: { type: String },
    fullName: { type: String },
    },
    ownershipEvidence: {
    fileUrl: { type: String, default: '' },
    fileType: { type: String, default: '' },
    uploadedAt: { type: Date },
    },
  duration: { type: Number, default: 0 },
  scanStatus: {
    type: String,
    enum: ['idle', 'scanning', 'scanned', 'error'],
    default: 'idle'
  },
  fraudCheckStatus: {
  type: String,
  enum: ['pending', 'checking', 'passed', 'failed'],
  default: 'pending',
  },
  lastDownloadedAt: { type: Date },
fraudCheckResult: { type: String, default: '' },
  lastScannedAt: { type: Date },
  infringementCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);