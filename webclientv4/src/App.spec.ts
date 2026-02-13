import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';
import App from './App.vue';
import { useAuthStore } from './auth/authStore';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
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
    mockPush.mockReset();
  });

  function mountApp(loggedIn = false) {
    const store = useAuthStore();
    store.loggedIn = loggedIn;

    return mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: { template: '<div class="router-view" />' },
        },
      },
    });
  }

  it('shows header when logged in', () => {
    const wrapper = mountApp(true);

    expect(wrapper.find('[data-testid="top-bar"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="app-title"]').text()).toBe('EveryCent');
  });

  it('hides header when not logged in', () => {
    const wrapper = mountApp(false);

    expect(wrapper.find('[data-testid="top-bar"]').exists()).toBe(false);
  });

  it('shows Old Version link pointing to Angular app', () => {
    const wrapper = mountApp(true);
    const link = wrapper.find('[data-testid="old-version-link"]');

    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('/#/');
    expect(link.text()).toBe('Old Version');
  });

  it('calls logOut and navigates to /login on logout click', async () => {
    const store = useAuthStore();
    const wrapper = mountApp(true);

    await wrapper.find('[data-testid="logout-button"]').trigger('click');

    expect(store.loggedIn).toBe(false);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('always renders router-view', () => {
    const wrapper = mountApp(false);

    expect(wrapper.find('.router-view').exists()).toBe(true);
  });

  it('always renders the loading indicator', () => {
    const wrapper = mountApp(false);

    expect(
      wrapper.findComponent({ name: 'LoadingIndicator' }).exists(),
    ).toBe(true);
  });
});
