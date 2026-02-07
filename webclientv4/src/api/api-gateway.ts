import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { AUTH_HEADER_KEYS } from '../auth/auth.types';

const BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';

const apiGateway = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth tokens from localStorage to every request
apiGateway.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  for (const key of AUTH_HEADER_KEYS) {
    const value = localStorage.getItem(key);
    if (value) {
      config.headers[key] = value;
    }
  }
  return config;
});

// Capture auth tokens from responses and save to localStorage
apiGateway.interceptors.response.use((response: AxiosResponse) => {
  for (const key of AUTH_HEADER_KEYS) {
    const value = response.headers[key];
    if (value) {
      localStorage.setItem(key, value);
    }
  }
  return response;
});

export default apiGateway;
