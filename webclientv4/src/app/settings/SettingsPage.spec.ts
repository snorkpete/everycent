import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import SettingsPage from './SettingsPage.vue';
import type { SettingsData } from './settings.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';

const mockSetHeading = vi.fn();
vi.mock('../toolbar/headingStore', () => ({
  useHeadingStore: () => ({ setHeading: mockSetHeading }),
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

const coupleSettings: SettingsData = {
  family_type: 'couple',
  husband: 'John',
  wife: 'Jane',
  primary_budget_account_id: 1,
  default_allocation_category_id_for_special_events: 2,
};

const singleSettings: SettingsData = {
  family_type: 'single',
  single_person: 'Alex',
};

const bankAccounts: BankAccountData[] = [
  { id: 1, name: 'Savings Account' },
  { id: 2, name: 'Chequing Account' },
];

const allocationCategories: AllocationCategoryData[] = [
  { id: 1, name: 'Groceries' },
  { id: 2, name: 'Utilities' },
];

const mockStore = reactive({
  settings: { ...coupleSettings } as SettingsData,
  bankAccounts: bankAccounts as BankAccountData[],
  allocationCategories: allocationCategories as AllocationCategoryData[],
  loading: false,
  error: null as string | null,
  fetchAll: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
});

vi.mock('./settingsStore', () => ({
  useSettingsStore: () => mockStore,
}));

function createWrapper() {
  return mount(SettingsPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
    },
  });
}

describe('SettingsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.settings = { ...coupleSettings };
    mockStore.bankAccounts = bankAccounts;
    mockStore.allocationCategories = allocationCategories;
    mockStore.error = null;
    mockStore.fetchAll.mockResolvedValue(undefined);
    mockStore.save.mockResolvedValue(undefined);
  });

  describe('on mount', () => {
    it('sets the page heading to "General Settings"', async () => {
      createWrapper();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('General Settings');
    });

    it('calls fetchAll on mount', async () => {
      createWrapper();
      await nextTick();

      expect(mockStore.fetchAll).toHaveBeenCalled();
    });

    it('does not show an error toast when fetchAll succeeds', async () => {
      createWrapper();
      // Two ticks needed: first for onMounted to fire, second for the fetchAll .then() to resolve
      await nextTick();
      await nextTick();

      expect(mockNotifyError).not.toHaveBeenCalled();
    });

    it('shows an error toast when fetchAll fails', async () => {
      const errorMessage = 'Load failed';
      mockStore.fetchAll.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Network error');
      });
      createWrapper();
      await nextTick();
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('view mode (default)', () => {
    it('shows the "Make Changes" button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
    });

    it('does not show "Save" or "Cancel" buttons', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(false);
    });

    it('switches to edit mode when "Make Changes" is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
    });
  });

  describe('edit mode', () => {
    it('shows "Save" and "Cancel" buttons', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(true);
    });

    it('does not show "Make Changes" button', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(false);
    });
  });

  describe('family type conditional fields', () => {
    it('shows husband and wife fields for a couple household after load', async () => {
      mockStore.fetchAll.mockResolvedValue(undefined);
      const wrapper = createWrapper();
      // Two ticks needed: first for onMounted, second for fetchAll .then() to update formData
      await nextTick();
      await nextTick();

      expect(wrapper.find('[data-testid="husband"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="wife"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="single-person"]').exists()).toBe(false);
    });

    it('shows single person field for a single household after load', async () => {
      mockStore.settings = { ...singleSettings };
      mockStore.fetchAll.mockImplementation(async () => {
        mockStore.settings = { ...singleSettings };
      });
      const wrapper = createWrapper();
      // Two ticks needed: first for onMounted, second for fetchAll .then() to update formData
      await nextTick();
      await nextTick();

      expect(wrapper.find('[data-testid="single-person"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="husband"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="wife"]').exists()).toBe(false);
    });
  });

  describe('on save', () => {
    it('calls store.save with the current form data', async () => {
      const wrapper = createWrapper();
      // Two ticks to let fetchAll resolve and populate formData from store.settings
      await nextTick();
      await nextTick();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await nextTick();

      expect(mockStore.save).toHaveBeenCalledWith(
        expect.objectContaining({
          family_type: coupleSettings.family_type,
          husband: coupleSettings.husband,
          wife: coupleSettings.wife,
        }),
      );
    });

    it('returns to view mode and shows a success toast after a successful save', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await nextTick();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Settings saved');
    });

    it('stays in edit mode and shows an error toast when save fails', async () => {
      const errorMessage = 'Save failed';
      mockStore.save.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await nextTick();

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('cancel', () => {
    it('returns to view mode', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
    });
  });
});
