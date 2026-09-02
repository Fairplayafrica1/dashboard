const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Infringement = require('../models/Infringement');
const { sendVerificationApprovedEmail, sendVerificationRejectedEmail, sendAppealDecisionEmail } = require('../services/emailService');
const { log } = require('../services/activityService');

// get dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalMovies, totalInfringements, pendingVerifications, suspendedUsers] =
      await Promise.all([
        User.countDocuments(),
        Movie.countDocuments(),
        Infringement.countDocuments(),
        User.countDocuments({ verificationStatus: 'pending' }),
        User.countDocuments({ accountStatus: 'suspended' }),
      ]);

    res.json({ totalUsers, totalMovies, totalInfringements, pendingVerifications, suspendedUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// get all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { status, verification, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.accountStatus = status;
    if (verification) query.verificationStatus = verification;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// get user details with their movies
router.get('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const movies = await Movie.find({ owner: req.params.id });
    const infringements = await Infringement.countDocuments({ owner: req.params.id });
    res.json({ user, movies, infringementCount: infringements });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// approve ownership verification
router.patch('/users/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const { action, note } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be approve or reject' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: action === 'approve' ? 'verified' : 'rejected',
        verificationNote: note || '',
        ownershipVerified: action === 'approve',
      },
      { returnDocument: 'after' }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    // notify user of decision
    if (action === 'approve') {
      await sendVerificationApprovedEmail({ to: user.email, name: user.name })
        .catch((err) => console.error('Email error:', err.message));
    } else {
      await sendVerificationRejectedEmail({ to: user.email, name: user.name, note })
        .catch((err) => console.error('Email error:', err.message));
    }

    res.json({ message: `User ${action}d`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// suspend or unsuspend user
router.patch('/users/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ['active', 'suspended', 'banned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        accountStatus: status,
        suspensionReason: reason || '',
        ...(status === 'suspended' && { suspendedAt: new Date() }),
      },
      { returnDocument: 'after' }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    // log the action
    log(
      status === 'active' ? 'account_reinstated' : status === 'suspended' ? 'account_suspended' : 'account_banned',
      `Account ${status} by admin: ${user.email}`,
      user._id,
      { reason, adminId: req.user._id }
    );

    // notify user in real-time
    const { notifyUser } = require('../services/notificationService');
    await notifyUser(req.app, user._id.toString(), 'account_status_changed', {
      type: 'account',
      title: status === 'active'
        ? 'Account Reinstated'
        : status === 'suspended'
        ? 'Account Suspended'
        : 'Account Banned',
      message: status === 'active'
        ? 'Your account has been reinstated. Welcome back.'
        : status === 'suspended'
        ? `Your account has been suspended. Reason: ${reason || 'Policy violation'}`
        : 'Your account has been permanently banned.',
      metadata: { status, reason },
    });

    res.json({ message: `Account ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// get all movies with owner info
router.get('/movies', protect, adminOnly, async (req, res) => {
  try {
    const movies = await Movie.find()
      .populate('owner', 'name email accountStatus verificationStatus')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ movies });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// AI assist — analyze ownership evidence
router.post('/users/:id/ai-review', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const movies = await Movie.find({ owner: req.params.id });

    // AI scoring based on available signals
    const signals = [];
    let score = 0;

    // signal 1 — legal declaration completed
    const declaredMovies = movies.filter((m) => m.legalDeclaration?.agreed);
    if (declaredMovies.length > 0) { score += 20; signals.push({ signal: 'Legal declaration signed', weight: '+20', status: 'pass' }); }
    else { signals.push({ signal: 'No legal declaration', weight: '0', status: 'fail' }); }

    // signal 2 — ownership evidence uploaded
    const evidenceMovies = movies.filter((m) => m.ownershipEvidence?.fileUrl);
    if (evidenceMovies.length > 0) { score += 30; signals.push({ signal: 'Ownership evidence uploaded', weight: '+30', status: 'pass' }); }
    else { signals.push({ signal: 'No ownership evidence', weight: '0', status: 'warn' }); }

    // signal 3 — watermark applied
    const watermarkedMovies = movies.filter((m) => m.watermarkStatus === 'ready');
    if (watermarkedMovies.length > 0) { score += 25; signals.push({ signal: 'Watermark applied to content', weight: '+25', status: 'pass' }); }
    else { signals.push({ signal: 'No watermark applied', weight: '0', status: 'warn' }); }

    // signal 4 — no fraud flags
    if (user.fraudFlags === 0) { score += 15; signals.push({ signal: 'No fraud flags on account', weight: '+15', status: 'pass' }); }
    else { score -= user.fraudFlags * 20; signals.push({ signal: `${user.fraudFlags} fraud flag(s)`, weight: `-${user.fraudFlags * 20}`, status: 'fail' }); }

    // signal 5 — account age
    const accountAgeDays = Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    if (accountAgeDays > 7) { score += 10; signals.push({ signal: `Account ${accountAgeDays} days old`, weight: '+10', status: 'pass' }); }
    else { signals.push({ signal: 'New account (less than 7 days)', weight: '0', status: 'warn' }); }

    score = Math.max(0, Math.min(100, score));

    const recommendation = score >= 70 ? 'approve' : score >= 40 ? 'manual_review' : 'reject';
    const confidence = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

    res.json({
      score,
      recommendation,
      confidence,
      signals,
      summary: recommendation === 'approve'
        ? 'User shows strong ownership signals. Safe to approve.'
        : recommendation === 'manual_review'
        ? 'Mixed signals detected. Human review recommended before approving.'
        : 'Insufficient evidence or fraud flags detected. Recommend rejection.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// const Infringement = require('../models/Infringement');

// ── INFRINGEMENTS ──────────────────────────────────────────
router.get('/infringements', protect, adminOnly, async (req, res) => {
  try {
    const { status, confidence, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (confidence) query.matchConfidence = confidence;

    const infringements = await Infringement.find(query)
      .populate('movie', 'title thumbnailUrl ownerCode')
      .populate('owner', 'name email accountStatus')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Infringement.countDocuments(query);
    res.json({ infringements, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/infringements/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const infringement = await Infringement.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'resolved' && { resolvedAt: new Date() }) },
      { returnDocument: 'after' }
    );
    if (!infringement) return res.status(404).json({ message: 'Not found' });
    res.json({ infringement });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ── ACTIVITY LOG ───────────────────────────────────────────
const ActivityLog = require('../models/ActivityLog');

router.get('/logs', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 30, type } = req.query;
    const query = type ? { type } : {};
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await ActivityLog.countDocuments(query);
    res.json({ logs, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ── SCAN MANAGEMENT ────────────────────────────────────────
router.post('/scan/all', protect, adminOnly, async (req, res) => {
  try {
    const { scanAllMovies } = require('../services/scanService');
    res.json({ message: 'Scan started for all movies' });
    scanAllMovies(req.app).catch((err) => console.error('Admin scan error:', err.message));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/scan/user/:userId', protect, adminOnly, async (req, res) => {
  try {
    const { scanMovie } = require('../services/scanService');
    const movies = await Movie.find({ owner: req.params.userId });
    res.json({ message: `Scan started for ${movies.length} movies` });
    for (const movie of movies) {
      await scanMovie(movie._id, req.app).catch((err) =>
        console.error(`Scan error for ${movie.title}:`, err.message)
      );
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ── ANNOUNCEMENTS ──────────────────────────────────────────
const Announcement = require('../models/Announcement');

router.get('/announcements', protect, adminOnly, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ announcements });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// router.post('/announcements', protect, adminOnly, async (req, res) => {
//   try {
//     const { title, message, type } = req.body;
//     if (!title || !message) return res.status(400).json({ message: 'Title and message required' });
//     const announcement = await Announcement.create({
//       title, message, type: type || 'info', createdBy: req.user._id,
//     });

//     // broadcast to all connected users via socket
//     req.app.get('io').emit('announcement', { title, message, type: type || 'info' });

//     res.status(201).json({ announcement });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

router.post('/announcements', protect, adminOnly, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message required' });

    const announcement = await Announcement.create({
      title, message, type: type || 'info', createdBy: req.user._id,
    });

    // get all user IDs to persist notification for each
    const users = await User.find({ accountStatus: 'active' }).select('_id');
    const userIds = users.map((u) => u._id);

    const { broadcastAnnouncement } = require('../services/notificationService');
    await broadcastAnnouncement(req.app, announcement, userIds);

    res.status(201).json({ announcement });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/announcements/:id', protect, adminOnly, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ── APPEALS ────────────────────────────────────────────────
const Appeal = require('../models/Appeal');

router.get('/appeals', protect, adminOnly, async (req, res) => {
  try {
    const appeals = await Appeal.find()
      .populate('user', 'name email accountStatus fraudFlags')
      .populate('movie', 'title ownerCode')
      .sort({ createdAt: -1 });
    res.json({ appeals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// router.patch('/appeals/:id', protect, adminOnly, async (req, res) => {
//   try {
//     const { status, adminNote } = req.body;
//     const appeal = await Appeal.findByIdAndUpdate(
//       req.params.id,
//       { status, adminNote, reviewedAt: new Date(), reviewedBy: req.user._id },
//       { returnDocument: 'after' }
//     ).populate('user', 'name email');

//     if (!appeal) return res.status(404).json({ message: 'Appeal not found' });

//     // if approved — reinstate user
//     if (status === 'approved') {
//       await User.findByIdAndUpdate(appeal.user._id, {
//         accountStatus: 'active',
//         fraudFlags: 0,
//         suspensionReason: '',
//       });
//     }

//     res.json({ appeal });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });


router.patch('/appeals/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const appeal = await Appeal.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote: adminNote || '',
        reviewedAt: new Date(),
        reviewedBy: req.user._id,
      },
      { returnDocument: 'after' }
    ).populate('user', 'name email accountStatus');

    if (!appeal) return res.status(404).json({ message: 'Appeal not found' });

    // if approved — reinstate user account
    if (status === 'approved') {
      await User.findByIdAndUpdate(appeal.user._id, {
        accountStatus: 'active',
        fraudFlags: 0,
        suspensionReason: '',
      });

      // notify via socket — user gets live unblocked
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      const socketId = connectedUsers?.get(appeal.user._id.toString());
      if (socketId) {
        io.to(socketId).emit('account_status_changed', {
          status: 'active',
          reason: 'Your appeal has been approved',
        });
      }

      // persist notification
      const { notifyUser } = require('../services/notificationService');
      await notifyUser(req.app, appeal.user._id.toString(), 'account_status_changed', {
        type: 'account',
        title: 'Appeal Approved — Account Reinstated',
        message: 'Your appeal was successful. Your account has been fully reinstated.',
        metadata: { appealId: appeal._id },
      });
    }

    // send decision email to user
    await sendAppealDecisionEmail({
      to: appeal.user.email,
      name: appeal.user.name,
      status,
      adminNote: adminNote || '',
      appealType: appeal.type,
    }).catch((err) => console.error('Appeal email error:', err.message));

    log(
      status === 'approved' ? 'appeal_approved' : 'appeal_rejected',
      `Appeal ${status} for ${appeal.user.email}`,
      appeal.user._id,
      { appealId: appeal._id, adminNote }
    );

    res.json({ appeal });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ── EXPORT ─────────────────────────────────────────────────
router.get('/export/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    const csv = [
      'Name,Email,Plan,Status,Verification,Fraud Flags,Joined',
      ...users.map((u) =>
        `"${u.name}","${u.email}","${u.plan}","${u.accountStatus}","${u.verificationStatus}","${u.fraudFlags}","${new Date(u.createdAt).toLocaleDateString()}"`
      ),
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fairplayafrica_users.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/export/infringements', protect, adminOnly, async (req, res) => {
  try {
    const infringements = await Infringement.find()
      .populate('movie', 'title')
      .populate('owner', 'name email')
      .lean();
    const csv = [
      'Movie,Owner,YouTube Title,Channel,Confidence,Status,Detected',
      ...infringements.map((i) =>
        `"${i.movie?.title}","${i.owner?.name}","${i.youtubeTitle}","${i.youtubeChannel}","${i.matchConfidence}","${i.status}","${new Date(i.createdAt).toLocaleDateString()}"`
      ),
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fairplayafrica_infringements.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;