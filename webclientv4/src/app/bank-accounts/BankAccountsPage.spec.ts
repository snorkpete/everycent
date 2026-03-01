import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BankAccountsPage from './BankAccountsPage.vue';
import type { BankAccountData } from './bankAccount.types';

const mockSetHeading = vi.fn();
vi.mock('../toolbar/headingStore', () => ({
  useHeadingStore: () => ({ setHeading: mockSetHeading }),
}));

const openAccount: BankAccountData = { id: 1, name: 'Savings Account', status: 'open' };
const closedAccount: BankAccountData = { id: 2, name: 'Old Account', status: 'closed' };

// Use plain values (not refs) — Pinia's auto-unwrapping doesn't apply to plain mocks
const mockStore = {
  bankAccounts: [openAccount, closedAccount],
  institutions: [],
  loading: false,
  error: null as string | null,
  fetchAll: vi.fn().mockResolvedValue(undefined),
  fetchInstitutions: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
};

vi.mock('./bankAccountStore', () => ({
  useBankAccountStore: () => mockStore,
}));

const DialogStub = {
  name: 'BankAccountEditDialog',
  template: '<div data-testid="edit-dialog" />',
  props: ['visible', 'bankAccount', 'initialEditMode', 'institutions'],
  emits: ['update:visible', 'save'],
};

function mountPage() {
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
    mockStore.fetchAll.mockResolvedValue(undefined);
    mockStore.fetchInstitutions.mockResolvedValue(undefined);
    mockStore.save.mockResolvedValue(undefined);
  });

  describe('on mount', () => {
    it('sets the page heading to "Setup Bank Accounts"', async () => {
      mountPage();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Setup Bank Accounts');
    });

    it('calls fetchAll on mount', async () => {
      mountPage();
      await nextTick();

      expect(mockStore.fetchAll).toHaveBeenCalled();
    });

    it('calls fetchInstitutions on mount', async () => {
      mountPage();
      await nextTick();

      expect(mockStore.fetchInstitutions).toHaveBeenCalled();
    });
  });

  describe('account list', () => {
    it('renders open account names', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).toContain(openAccount.name);
    });

    it('hides closed accounts by default', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).not.toContain(closedAccount.name);
    });

    it('shows closed accounts when the toggle is on', async () => {
      const wrapper = mountPage();

      // ToggleSwitch renders a checkbox input; setValue triggers the v-model update
      const toggleInput = wrapper.find('[data-testid="show-closed-toggle"] input');
      await toggleInput.setValue(true);

      expect(wrapper.text()).toContain(closedAccount.name);
    });
  });

  describe('View button', () => {
    it('opens the dialog with the selected account', async () => {
      const wrapper = mountPage();

      const viewBtn = wrapper.find('[data-testid="view-btn-1"]');
      await viewBtn.trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('bankAccount')).toEqual(openAccount);
    });

    it('opens the dialog in view mode', async () => {
      const wrapper = mountPage();

      const viewBtn = wrapper.find('[data-testid="view-btn-1"]');
      await viewBtn.trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(false);
    });
  });

  describe('Add Bank Account button', () => {
    it('opens the dialog with an empty account', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('bankAccount')).toEqual({});
    });

    it('opens the dialog in edit mode', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(true);
    });
  });

  describe('Refresh button', () => {
    it('calls fetchAll and fetchInstitutions', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');

      expect(mockStore.fetchAll).toHaveBeenCalledTimes(2); // once on mount, once on refresh
      expect(mockStore.fetchInstitutions).toHaveBeenCalledTimes(2);
    });
  });

  describe('on save', () => {
    it('calls store.save with the account data', async () => {
      const wrapper = mountPage();
      await wrapper.find('[data-testid="view-btn-1"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      await dialog.vm.$emit('save', openAccount);
      await nextTick();

      expect(mockStore.save).toHaveBeenCalledWith(openAccount);
    });

    it('closes the dialog after a successful save', async () => {
      const wrapper = mountPage();
      await wrapper.find('[data-testid="view-btn-1"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      await dialog.vm.$emit('save', openAccount);
      await nextTick();

      expect(dialog.props('visible')).toBe(false);
    });
  });
});
