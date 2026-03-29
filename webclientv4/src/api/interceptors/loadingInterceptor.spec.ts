import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { AxiosHeaders, type AxiosResponse } from 'axios';
import { useLoadingIndicatorStore } from '../../app/loading/loadingIndicatorStore';
import { startLoading, finishLoadingOnSuccess, finishLoadingOnError } from './loadingInterceptor';

describe('loadingInterceptor', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('startLoading', () => {
    it('increments the loading counter', () => {
      const store = useLoadingIndicatorStore();
      expect(store.isLoading).toBe(false);

      const config = { headers: new AxiosHeaders() };
      startLoading(config);

      expect(store.isLoading).toBe(true);
    });

    it('returns the config object', () => {
      const config = { headers: new AxiosHeaders() };
      const result = startLoading(config);
      expect(result).toBe(config);
    });
  });

  describe('finishLoadingOnSuccess', () => {
    it('decrements the loading counter', () => {
      const store = useLoadingIndicatorStore();
      store.startRequest();
      expect(store.isLoading).toBe(true);

      const response = {
        headers: {},
        data: {},
        status: 200,
        statusText: 'OK',
        config: {},
      } as unknown as AxiosResponse;

      finishLoadingOnSuccess(response);

      expect(store.isLoading).toBe(false);
    });

    it('returns the response unchanged', () => {
      const response = {
        headers: {},
        data: { foo: 'bar' },
        status: 200,
        statusText: 'OK',
        config: {},
      } as unknown as AxiosResponse;

      const result = finishLoadingOnSuccess(response);
      expect(result).toBe(response);
    });
  });

  describe('finishLoadingOnError', () => {
    it('decrements the loading counter', async () => {
      const store = useLoadingIndicatorStore();
      store.startRequest();
      expect(store.isLoading).toBe(true);

      await finishLoadingOnError(new Error('fail')).catch(() => {});

      expect(store.isLoading).toBe(false);
    });

    it('rejects with the original error', async () => {
      const error = new Error('network error');

      await expect(finishLoadingOnError(error)).rejects.toBe(error);
    });
  });
});
