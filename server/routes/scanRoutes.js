const express = require('express');
const router = express.Router();
const { scanMovie, scanAllMovies } = require('../services/scanService');
const Movie = require('../models/Movie');
const Infringement = require('../models/Infringement');
const { log } = require('../services/activityService');
const { protect, protectAll } = require('../middleware/auth');

// manually trigger scan for one movie
// router.post('/movie/:id', protect, async (req, res) => {
//   try {
//     const movie = await Movie.findOne({ _id: req.params.id, owner: req.user._id });
//     if (!movie) return res.status(404).json({ message: 'Movie not found' });

//     const result = await scanMovie(req.params.id);
//     res.json({ message: 'Scan complete', ...result });
//   } catch (error) {
//     res.status(500).json({ message: 'Scan failed', error: error.message });
//   }
// });

router.post('/movie/:id', protect, async (req, res) => {
  try {
    const movie = await Movie.findOne({ _id: req.params.id, owner: req.user._id });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    const result = await scanMovie(req.params.id, req.app);
    res.json({ message: 'Scan complete', ...result });
  } catch (error) {
    res.status(500).json({ message: 'Scan failed', error: error.message });
  }
});

// get all infringements for the logged in user
router.get('/infringements', protect, async (req, res) => {
  try {
    const infringements = await Infringement.find({ owner: req.user._id })
      .populate('movie', 'title thumbnailUrl')
      .sort({ createdAt: -1 });

    res.json({ infringements });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// get infringements for a specific movie
router.get('/infringements/movie/:id', protect, async (req, res) => {
  try {
    const infringements = await Infringement.find({
      movie: req.params.id,
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ infringements });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// update infringement status
// router.patch('/infringements/:id', protect, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const infringement = await Infringement.findOneAndUpdate(
//       { _id: req.params.id, owner: req.user._id },
//       { status, ...(status === 'takedown_sent' && { takedownSentAt: new Date() }),
//                ...(status === 'resolved' && { resolvedAt: new Date() }) },
//       { returnDocument: 'after' }
//     );

//     if (!infringement) return res.status(404).json({ message: 'Infringement not found' });
//     res.json({ infringement });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });


const { sendTakedownEmail } = require('../services/emailService');
const User = require('../models/User');

// // update infringement status
// router.patch('/infringements/:id', protect, async (req, res) => {
//   try {
//     const { status } = req.body;

//     const infringement = await Infringement.findOneAndUpdate(
//       { _id: req.params.id, owner: req.user._id },
//       {
//         status,
//         ...(status === 'takedown_sent' && { takedownSentAt: new Date() }),
//         ...(status === 'resolved' && { resolvedAt: new Date() }),
//       },
//       { returnDocument: 'after' }
//     ).populate('movie', 'title');

//     if (!infringement) return res.status(404).json({ message: 'Infringement not found' });

//     // send takedown email when user clicks Send Takedown
//     if (status === 'takedown_sent') {
//       const user = await User.findById(req.user._id);
//       await sendTakedownEmail({
//         to: user.email,
//         ownerName: user.name,
//         movieTitle: infringement.movie.title,
//         youtubeVideoUrl: infringement.youtubeVideoUrl,
//         youtubeChannel: infringement.youtubeChannel,
//       }).catch((err) => console.error('Email error:', err.message));
//       log('takedown_sent',
//         `Takedown sent for infringement on "${infringement.movie.title}"`,
//         req.user._id,
//         { infringementId: infringement._id, youtubeVideoUrl: infringement.youtubeVideoUrl }
//       );
      
//     }
    

//     res.json({ infringement });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });


router.patch('/infringements/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['detected', 'takedown_sent', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const infringement = await Infringement.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      {
        status,
        ...(status === 'takedown_sent' && { takedownSentAt: new Date() }),
        ...(status === 'resolved' && { resolvedAt: new Date() }),
      },
      { new: true }          // ← also fix this: use `new` not `returnDocument`
    ).populate('movie', 'title');

    if (!infringement) return res.status(404).json({ message: 'Infringement not found' });

    if (status === 'takedown_sent') {
      const user = await User.findById(req.user._id);
      await sendTakedownEmail({
        to: user.email,
        ownerName: user.name,
        movieTitle: infringement.movie?.title,
        youtubeVideoUrl: infringement.youtubeVideoUrl,
        youtubeChannel: infringement.youtubeChannel,
      }).catch((err) => console.error('Email error:', err.message));

      log(
        'takedown_sent',
        `Takedown sent for infringement on "${infringement.movie?.title}"`,
        req.user._id,
        { infringementId: infringement._id, youtubeVideoUrl: infringement.youtubeVideoUrl }
      );
    }

    res.json({ infringement });
  } catch (error) {
    console.error('PATCH infringement error:', error); // add this temporarily
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const Appeal = require('../models/Appeal');

// router.post('/appeals', protect, async (req, res) => {
//   try {
//     const { type, reason, movieId } = req.body;
//     if (!type || !reason) return res.status(400).json({ message: 'Type and reason required' });

//     const appeal = await Appeal.create({
//       user: req.user._id,
//       movie: movieId || null,
//       type,
//       reason,
//     });

//     res.status(201).json({ message: 'Appeal submitted', appeal });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// router.get('/appeals/mine', protect, async (req, res) => {
//   try {
//     const appeals = await Appeal.find({ user: req.user._id })
//       .populate('movie', 'title')
//       .sort({ createdAt: -1 });
//     res.json({ appeals });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

router.get('/analytics', protect, async (req, res) => {
  try {
    const Movie = require('../models/Movie');

    // infringements over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const infringementsByDay = await Infringement.aggregate([
      {
        $match: {
          owner: req.user._id,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // status breakdown
    const statusBreakdown = await Infringement.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // confidence breakdown
    const confidenceBreakdown = await Infringement.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: '$matchConfidence', count: { $sum: 1 } } },
    ]);

    // most pirated movies
    const mostPirated = await Movie.find({ owner: req.user._id })
      .sort({ infringementCount: -1 })
      .limit(5)
      .select('title infringementCount');

    // takedown success rate
    const total = await Infringement.countDocuments({ owner: req.user._id });
    const resolved = await Infringement.countDocuments({
      owner: req.user._id, status: 'resolved',
    });
    const successRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    res.json({
      infringementsByDay,
      statusBreakdown,
      confidenceBreakdown,
      mostPirated,
      successRate,
      total,
      resolved,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});




// replace protect with protectAll on appeal routes only
router.post('/appeals', protectAll, async (req, res) => {
  try {
    const { type, reason, movieId } = req.body;
    if (!type || !reason) return res.status(400).json({ message: 'Type and reason required' });
    if (reason.trim().length < 20) {
      return res.status(400).json({ message: 'Please provide more detail (minimum 20 characters)' });
    }

    // check if user already has a pending appeal of same type
    const existingAppeal = await Appeal.findOne({
      user: req.user._id,
      type,
      status: { $in: ['pending', 'under_review'] },
    });
    if (existingAppeal) {
      return res.status(400).json({
        message: 'You already have a pending appeal of this type. Please wait for a decision.',
      });
    }

    const appeal = await Appeal.create({
      user: req.user._id,
      movie: movieId || null,
      type,
      reason,
    });

    // notify admin
    const { log } = require('../services/activityService');
    log('appeal_submitted',
      `Appeal submitted by ${req.user.email}: ${type}`,
      req.user._id,
      { appealId: appeal._id, type }
    );

    res.status(201).json({ message: 'Appeal submitted', appeal });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/appeals/mine', protectAll, async (req, res) => {
  try {
    const appeals = await Appeal.find({ user: req.user._id })
      .populate('movie', 'title')
      .sort({ createdAt: -1 });
    res.json({ appeals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;