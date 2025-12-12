// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8090',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');  // ← ДОЛЖНО БЫТЬ jwtToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token sent:', token.substring(0, 20) + '...');
  } else {
    console.log('No token found!');
  }
  return config;
});

export default api;