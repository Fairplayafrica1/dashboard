const ActivityLog = require('../models/ActivityLog');

const log = async (type, description, userId = null, metadata = {}, ipAddress = '') => {
  try {
    await ActivityLog.create({ type, description, user: userId, metadata, ipAddress });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
};

module.exports = { log };