import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import SettingsPage from './SettingsPage.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { useSettingsStore } from './settingsStore';
import { settingsApi } from './settingsApi';
import { bankAccountApi } from '../bank-accounts/bankAccountApi';
import { allocationCategoryApi } from '../allocation-categories/allocationCategoryApi';
import { buildSettings, buildBankAccount, buildAllocationCategory } from '../../test/factories';

vi.mock('./settingsApi', () => ({
  settingsApi: {
    get: vi.fn(),
    save: vi.fn(),
  },
}));

vi.mock('../bank-accounts/bankAccountApi', () => ({
  bankAccountApi: {
    getOpen: vi.fn(),
  },
}));

vi.mock('../allocation-categories/allocationCategoryApi', () => ({
  allocationCategoryApi: {
    getAll: vi.fn(),
  },
}));

const mockNotifyError = vi.fn();
const mockNotifySuccess = vi.fn();
vi.mock('../notifications/useNotifications', () => ({
  useNotifications: () => ({
    error: mockNotifyError,
    success: mockNotifySuccess,
    info: vi.fn(),
  }),
}));

const coupleSettings = buildSettings({
  family_type: 'couple',
  husband: 'John',
  wife: 'Jane',
  primary_budget_account_id: 1,
  default_allocation_category_id_for_special_events: 2,
});

const singleSettings = buildSettings({
  family_type: 'single',
  single_person: 'Alex',
  husband: undefined,
  wife: undefined,
});

const bankAccounts = [
  buildBankAccount({ id: 1, name: 'Savings Account' }),
  buildBankAccount({ id: 2, name: 'Chequing Account' }),
];

const allocationCategories = [
  buildAllocationCategory({ id: 1, name: 'Groceries' }),
  buildAllocationCategory({ id: 2, name: 'Utilities' }),
];

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(SettingsPage, {
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('SettingsPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    vi.mocked(settingsApi.get).mockResolvedValue(coupleSettings);
    vi.mocked(settingsApi.save).mockResolvedValue(coupleSettings);
    vi.mocked(bankAccountApi.getOpen).mockResolvedValue(bankAccounts);
    vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(allocationCategories);
  });

  describe('on mount', () => {
    it('sets the page heading to "General Settings"', async () => {
      createWrapper(pinia);
      await flushPromises();

      const headingStore = useHeadingStore();
      expect(headingStore.heading).toBe('General Settings');
    });

    it('calls the APIs to fetch settings, bank accounts, and categories on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(settingsApi.get).toHaveBeenCalled();
      expect(bankAccountApi.getOpen).toHaveBeenCalled();
      expect(allocationCategoryApi.getAll).toHaveBeenCalled();
    });

    it('does not show an error toast when fetchAll succeeds', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(mockNotifyError).not.toHaveBeenCalled();
    });

    it('sets the store error when the API fails on mount', async () => {
      // Note: the store's fetchAll catches errors internally without re-throwing,
      // so the component's .catch() handler never fires. The store captures the error
      // but the user is not notified. This is a pre-existing gap in the component.
      vi.mocked(settingsApi.get).mockRejectedValue(new Error('Network error'));
      createWrapper(pinia);
      await flushPromises();

      const store = useSettingsStore();
      expect(store.error).toBe('Network error');
    });
  });

  describe('view mode (default)', () => {
    it('shows the "Make Changes" button', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
    });

    it('does not show "Save" or "Cancel" buttons', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(false);
    });

    it('switches to edit mode when "Make Changes" is clicked', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
    });
  });

  describe('edit mode', () => {
    it('shows "Save" and "Cancel" buttons', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(true);
    });

    it('does not show "Make Changes" button', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(false);
    });
  });

  describe('family type conditional fields', () => {
    it('shows husband and wife fields for a couple household after load', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="husband"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="wife"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="single-person"]').exists()).toBe(false);
    });

    it('shows single person field for a single household after load', async () => {
      vi.mocked(settingsApi.get).mockResolvedValue(singleSettings);
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="single-person"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="husband"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="wife"]').exists()).toBe(false);
    });
  });

  describe('on save', () => {
    it('calls the API to save settings with the current form data', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(settingsApi.save).toHaveBeenCalledWith(
        expect.objectContaining({
          family_type: coupleSettings.family_type,
          husband: coupleSettings.husband,
          wife: coupleSettings.wife,
        }),
      );
    });

    it('returns to view mode and shows a success toast after a successful save', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Settings saved');
    });

    it('stays in edit mode and shows an error toast when save fails', async () => {
      vi.mocked(settingsApi.save).mockRejectedValue(new Error('Server error'));
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
    });
  });

  describe('cancel', () => {
    it('returns to view mode', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
    });
  });
});
