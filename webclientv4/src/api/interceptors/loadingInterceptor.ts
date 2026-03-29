import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useLoadingIndicatorStore } from '../../app/loading/loadingIndicatorStore';

export function startLoading(config: InternalAxiosRequestConfig) {
  useLoadingIndicatorStore().startRequest();
  return config;
}

export function finishLoadingOnSuccess(response: AxiosResponse) {
  useLoadingIndicatorStore().finishRequest();
  return response;
}

export function finishLoadingOnError(error: unknown): Promise<never> {
  useLoadingIndicatorStore().finishRequest();
  return Promise.reject(error);
}
