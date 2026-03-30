import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import { ref, reactive, nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import MenuSidebar from './MenuSidebar.vue';
import { useAuthStore } from '../../auth/authStore';

const mockPush = vi.fn();
const mockRoute = reactive({ path: '/' });
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => mockRoute,
}));

vi.mock('../../auth/authApi', () => ({
  authApi: {
    signIn: vi.fn(),
    validateToken: vi.fn(),
    signOut: vi.fn(),
  },
}));

const isDesktop = ref(true);
vi.mock('@vueuse/core', () => ({
  useBreakpoints: () => ({
    greaterOrEqual: () => isDesktop,
  }),
  breakpointsPrimeFlex: {},
}));

describe('MenuSidebar', () => {
  let pinia: Pinia;
  let wrapper: VueWrapper;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    mockPush.mockReset();
    mockRoute.path = '/';
  });

  afterEach(() => {
    wrapper?.unmount();
    document.body.innerHTML = '';
  });

  function createWrapper() {
    wrapper = mount(MenuSidebar, {
      attachTo: document.body,
      global: {
        plugins: [pinia, [PrimeVue, { theme: { preset: Aura } }]],
        stubs: { RouterLink: { template: '<a><slot /></a>' } },
      },
    });
    return wrapper;
  }

  describe('desktop (≥992px)', () => {
    beforeEach(() => {
      isDesktop.value = true;
    });

    it('renders a static sidebar', () => {
      createWrapper();

      expect(wrapper.find('[data-testid="desktop-sidebar"]').exists()).toBe(true);
    });

    it('does not render the mobile drawer or toggle', () => {
      createWrapper();

      expect(wrapper.find('[data-testid="menu-toggle"]').exists()).toBe(false);
      expect(document.querySelector('[data-testid="mobile-drawer"]')).toBeNull();
    });

    it('renders the EveryCent brand header', () => {
      createWrapper();

      expect(wrapper.find('[data-testid="desktop-sidebar"]').text()).toContain('EveryCent');
    });

    it('renders menu items', () => {
      createWrapper();

      expect(wrapper.text()).toContain('Home');
      expect(wrapper.text()).toContain('Reports');
      expect(wrapper.text()).toContain('Setup');
      expect(wrapper.text()).toContain('Log Out');
    });

    it('calls logOut and navigates to /login when Log Out is clicked', async () => {
      const authStore = useAuthStore();
      const logOutSpy = vi.spyOn(authStore, 'logOut');

      createWrapper();

      const links = wrapper.findAll('.p-panelmenu-header-link');
      const logoutLink = links.find((link) => link.text().includes('Log Out'));
      expect(logoutLink).toBeDefined();
      await logoutLink!.trigger('click');

      expect(logOutSpy).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('active menu and auto-expand', () => {
    beforeEach(() => {
      isDesktop.value = true;
    });

    function setupHeader() {
      const headers = wrapper.findAll('.p-panelmenu-header');
      return headers.find((h) => h.text().includes('Setup'));
    }

    it('auto-expands the Setup section when mounted on a setup route', () => {
      mockRoute.path = '/setup/institutions';
      createWrapper();

      expect(setupHeader()!.attributes('aria-expanded')).toBe('true');
    });

    it('does not auto-expand Setup when mounted on a non-setup route', () => {
      mockRoute.path = '/';
      createWrapper();

      // PrimeVue omits aria-expanded entirely when the panel is collapsed (undefined = not expanded)
      expect(setupHeader()!.attributes('aria-expanded')).toBeUndefined();
    });

    it('expands the Setup section when navigating to a setup route', async () => {
      mockRoute.path = '/';
      createWrapper();
      expect(setupHeader()!.attributes('aria-expanded')).toBeUndefined(); // collapsed = attribute absent

      mockRoute.path = '/setup/bank-accounts';
      await nextTick();

      expect(setupHeader()!.attributes('aria-expanded')).toBe('true');
    });
  });

  describe('mobile (<992px)', () => {
    beforeEach(() => {
      isDesktop.value = false;
    });

    it('does not render the static sidebar', () => {
      createWrapper();

      expect(wrapper.find('[data-testid="desktop-sidebar"]').exists()).toBe(false);
    });

    it('renders the hamburger toggle', () => {
      createWrapper();

      expect(wrapper.find('[data-testid="menu-toggle"]').exists()).toBe(true);
    });

    it('opens the drawer when hamburger is clicked', async () => {
      createWrapper();

      await wrapper.find('[data-testid="menu-toggle"]').trigger('click');
      await nextTick();
      await flushPromises();

      expect(document.body.textContent).toContain('Home');
      expect(document.body.textContent).toContain('Reports');
    });
  });
});
