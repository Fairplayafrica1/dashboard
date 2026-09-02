// import api from './axios';

// export const getAdminStats = () => api.get('/admin/stats');
// export const getAdminUsers = (params) => api.get('/admin/users', { params });
// export const getAdminUser = (id) => api.get(`/admin/users/${id}`);
// export const getAdminMovies = () => api.get('/admin/movies');
// export const verifyUser = (id, data) => api.patch(`/admin/users/${id}/verify`, data);
// export const updateUserStatus = (id, data) => api.patch(`/admin/users/${id}/status`, data);
// export const aiReviewUser = (id) => api.post(`/admin/users/${id}/ai-review`);


import api from './axios';

export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const getAdminUser = (id) => api.get(`/admin/users/${id}`);
export const getAdminMovies = () => api.get('/admin/movies');
export const getAdminInfringements = (params) => api.get('/admin/infringements', { params });
export const updateAdminInfringement = (id, data) => api.patch(`/admin/infringements/${id}`, data);
export const getActivityLogs = (params) => api.get('/admin/logs', { params });
export const getAnnouncements = () => api.get('/admin/announcements');
export const createAnnouncement = (data) => api.post('/admin/announcements', data);
export const deleteAnnouncement = (id) => api.delete(`/admin/announcements/${id}`);
export const getAppeals = () => api.get('/admin/appeals');
export const updateAppeal = (id, data) => api.patch(`/admin/appeals/${id}`, data);
export const triggerScanAll = () => api.post('/admin/scan/all');
export const triggerScanUser = (userId) => api.post(`/admin/scan/user/${userId}`);
export const verifyUser = (id, data) => api.patch(`/admin/users/${id}/verify`, data);
export const updateUserStatus = (id, data) => api.patch(`/admin/users/${id}/status`, data);
export const aiReviewUser = (id) => api.post(`/admin/users/${id}/ai-review`);
export const exportUsers = () => api.get('/admin/export/users', { responseType: 'blob' });
export const exportInfringements = () => api.get('/admin/export/infringements', { responseType: 'blob' });