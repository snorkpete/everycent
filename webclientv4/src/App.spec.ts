import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import App from './App.vue';
import { useAuthStore } from './auth/authStore';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('./auth/authApi', () => ({
  authApi: {
    signIn: vi.fn(),
    validateToken: vi.fn(),
    signOut: vi.fn(),
  },
}));

describe('App', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  function mountApp(loggedIn = false) {
    const authStore = useAuthStore();
    authStore.loggedIn = loggedIn;

    return mount(App, {
      global: {
        plugins: [pinia, [PrimeVue, { theme: { preset: Aura } }]],
        stubs: {
          RouterView: { template: '<div class="router-view" />' },
          MenuSidebar: { template: '<div data-testid="menu-sidebar" />' },
          Toast: { template: '<div />' },
        },
      },
    });
  }

  it('shows the page header when logged in', () => {
    const wrapper = mountApp(true);

    expect(wrapper.find('[data-testid="page-header"]').exists()).toBe(true);
  });

  it('hides the page header when not logged in', () => {
    const wrapper = mountApp(false);

    expect(wrapper.find('[data-testid="page-header"]').exists()).toBe(false);
  });

  it('renders the menu sidebar when logged in', () => {
    const wrapper = mountApp(true);

    expect(wrapper.find('[data-testid="menu-sidebar"]').exists()).toBe(true);
  });

  it('hides menu sidebar when not logged in', () => {
    const wrapper = mountApp(false);

    expect(wrapper.find('[data-testid="menu-sidebar"]').exists()).toBe(false);
  });

  it('always renders the loading indicator', () => {
    const wrapper = mountApp(false);

    expect(wrapper.findComponent({ name: 'LoadingIndicator' }).exists()).toBe(true);
  });

  it('always renders router-view', () => {
    const wrapper = mountApp(false);

    expect(wrapper.find('.router-view').exists()).toBe(true);
  });
});
