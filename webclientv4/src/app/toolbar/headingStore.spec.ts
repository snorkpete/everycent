import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHeadingStore } from './headingStore';

describe('headingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts with an empty heading', () => {
    const store = useHeadingStore();

    expect(store.heading).toBe('');
  });

  it('updates the heading', () => {
    const store = useHeadingStore();
    const newHeading = 'Current Budget';

    store.setHeading(newHeading);

    expect(store.heading).toBe(newHeading);
  });

  it('can clear the heading by setting it to empty string', () => {
    const store = useHeadingStore();
    store.setHeading('Some Page');

    store.setHeading('');

    expect(store.heading).toBe('');
  });
});
