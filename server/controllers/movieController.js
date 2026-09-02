// const Movie = require('../models/Movie');
// const { cloudinary } = require('../config/cloudinary');
// const { registerFingerprint } = require('../services/fingerprintService');
// const { scanMovie } = require('../services/scanService');
// const { checkForFraud } = require('../services/fraudService');
// const { log } = require('../services/activityService');
// const uploadMovie = async (req, res) => {
//   try {
//     const { title, description, genre, releaseYear } = req.body;

//     if (!title) return res.status(400).json({ message: 'Title is required' });
//     if (!req.file) return res.status(400).json({ message: 'Video file is required' });

//     const newMovie = await Movie.create({
//       owner: req.user._id,
//       title,
//       description,
//       genre,
//       releaseYear,
//       fileUrl: req.file.path,
//       cloudinaryPublicId: req.file.filename,
//       fingerprint: 'pending',
//     });
//     log('movie_uploaded', `Movie uploaded: ${title}`, req.user._id, { movieId: newMovie._id, title });

//     // fingerprint → fraud check → scan — all in background
//     // registerFingerprint(req.file.path, newMovie._id.toString(), title)
//     //   .then(async (fingerprint) => {
//     //     await Movie.findByIdAndUpdate(newMovie._id, { fingerprint });
//     //     console.log(`Fingerprint saved for: ${title} — checking for fraud`);

//     //     const fraudResult = await checkForFraud(newMovie._id, req.user._id);
//     //     if (fraudResult.fraud) {
//     //       console.log(`Fraud detected on upload by: ${req.user.email}`);
//     //       await Movie.findByIdAndDelete(newMovie._id);
//     //       return;
//     //     }

//     //     console.log(`No fraud detected — starting auto-scan for: ${title}`);
//     //     await scanMovie(newMovie._id, req.app);
//     //     console.log(`Auto-scan complete for: ${title}`);
//     //   })
//     //   .catch((err) => {
//     //     console.error('Fingerprint/scan error:', err.message);
//     //     Movie.findByIdAndUpdate(newMovie._id, { fingerprint: 'error' }).catch(() => {});
//     //   });

//     registerFingerprint(req.file.path, newMovie._id.toString(), title)
//       .then(async (fingerprint) => {
//         await Movie.findByIdAndUpdate(newMovie._id, { fingerprint });
//         console.log(`Fingerprint saved for: ${title} — checking for fraud`);
//         const fraudResult = await checkForFraud(newMovie._id, req.user._id);
//         if (fraudResult.fraud) {
//           await Movie.findByIdAndDelete(newMovie._id);
//           return;
//         }
//         await scanMovie(newMovie._id, req.app);
//         console.log(`Auto-scan complete for: ${title}`);
//       })
//       .catch((err) => {
//         console.error('Fingerprint/scan error:', err.message);
//         Movie.findByIdAndUpdate(movie._id, { fingerprint: 'error' }).catch(() => {});
//       });

//     res.status(201).json({ message: 'Movie uploaded successfully', movie: newMovie });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const getMyMovies = async (req, res) => {
//   try {
//     const movies = await Movie.find({ owner: req.user._id }).sort({ createdAt: -1 });
//     res.json({ movies });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const getMovie = async (req, res) => {
//   try {
//     const movie = await Movie.findOne({ _id: req.params.id, owner: req.user._id });
//     if (!movie) return res.status(404).json({ message: 'Movie not found' });
//     res.json({ movie });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const deleteMovie = async (req, res) => {
//   try {
//     const movie = await Movie.findOne({ _id: req.params.id, owner: req.user._id });
//     if (!movie) return res.status(404).json({ message: 'Movie not found' });

//     if (movie.cloudinaryPublicId) {
//       await cloudinary.uploader.destroy(movie.cloudinaryPublicId, { resource_type: 'video' });
//     }

//     await movie.deleteOne();
//     res.json({ message: 'Movie deleted' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// module.exports = { uploadMovie, getMyMovies, getMovie, deleteMovie };

const Movie = require('../models/Movie');
const { cloudinary } = require('../config/cloudinary');
const { registerFingerprint } = require('../services/fingerprintService');
const { scanMovie } = require('../services/scanService');
const { checkForFraud } = require('../services/fraudService');
const { log } = require('../services/activityService');
const { notifyUser } = require('../services/notificationService');

const uploadMovie = async (req, res) => {
  try {
    const { title, description, genre, releaseYear } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!req.file) return res.status(400).json({ message: 'Video file is required' });

    const newMovie = await Movie.create({
      owner: req.user._id,
      title,
      description,
      genre,
      releaseYear,
      fileUrl: req.file.path,
      cloudinaryPublicId: req.file.filename,
      fingerprint: 'pending',
      fraudCheckStatus: 'checking',
    });

    log('movie_uploaded', `Movie uploaded: ${title}`, req.user._id, {
      movieId: newMovie._id, title,
    });

    // fingerprint → fraud check → scan in background
    registerFingerprint(req.file.path, newMovie._id.toString(), title)
      .then(async (fingerprint) => {
        await Movie.findByIdAndUpdate(newMovie._id, { fingerprint });
        console.log(`Fingerprint saved for: ${title} — running fraud check`);

        const fraudResult = await checkForFraud(newMovie._id, req.user._id);

        if (fraudResult.fraud) {
          console.log(`Fraud detected on upload by: ${req.user.email}`);

          // mark movie as fraud
          await Movie.findByIdAndUpdate(newMovie._id, {
            fraudCheckStatus: 'failed',
            fraudCheckResult: `Content belongs to: ${fraudResult.originalOwner}`,
          });

          // notify user in real-time
          await notifyUser(req.app, req.user._id.toString(), 'fraud_detected', {
            type: 'account',
            title: 'Fraudulent Upload Detected',
            message: `Your upload "${title}" contains content registered to another creator. Your account has been actioned.`,
            metadata: { movieId: newMovie._id, title },
          });

          // emit live account status change
          const io = req.app.get('io');
          const connectedUsers = req.app.get('connectedUsers');
          const socketId = connectedUsers?.get(req.user._id.toString());
          if (socketId) {
            io.to(socketId).emit('account_status_changed', {
              status: fraudResult.accountStatus,
              reason: `Uploaded content registered to another user (${fraudResult.ownerCode})`,
            });
          }

          return;
        }

        // fraud check passed
        await Movie.findByIdAndUpdate(newMovie._id, { fraudCheckStatus: 'passed' });
        console.log(`Fraud check passed — starting scan for: ${title}`);

        // notify user their movie is ready
        await notifyUser(req.app, req.user._id.toString(), 'movie_ready', {
          type: 'infringement',
          title: 'Movie Verified & Ready',
          message: `"${title}" passed verification. You can now download your protected copy.`,
          metadata: { movieId: newMovie._id, title },
        });

        await scanMovie(newMovie._id, req.app);
        console.log(`Auto-scan complete for: ${title}`);
      })
      .catch((err) => {
        console.error('Fingerprint/scan error:', err.message);
        Movie.findByIdAndUpdate(newMovie._id, {
          fingerprint: 'error',
          fraudCheckStatus: 'failed',
          fraudCheckResult: 'Fingerprint processing failed',
        }).catch(() => {});
      });

    res.status(201).json({ message: 'Movie uploaded successfully', movie: newMovie });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ movies });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findOne({ _id: req.params.id, owner: req.user._id });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ movie });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findOne({ _id: req.params.id, owner: req.user._id });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    if (movie.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(movie.cloudinaryPublicId, {
        resource_type: 'video',
      });
    }

    await movie.deleteOne();
    res.json({ message: 'Movie deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { uploadMovie, getMyMovies, getMovie, deleteMovie };