const Notification = require('../models/Notification');

const notifyUser = async (app, userId, event, data) => {
  try {
    // persist to DB so user sees it on next login
    const notification = await Notification.create({
      user: userId,
      type: data.type || 'infringement',
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
    });

    // also emit real-time if user is online
    const io = app.get('io');
    const connectedUsers = app.get('connectedUsers');
    const socketId = connectedUsers?.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit(event, { ...data, notificationId: notification._id });
      console.log(`Notified user ${userId}: ${event}`);
    }

    return notification;
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

// broadcast announcement to all users and persist for each
const broadcastAnnouncement = async (app, announcement, userIds) => {
  try {
    // persist for every user
    await Notification.insertMany(
      userIds.map((userId) => ({
        user: userId,
        type: 'announcement',
        title: announcement.title,
        message: announcement.message,
        metadata: { announcementType: announcement.type, announcementId: announcement._id },
      }))
    );

    // emit real-time to all connected users
    const io = app.get('io');
    io.emit('announcement', {
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
    });

    console.log(`Announcement broadcast to ${userIds.length} users`);
  } catch (error) {
    console.error('Broadcast error:', error.message);
  }
};

module.exports = { notifyUser, broadcastAnnouncement };