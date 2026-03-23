import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';
import LoginPage from './LoginPage.vue';
import { useAuthStore } from './authStore';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('./authApi', () => ({
  authApi: {
    signIn: vi.fn(),
    validateToken: vi.fn(),
    signOut: vi.fn(),
  },
}));

const primevueStubs = {
  InputText: {
    template:
      '<input :data-testid="$attrs[\'data-testid\']" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
  },
  Password: {
    template:
      '<input type="password" :data-testid="$attrs[\'data-testid\']" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'feedback', 'toggleMask'],
  },
  Button: {
    template:
      '<button type="submit" :data-testid="$attrs[\'data-testid\']" :data-loading="loading">{{ label }}</button>',
    props: ['label', 'loading', 'severity', 'size'],
  },
};

describe('LoginPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    mockPush.mockReset();
    vi.restoreAllMocks();
  });

  function mountLoginPage() {
    return mount(LoginPage, {
      global: {
        plugins: [pinia],
        stubs: primevueStubs,
      },
    });
  }

  it('renders the login form', () => {
    const wrapper = mountLoginPage();

    expect(wrapper.find('[data-testid="login-heading"]').text()).toBe(
      'EveryCent - Log In',
    );
    expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="email-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="password-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="login-button"]').text()).toBe('Log In');
  });

  it('does not show error when store has no error', () => {
    const wrapper = mountLoginPage();
    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(false);
  });

  it('shows error when store has an error', () => {
    const store = useAuthStore();
    const errorText = 'Invalid credentials';
    store.error = errorText;

    const wrapper = mountLoginPage();

    const errorEl = wrapper.find('[data-testid="error-message"]');
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toBe(errorText);
  });

  it('calls authStore.logIn and navigates to / on success', async () => {
    const { authApi } = await import('./authApi');
    vi.mocked(authApi.signIn).mockResolvedValue({} as any);

    const email = 'user@test.com';
    const password = 'password123';

    const wrapper = mountLoginPage();
    await wrapper.find('[data-testid="email-input"]').setValue(email);
    await wrapper.find('[data-testid="password-input"]').setValue(password);

    await wrapper.find('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(authApi.signIn).toHaveBeenCalledWith(email, password);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('does not navigate on failed login', async () => {
    const { authApi } = await import('./authApi');
    vi.mocked(authApi.signIn).mockRejectedValue({
      isAxiosError: true,
      response: { data: { errors: ['Bad credentials'] } },
    });

    const wrapper = mountLoginPage();
    await wrapper.find('[data-testid="email-input"]').setValue('user@test.com');
    await wrapper.find('[data-testid="password-input"]').setValue('wrong');

    await wrapper.find('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows loading state during login and clears it after', async () => {
    let resolveSignIn!: (value: any) => void;
    const { authApi } = await import('./authApi');
    vi.mocked(authApi.signIn).mockImplementation(
      () => new Promise((resolve) => (resolveSignIn = resolve)),
    );

    const wrapper = mountLoginPage();
    await wrapper.find('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(
      wrapper.find('[data-testid="login-button"]').attributes('data-loading'),
    ).toBe('true');

    resolveSignIn({});
    await flushPromises();

    expect(
      wrapper.find('[data-testid="login-button"]').attributes('data-loading'),
    ).toBe('false');
  });

  it('clears loading state on failed login', async () => {
    const { authApi } = await import('./authApi');
    vi.mocked(authApi.signIn).mockRejectedValue(new Error('fail'));

    const wrapper = mountLoginPage();
    await wrapper.find('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(
      wrapper.find('[data-testid="login-button"]').attributes('data-loading'),
    ).toBe('false');
  });
});
