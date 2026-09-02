import api from './axios';

export const scanMovie = (id) => api.post(`/scan/movie/${id}`);
export const getInfringements = () => api.get('/scan/infringements');
export const getMovieInfringements = (id) => api.get(`/scan/infringements/movie/${id}`);
export const updateInfringementStatus = (id, status) => api.patch(`/scan/infringements/${id}`, { status });

export const getMyAppeals = () => api.get('/scan/appeals/mine');
export const submitAppeal = (data) => api.post('/scan/appeals', data);
export const getAnalytics = () => api.get('/scan/analytics');