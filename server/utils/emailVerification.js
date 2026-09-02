const crypto = require('crypto');

const VERIFICATION_TOKEN_TTL_MS = 72 * 60 * 60 * 1000;

const hashVerificationToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const createVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');

  return {
    token,
    tokenHash: hashVerificationToken(token),
    expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
  };
};

module.exports = {
  createVerificationToken,
  hashVerificationToken,
};
