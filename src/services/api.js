import axios from "axios";

// export const API_BASE_URL = 'http://localhost:3001/backend_api';
export const API_BASE_URL = 'https://www.crecemos.com.pe/backend_api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export default api;
