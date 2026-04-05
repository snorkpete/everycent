import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import HomePage from './HomePage.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { homeApi } from './homeApi';

vi.mock('./homeApi', () => ({
  homeApi: {
    getLastTransactionDate: vi.fn(),
  },
}));

function createWrapper(): VueWrapper {
  return mount(HomePage);
}

describe('HomePage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    vi.mocked(homeApi.getLastTransactionDate).mockResolvedValue('2026-04-03');
  });

  it('sets the heading to "Home" on mount', async () => {
    createWrapper();
    await flushPromises();

    const headingStore = useHeadingStore();
    expect(headingStore.heading).toBe('Home');
  });

  it('calls homeApi.getLastTransactionDate on mount', async () => {
    createWrapper();
    await flushPromises();

    expect(homeApi.getLastTransactionDate).toHaveBeenCalled();
  });

  it('renders the WhatsNew component', async () => {
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.find('[data-testid="whats-new-heading"]').exists()).toBe(true);
  });

  describe('last-transaction indicator', () => {
    it('shows the formatted date and a relative time when a transaction date is returned', async () => {
      vi.mocked(homeApi.getLastTransactionDate).mockResolvedValue('2026-04-03');
      const wrapper = createWrapper();
      await flushPromises();

      const indicator = wrapper.find('[data-testid="last-transaction"]');
      expect(indicator.exists()).toBe(true);
      // Formatted date "3 Apr 2026" is always shown; relative time is appended
      // in parentheses. We assert on the date portion since the relative time
      // is computed against the current date.
      expect(indicator.text()).toContain('3 Apr 2026');
    });

    it('shows an empty state when no transactions have been entered', async () => {
      vi.mocked(homeApi.getLastTransactionDate).mockResolvedValue(null);
      const wrapper = createWrapper();
      await flushPromises();

      const indicator = wrapper.find('[data-testid="last-transaction"]');
      expect(indicator.exists()).toBe(true);
      expect(indicator.text()).toContain('No transactions entered yet');
    });

    it('hides the indicator while the API call is in flight', () => {
      vi.mocked(homeApi.getLastTransactionDate).mockImplementation(() => new Promise(() => {}));
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="last-transaction"]').exists()).toBe(false);
    });

    it('hides the indicator when the API call fails', async () => {
      vi.mocked(homeApi.getLastTransactionDate).mockRejectedValue(new Error('Network down'));
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="last-transaction"]').exists()).toBe(false);
    });
  });
});
