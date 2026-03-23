import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { AUTH_HEADER_KEYS } from '../auth/auth.types';
import { useLoadingIndicatorStore } from '../app/loading/loadingIndicatorStore';

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
apiGateway.interceptors.request.use((config) => {
  useLoadingIndicatorStore().startRequest();
  return config;
});

export function handle401(error: unknown): Promise<never> {
  const status = (error as { response?: { status?: number } }).response?.status;
  if (status === 401 && window.location.hash !== '#/login') {
    for (const key of AUTH_HEADER_KEYS) {
      localStorage.removeItem(key);
    }
    window.location.replace('/#/login');
  }
  return Promise.reject(error);
}

apiGateway.interceptors.response.use(saveAuthHeaders);
apiGateway.interceptors.response.use(
  (response) => {
    useLoadingIndicatorStore().finishRequest();
    return response;
  },
  (error) => {
    useLoadingIndicatorStore().finishRequest();
    return handle401(error);
  },
);

export default apiGateway;
