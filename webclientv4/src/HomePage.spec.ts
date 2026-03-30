import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';
import HomePage from './HomePage.vue';
import { useHeadingStore } from './app/toolbar/headingStore';

describe('HomePage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  function createWrapper() {
    return mount(HomePage, {
      global: {
        plugins: [pinia],
      },
    });
  }

  it('renders welcome message', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('[data-testid="welcome-heading"]').text()).toBe('Welcome to EveryCent');
    expect(wrapper.find('[data-testid="welcome-message"]').text()).toBe(
      'Your zero-based budget manager.',
    );
  });

  it('sets the heading to Home on mount', () => {
    const headingStore = useHeadingStore();

    createWrapper();

    expect(headingStore.heading).toBe('Home');
  });
});
