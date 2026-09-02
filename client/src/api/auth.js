import api from './axios';

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const getNotifications = () => api.get('/auth/notifications');
export const markNotificationsRead = () => api.patch('/auth/notifications/read');
export const markNotificationRead = (id) => api.patch(`/auth/notifications/${id}/read`);
export const getAnnouncements = () => api.get('/auth/announcements');