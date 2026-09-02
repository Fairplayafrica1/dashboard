const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect, protectAll } = require('../middleware/auth');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { sendVerificationEmail } = require('../services/emailService');
const {
  createVerificationToken,
  hashVerificationToken,
} = require('../utils/emailVerification');
router.get('/test-email', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.verify();
    res.json({ message: 'Email connection successful' });
  } catch (error) {
    res.status(500).json({ message: 'Email connection failed', error: error.message });
  }
});

// get active announcements for users
router.get('/announcements', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ announcements });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// get my notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unread = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ notifications, unread });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// mark all read
router.patch('/notifications/read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// mark one read
router.patch('/notifications/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true }
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// update profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email required' });

    const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { returnDocument: 'after' }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// update password
router.patch('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both fields required' });

    // fetch raw document — toJSON won't strip password here
    const user = await User.findById(req.user._id).lean();
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.user._id, { password: hashed });

    res.json({ message: 'Password updated' });
  } catch (error) {
    console.error('PASSWORD ROUTE ERROR:', error); // ← add this
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// router.get('/verify-email', async (req, res) => {
//   try {
//     const { token } = req.query;
//     if (!token) return res.status(400).json({ message: 'Verification token required' });

//     const user = await User.findOne({
//       emailVerificationToken: token,
//       emailVerificationExpiry: { $gt: new Date() },
//     });

//     if (!user) {
//       return res.status(400).json({
//         message: 'This verification link is invalid or has expired. Please request a new one.',
//         code: 'TOKEN_EXPIRED',
//       });
//     }

//     await User.findByIdAndUpdate(user._id, {
//       isVerified: true,
//       emailVerificationToken: '',
//       emailVerificationExpiry: null,
//       verificationStatus: 'verified',
//     });

//     res.json({ message: 'Email verified successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// resend verification email

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Verification token required' });

    const cleanToken = token.trim();
    const tokenHash = hashVerificationToken(cleanToken);

    const user = await User.findOne({
      $or: [
        { emailVerificationTokenHash: tokenHash },
        // Temporary migration path for links issued before token hashing existed.
        { emailVerificationToken: cleanToken },
      ],
    });

    if (!user) {
      return res.status(400).json({
        message: 'This verification link is invalid. Please request a new one.',
        code: 'TOKEN_INVALID',
      });
    }

    // check expiry separately so we can give accurate error
    if (user.emailVerificationExpiry && new Date() > new Date(user.emailVerificationExpiry)) {
      return res.status(400).json({
        message: 'This verification link has expired. Please request a new one.',
        code: 'TOKEN_EXPIRED',
      });
    }

    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      emailVerificationToken: '',
      emailVerificationTokenHash: '',
      emailVerificationExpiry: null,
      verificationStatus: 'verified',
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/resend-verification', protectAll, async (req, res) => {
  try {
    if (req.user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const {
      token: verificationToken,
      tokenHash: verificationTokenHash,
      expiresAt: verificationExpiry,
    } = createVerificationToken();

    await User.findByIdAndUpdate(req.user._id, {
      emailVerificationToken: '',
      emailVerificationTokenHash: verificationTokenHash,
      emailVerificationExpiry: verificationExpiry,
    });

    await sendVerificationEmail({
      to: req.user.email,
      name: req.user.name,
      token: verificationToken,
    });

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('RESEND VERIFICATION ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
