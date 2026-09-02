const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'Please fill in all fields' });
//     }

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'Email already registered' });
//     }

//     const user = await User.create({ name, email, password });
//     const token = generateToken(user._id);

//     res.status(201).json({ token, user });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const { sendWelcomeEmail } = require('../services/emailService');
const { log } = require('../services/activityService');



// const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'Please fill in all fields' });
//     }

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'Email already registered' });
//     }

//     const user = await User.create({ name, email, password });
//     const token = generateToken(user._id);

//     // send welcome email async — don't block registration
//     sendWelcomeEmail({ to: user.email, name: user.name })
    
//       .catch((err) => console.error('Welcome email error:', err.message));

//     res.status(201).json({ token, user });
//   } catch (error) {
//     console.error('FULL ERROR:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
//   log('user_registered', `New user registered: ${user.email}`, user._id, { plan: user.plan });
// };

const {  sendVerificationEmail } = require('../services/emailService');

const { createVerificationToken } = require('../utils/emailVerification');





const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // simple random token — no JWT expiry issues
    const {
      token: verificationToken,
      tokenHash: verificationTokenHash,
      expiresAt: verificationExpiry,
    } = createVerificationToken();

    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken: '',
      emailVerificationTokenHash: verificationTokenHash,
      emailVerificationExpiry: verificationExpiry,
    });

    const token = generateToken(user._id);

    sendWelcomeEmail({ to: user.email, name: user.name }).catch(() => {});
    sendVerificationEmail({
      to: user.email,
      name: user.name,
      token: verificationToken,
    }).catch((err) => console.error('Verification email error:', err.message));

    log('user_registered', `New user: ${user.email}`, user._id).catch(() => {});

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    log('user_login', `User logged in: ${user.email}`, user._id).catch(() => {});
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};



module.exports = { register, login, getMe };
