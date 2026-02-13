import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HomePage from './HomePage.vue';

describe('HomePage', () => {
  it('renders welcome message', () => {
    const wrapper = mount(HomePage);

    expect(wrapper.find('[data-testid="welcome-heading"]').text()).toBe(
      'Welcome to EveryCent',
    );
    expect(wrapper.find('[data-testid="welcome-message"]').text()).toBe(
      'Your zero-based budget manager.',
    );
  });
});
