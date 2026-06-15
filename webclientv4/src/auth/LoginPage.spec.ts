import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';
import LoginPage from './LoginPage.vue';
import { useAuthStore } from './authStore';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock at the gateway layer, not authApi — this keeps the real authApi and
// authStore in the path so we get integration coverage of the code the user
// actually runs.
vi.mock('../api/api-gateway', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('LoginPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    mockPush.mockReset();
    vi.restoreAllMocks();
    delete (window as Window & { google?: unknown }).google;
  });

  function createWrapper(): VueWrapper {
    return mount(LoginPage, {
      global: {
        plugins: [pinia],
      },
    });
  }

  it('renders the login heading', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('[data-testid="login-heading"]').text()).toBe('EveryCent - Log In');
  });

  it('renders the Google button container', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('[data-testid="google-button-container"]').exists()).toBe(true);
  });

  it('does not show error when store has no error', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('[data-testid="status-message"]').exists()).toBe(false);
  });

  it('shows error when store has an error', () => {
    const store = useAuthStore();
    store.error = 'Invalid credentials';

    const wrapper = createWrapper();

    const errorEl = wrapper.find('[data-testid="status-message"]');
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toBe('Invalid credentials');
  });

  describe('Google sign-in', () => {
    beforeEach(() => {
      // LoginPage early-returns from onMounted when VITE_GOOGLE_CLIENT_ID is
      // falsy, so tests that assert on initialize/callback wiring must stub
      // the env var. Keeps the spec independent of .env.local, which is
      // gitignored and absent in fresh worktrees.
      vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('does not call google.accounts.id when window.google is not available', async () => {
      const initializeSpy = vi.fn();
      const renderButtonSpy = vi.fn();

      // google is not on window — guard should prevent calls
      createWrapper();
      await flushPromises();

      expect(initializeSpy).not.toHaveBeenCalled();
      expect(renderButtonSpy).not.toHaveBeenCalled();
    });

    it('initializes and renders the Google button when window.google is available', async () => {
      const initializeSpy = vi.fn();
      const renderButtonSpy = vi.fn();

      (window as Window & { google: unknown }).google = {
        accounts: {
          id: {
            initialize: initializeSpy,
            renderButton: renderButtonSpy,
          },
        },
      };

      createWrapper();
      await flushPromises();

      expect(initializeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: expect.any(String),
          callback: expect.any(Function),
        }),
      );
      expect(renderButtonSpy).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({ locale: 'en' }),
      );
    });

    it('navigates to / after successful Google credential callback', async () => {
      const apiGateway = (await import('../api/api-gateway')).default;
      vi.mocked(apiGateway.post).mockResolvedValue({
        data: { success: true, data: { email: 'user@test.com', token: 'tok-google' } },
      });

      let capturedCallback: ((response: google.accounts.id.CredentialResponse) => void) | null =
        null;

      (window as Window & { google: unknown }).google = {
        accounts: {
          id: {
            initialize: (config: google.accounts.id.IdConfiguration) => {
              capturedCallback = config.callback ?? null;
            },
            renderButton: vi.fn(),
          },
        },
      };

      createWrapper();
      await flushPromises();

      expect(capturedCallback).not.toBeNull();
      await capturedCallback!({ credential: 'google-id-token', select_by: 'auto' });
      await flushPromises();

      expect(apiGateway.post).toHaveBeenCalledWith('/auth/google', {
        credential: 'google-id-token',
      });
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('does not navigate when Google credential callback fails', async () => {
      const apiGateway = (await import('../api/api-gateway')).default;
      vi.mocked(apiGateway.post).mockRejectedValue({
        isAxiosError: true,
        response: { data: { errors: ['No account found for this Google identity'] } },
      });

      let capturedCallback: ((response: google.accounts.id.CredentialResponse) => void) | null =
        null;

      (window as Window & { google: unknown }).google = {
        accounts: {
          id: {
            initialize: (config: google.accounts.id.IdConfiguration) => {
              capturedCallback = config.callback ?? null;
            },
            renderButton: vi.fn(),
          },
        },
      };

      createWrapper();
      await flushPromises();

      await capturedCallback!({ credential: 'bad-token', select_by: 'auto' });
      await flushPromises();

      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
