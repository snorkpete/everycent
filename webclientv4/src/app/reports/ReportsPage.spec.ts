import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import { createRouter, createWebHashHistory } from 'vue-router';
import ReportsPage from './ReportsPage.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/reports', component: ReportsPage },
    { path: '/reports/net-worth', component: { template: '<div />' } },
    { path: '/reports/category-spending', component: { template: '<div />' } },
    { path: '/reports/needs-vs-wants', component: { template: '<div />' } },
  ],
});

const mockSetHeading = vi.fn();
vi.mock('../toolbar/headingStore', () => ({
  useHeadingStore: () => ({ setHeading: mockSetHeading }),
}));

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(ReportsPage, {
    global: {
      plugins: [PrimeVue, pinia, router],
    },
  });
}

describe('ReportsPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
  });

  describe('on mount', () => {
    it('sets the page heading to "Reports"', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(mockSetHeading).toHaveBeenCalledWith('Reports');
    });
  });

  describe('navigation links', () => {
    it('renders a link to the Net Worth report', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="net-worth-link"]').exists()).toBe(true);
    });

    it('renders a link to the Category Spending report', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="category-spending-link"]').exists()).toBe(true);
    });

    it('renders a link to the Needs vs Wants report', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="needs-vs-wants-link"]').exists()).toBe(true);
    });
  });
});
