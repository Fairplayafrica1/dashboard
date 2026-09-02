const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  isVerified: { type: Boolean, default: false },
  accountStatus: {
  type: String,
  enum: ['active', 'suspended', 'banned', 'pending_verification'],
  default: 'active',
},
emailVerificationToken: { type: String, default: '', select: false },
emailVerificationTokenHash: { type: String, default: '', select: false, index: true },
emailVerificationExpiry: { type: Date },
suspendedAt: { type: Date },
suspensionReason: { type: String, default: '' },
fraudFlags: { type: Number, default: 0 },
isAdmin: { type: Boolean, default: false },
verificationStatus: {
  type: String,
  enum: ['unverified', 'pending', 'verified', 'rejected'],
  default: 'unverified',
},
verificationNote: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   const user = await this.constructor.findById(this._id).select('+password').lean();
//   return await bcrypt.compare(enteredPassword, user.password);
// };

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationTokenHash;
  delete obj.emailVerificationExpiry;
  return obj;
};



module.exports = mongoose.model('User', userSchema);
