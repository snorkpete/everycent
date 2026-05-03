import axios from 'axios';
import {
  attachAuthHeaders,
  saveAuthHeaders,
  startLoading,
  finishLoadingOnSuccess,
  finishLoadingOnError,
  handle401,
} from './interceptors';

const BASE_URL = import.meta.env.PROD
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000');

const apiGateway = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiGateway.interceptors.request.use(attachAuthHeaders);
apiGateway.interceptors.request.use(startLoading);

apiGateway.interceptors.response.use(saveAuthHeaders);

// Finishes loading indicator, then delegates to handle401.
// Both functions reject, so the caller always receives the original error.
function handleResponseError(error: unknown) {
  return finishLoadingOnError(error).catch(handle401);
}

apiGateway.interceptors.response.use(finishLoadingOnSuccess, handleResponseError);

export default apiGateway;
