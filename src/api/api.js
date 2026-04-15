import axios from 'axios';

const api = axios.create({
  baseURL: 'https://educational-platform-backend-o7c3.onrender.com', // без слеша в конце
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;