import axios from "axios";

export const API_BASE_URL = 'http://localhost:3001/backend_api';
// export const API_BASE_URL = 'https://www.crecemos.com.pe/backend_api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para agregar el token en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token inválido o expirado, redirigir al login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/intranet';
    }
    return Promise.reject(error);
  }
);

export default api;
