const User = require('../models/User');
const Movie = require('../models/Movie');
const { extractWatermark } = require('./watermarkService');
const { sendFraudAlertEmail } = require('./emailService');

const checkForFraud = async (movieId, uploaderId) => {
  try {
    const movie = await Movie.findById(movieId).populate('owner', 'name email');
    if (!movie) return { fraud: false };

    // extract watermark from uploaded file
    const watermark = await extractWatermark(movie.fileUrl);
    if (!watermark.isWatermarked) return { fraud: false };

    // watermark found — check if it belongs to a different user
    const registeredMovie = await Movie.findById(watermark.movieId).populate('owner', 'name email');
    if (!registeredMovie) return { fraud: false };

    const isOriginalOwner = registeredMovie.owner._id.toString() === uploaderId.toString();
    if (isOriginalOwner) return { fraud: false };

    // FRAUD DETECTED — suspend the uploader
    const fraudUser = await User.findById(uploaderId);
    fraudUser.fraudFlags += 1;
    fraudUser.accountStatus = fraudUser.fraudFlags >= 3 ? 'banned' : 'suspended';
    fraudUser.suspendedAt = new Date();
    fraudUser.suspensionReason = `Uploaded content registered to another user. Owner code: ${watermark.ownerCode}`;
    await fraudUser.save();

    // notify admin
    await sendFraudAlertEmail({
      fraudUserName: fraudUser.name,
      fraudUserEmail: fraudUser.email,
      originalOwnerName: registeredMovie.owner.name,
      originalOwnerEmail: registeredMovie.owner.email,
      movieTitle: registeredMovie.title,
      ownerCode: watermark.ownerCode,
      fraudFlags: fraudUser.fraudFlags,
      accountStatus: fraudUser.accountStatus,
    }).catch((err) => console.error('Fraud alert email error:', err.message));

    console.log(`FRAUD DETECTED: ${fraudUser.email} uploaded content owned by ${registeredMovie.owner.email}`);

    return {
      fraud: true,
      ownerCode: watermark.ownerCode,
      originalOwner: registeredMovie.owner.name,
      accountStatus: fraudUser.accountStatus,
    };
  } catch (error) {
    console.error('Fraud check error:', error.message);
    return { fraud: false };
  }
};

module.exports = { checkForFraud };