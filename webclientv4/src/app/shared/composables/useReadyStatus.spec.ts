import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useReadyStatus } from './useReadyStatus';

function setup({ loading = false, error = null as string | null } = {}) {
  const loadingRef = ref(loading);
  const errorRef = ref(error);
  const ready = useReadyStatus({ loading: loadingRef, error: errorRef });
  return { loading: loadingRef, error: errorRef, ready };
}

describe('useReadyStatus', () => {
  it('returns true when loading is false and error is null', () => {
    const { ready } = setup({ loading: false, error: null });

    expect(ready.value).toBe(true);
  });

  it('returns false when loading is true and error is null', () => {
    const { ready } = setup({ loading: true, error: null });

    expect(ready.value).toBe(false);
  });

  it('returns false when loading is false and error is set', () => {
    const { ready } = setup({ loading: false, error: 'oops' });

    expect(ready.value).toBe(false);
  });

  it('returns false when loading is true and error is set', () => {
    const { ready } = setup({ loading: true, error: 'oops' });

    expect(ready.value).toBe(false);
  });

  it('becomes false reactively when loading is set to true', () => {
    const { loading, ready } = setup({ loading: false, error: null });
    expect(ready.value).toBe(true);

    loading.value = true;

    expect(ready.value).toBe(false);
  });

  it('becomes false reactively when error is set', () => {
    const { error, ready } = setup({ loading: false, error: null });
    expect(ready.value).toBe(true);

    error.value = 'x';

    expect(ready.value).toBe(false);
  });
});
