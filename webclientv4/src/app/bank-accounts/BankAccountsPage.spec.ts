import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BankAccountsPage from './BankAccountsPage.vue';
import type { BankAccountData } from './bankAccount.types';

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

const openAccount: BankAccountData = { id: 1, name: 'Savings Account', status: 'open' };
const closedAccount: BankAccountData = { id: 2, name: 'Old Account', status: 'closed' };

const mockStore = reactive({
  bankAccounts: [openAccount, closedAccount] as BankAccountData[],
  institutions: [] as unknown[],
  loading: false,
  error: null as string | null,
  fetchAll: vi.fn().mockResolvedValue(undefined),
  fetchInstitutions: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
});

vi.mock('./bankAccountStore', () => ({
  useBankAccountStore: () => mockStore,
}));

const DialogStub = {
  name: 'BankAccountEditDialog',
  template: '<div data-testid="edit-dialog" />',
  props: ['visible', 'bankAccount', 'initialEditMode', 'institutions'],
  emits: ['update:visible', 'save'],
};

function createWrapper() {
  return mount(BankAccountsPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: { BankAccountEditDialog: DialogStub },
    },
  });
}

describe('BankAccountsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.bankAccounts = [openAccount, closedAccount];
    mockStore.institutions = [];
    mockStore.error = null;
    mockStore.fetchAll.mockResolvedValue(undefined);
    mockStore.fetchInstitutions.mockResolvedValue(undefined);
    mockStore.save.mockResolvedValue(undefined);
  });

  describe('on mount', () => {
    it('sets the page heading to "Setup Bank Accounts"', async () => {
      createWrapper();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Setup Bank Accounts');
    });

    it('calls fetchAll on mount', async () => {
      createWrapper();
      await nextTick();

      expect(mockStore.fetchAll).toHaveBeenCalled();
    });

    it('calls fetchInstitutions on mount', async () => {
      createWrapper();
      await nextTick();

      expect(mockStore.fetchInstitutions).toHaveBeenCalled();
    });
  });

  describe('account list', () => {
    it('renders open account names', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain(openAccount.name);
    });

    it('hides closed accounts by default', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).not.toContain(closedAccount.name);
    });

    it('shows closed accounts when the toggle is on', async () => {
      const wrapper = createWrapper();

      const toggleInput = wrapper.find('[data-testid="show-closed-toggle"] input');
      await toggleInput.setValue(true);

      expect(wrapper.text()).toContain(closedAccount.name);
    });
  });

  describe('closed account display', () => {
    it('applies the closed class to closed account rows', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="show-closed-toggle"] input').setValue(true);

      const items = wrapper.findAll('.account-item');
      const closedItem = items.find((item) => item.text().includes(closedAccount.name!));

      expect(closedItem!.classes()).toContain('account-item--closed');
    });

    it('does not apply the closed class to open account rows', () => {
      const wrapper = createWrapper();

      const items = wrapper.findAll('.account-item');
      const openItem = items.find((item) => item.text().includes(openAccount.name!));

      expect(openItem!.classes()).not.toContain('account-item--closed');
    });

    it('shows a Closed tag for closed accounts', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="show-closed-toggle"] input').setValue(true);

      const items = wrapper.findAll('.account-item');
      const closedItem = items.find((item) => item.text().includes(closedAccount.name!));
      const tag = closedItem!.findComponent({ name: 'Tag' });

      expect(tag.exists()).toBe(true);
      expect(tag.props('severity')).toBe('warn');
      expect(tag.props('icon')).toBe('pi pi-ban');
    });

    it('does not show a Closed tag for open accounts', () => {
      const wrapper = createWrapper();

      const items = wrapper.findAll('.account-item');
      const openItem = items.find((item) => item.text().includes(openAccount.name!));

      expect(openItem!.find('[data-testid="closed-tag"]').exists()).toBe(false);
    });
  });

  describe('View button', () => {
    it('opens the dialog with the selected account', async () => {
      const wrapper = createWrapper();

      const viewBtn = wrapper.find('[data-testid="view-btn-1"]');
      await viewBtn.trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('bankAccount')).toEqual(openAccount);
    });

    it('opens the dialog in view mode', async () => {
      const wrapper = createWrapper();

      const viewBtn = wrapper.find('[data-testid="view-btn-1"]');
      await viewBtn.trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(false);
    });
  });

  describe('Add Bank Account button', () => {
    it('opens the dialog with an empty account', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('bankAccount')).toEqual({});
    });

    it('opens the dialog in edit mode', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(true);
    });
  });

  describe('Refresh button', () => {
    it('calls fetchAll and fetchInstitutions', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');

      expect(mockStore.fetchAll).toHaveBeenCalledTimes(2); // once on mount, once on refresh
      expect(mockStore.fetchInstitutions).toHaveBeenCalledTimes(2);
    });
  });

  describe('on save', () => {
    it('calls store.save with the account data', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="view-btn-1"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      await dialog.vm.$emit('save', openAccount);
      await nextTick();

      expect(mockStore.save).toHaveBeenCalledWith(openAccount);
    });

    it('closes the dialog and shows a success toast after a successful save', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="view-btn-1"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      await dialog.vm.$emit('save', openAccount);
      await nextTick();

      expect(dialog.props('visible')).toBe(false);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Bank account saved');
    });

    it('keeps the dialog open and shows an error toast when save fails', async () => {
      const errorMessage = 'Save failed';
      mockStore.save.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="view-btn-1"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      await dialog.vm.$emit('save', openAccount);
      await nextTick();

      expect(dialog.props('visible')).toBe(true);
      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });

    it('does not show an error toast on a clean mount', async () => {
      createWrapper();
      await nextTick();

      expect(mockNotifyError).not.toHaveBeenCalled();
    });
  });
});
