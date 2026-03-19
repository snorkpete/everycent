import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLoadingIndicatorStore } from './loadingIndicatorStore';

describe('loadingIndicatorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts with isLoading false', () => {
    const store = useLoadingIndicatorStore();

    expect(store.isLoading).toBe(false);
  });

  it('sets isLoading to true when a request starts', () => {
    const store = useLoadingIndicatorStore();

    store.startRequest();

    expect(store.isLoading).toBe(true);
  });

  it('sets isLoading to false when the only request finishes', () => {
    const store = useLoadingIndicatorStore();

    store.startRequest();
    store.finishRequest();

    expect(store.isLoading).toBe(false);
  });

  it('stays loading when concurrent requests are in flight', () => {
    const store = useLoadingIndicatorStore();

    store.startRequest();
    store.startRequest();
    store.finishRequest();

    expect(store.isLoading).toBe(true);
  });

  it('stops loading when all concurrent requests finish', () => {
    const store = useLoadingIndicatorStore();

    store.startRequest();
    store.startRequest();
    store.startRequest();
    store.finishRequest();
    store.finishRequest();
    store.finishRequest();

    expect(store.isLoading).toBe(false);
  });

  it('does not go below zero when finishRequest is called without a matching start', () => {
    const store = useLoadingIndicatorStore();

    store.finishRequest();
    store.finishRequest();

    expect(store.isLoading).toBe(false);
  });

  it('works correctly after counter bottoms out at zero', () => {
    const store = useLoadingIndicatorStore();

    store.finishRequest();
    store.startRequest();

    expect(store.isLoading).toBe(true);

    store.finishRequest();

    expect(store.isLoading).toBe(false);
  });
});