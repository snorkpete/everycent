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
export function attachAuthHeaders(config: InternalAxiosRequestConfig) {
  for (const key of AUTH_HEADER_KEYS) {
    const value = localStorage.getItem(key);
    if (value) {
      config.headers[key] = value;
    }
  }
  return config;
}

// Capture auth tokens from responses and save to localStorage
export function saveAuthHeaders(response: AxiosResponse) {
  for (const key of AUTH_HEADER_KEYS) {
    const value = response.headers[key];
    if (value) {
      localStorage.setItem(key, value);
    }
  }
  return response;
}

apiGateway.interceptors.request.use(attachAuthHeaders);
apiGateway.interceptors.response.use(saveAuthHeaders);

export default apiGateway;
