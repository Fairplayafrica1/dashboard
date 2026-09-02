import api from './axios';

export const uploadMovie = (data) => api.post('/movies', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getMyMovies = () => api.get('/movies');
export const getMovie = (id) => api.get(`/movies/${id}`);
export const deleteMovie = (id) => api.delete(`/movies/${id}`);
export const saveDeclaration = (id, data) => api.post(`/movies/declaration/${id}`, data);
export const downloadWatermarked = (id) => api.post(`/movies/watermark/${id}`, {}, { responseType: 'blob' });
export const downloadCertificate = (id) =>
  api.get(`/movies/certificate/${id}`, { responseType: 'blob' });
export const uploadThumbnail = (id, data) => api.post(`/movies/thumbnail/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});