import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BankAccountsPage from './BankAccountsPage.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { bankAccountApi } from './bankAccountApi';
import { institutionApi } from '../institutions/institutionApi';
import { buildBankAccount } from '../../test/factories';

vi.mock('./bankAccountApi', () => ({
  bankAccountApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../institutions/institutionApi', () => ({
  institutionApi: {
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

const openAccount = buildBankAccount({ id: 1, name: 'Savings Account', status: 'open' });
const closedAccount = buildBankAccount({ id: 2, name: 'Old Account', status: 'closed' });

const DialogStub = {
  name: 'BankAccountEditDialog',
  template: '<div data-testid="edit-dialog" />',
  props: ['visible', 'bankAccount', 'initialEditMode', 'institutions'],
  emits: ['update:visible', 'save'],
};

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(BankAccountsPage, {
    global: {
      plugins: [PrimeVue, pinia],
      stubs: { BankAccountEditDialog: DialogStub },
    },
  });
}

describe('BankAccountsPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    vi.mocked(bankAccountApi.getAll).mockResolvedValue([openAccount, closedAccount]);
    vi.mocked(institutionApi.getAll).mockResolvedValue([]);
    vi.mocked(bankAccountApi.create).mockResolvedValue(openAccount);
    vi.mocked(bankAccountApi.update).mockResolvedValue(openAccount);
  });

  describe('on mount', () => {
    it('sets the page heading to "Setup Bank Accounts"', async () => {
      createWrapper(pinia);
      await flushPromises();

      const headingStore = useHeadingStore();
      expect(headingStore.heading).toBe('Setup Bank Accounts');
    });

    it('calls the API to fetch all bank accounts on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(bankAccountApi.getAll).toHaveBeenCalled();
    });

    it('calls the API to fetch institutions on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(institutionApi.getAll).toHaveBeenCalled();
    });
  });

  describe('account list', () => {
    it('renders open account names', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain(openAccount.name);
    });

    it('hides closed accounts by default', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).not.toContain(closedAccount.name);
    });

    it('shows closed accounts when the toggle is on', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const toggleInput = wrapper.find('[data-testid="show-closed-toggle"] input');
      await toggleInput.setValue(true);

      expect(wrapper.text()).toContain(closedAccount.name);
    });
  });

  describe('closed account display', () => {
    it('applies the closed class to closed account rows', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();
      await wrapper.find('[data-testid="show-closed-toggle"] input').setValue(true);

      const names = wrapper.findAll('.account-name');
      const closedName = names.find((el) => el.text().includes(closedAccount.name!));

      expect(closedName!.classes()).toContain('account-name--closed');
    });

    it('does not apply the closed class to open account rows', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const names = wrapper.findAll('.account-name');
      const openName = names.find((el) => el.text().includes(openAccount.name!));

      expect(openName!.classes()).not.toContain('account-name--closed');
    });

    it('shows a Closed tag for closed accounts', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();
      await wrapper.find('[data-testid="show-closed-toggle"] input').setValue(true);

      const items = wrapper.findAll('.ec-item-list__item');
      const closedItem = items.find((item) => item.text().includes(closedAccount.name!));
      const tag = closedItem!.findComponent({ name: 'Tag' });

      expect(tag.exists()).toBe(true);
      expect(tag.props('severity')).toBe('warn');
      expect(tag.props('icon')).toBe('pi pi-ban');
    });

    it('does not show a Closed tag for open accounts', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const items = wrapper.findAll('.ec-item-list__item');
      const openItem = items.find((item) => item.text().includes(openAccount.name!));

      expect(openItem!.find('[data-testid="closed-tag"]').exists()).toBe(false);
    });
  });

  describe('View button', () => {
    it('opens the dialog with the selected account', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const viewBtn = wrapper.find('[data-testid="view-btn-1"]');
      await viewBtn.trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('bankAccount')).toEqual(openAccount);
    });

    it('opens the dialog in view mode', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const viewBtn = wrapper.find('[data-testid="view-btn-1"]');
      await viewBtn.trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(false);
    });
  });

  describe('Add Bank Account button', () => {
    it('opens the dialog with an empty account', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('bankAccount')).toEqual({});
    });

    it('opens the dialog in edit mode', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(true);
    });
  });

  describe('Refresh button', () => {
    it('calls the API to fetch accounts and institutions again', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');
      await flushPromises();

      expect(bankAccountApi.getAll).toHaveBeenCalledTimes(2); // once on mount, once on refresh
      expect(institutionApi.getAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('on save', () => {
    it('calls the API to update the account when it has an id', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();
      await wrapper.find('[data-testid="view-btn-1"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      await dialog.vm.$emit('save', openAccount);
      await flushPromises();

      expect(bankAccountApi.update).toHaveBeenCalledWith(openAccount);
    });

    it('closes the dialog and shows a success toast after a successful save', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();
      await wrapper.find('[data-testid="view-btn-1"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      await dialog.vm.$emit('save', openAccount);
      await flushPromises();

      expect(dialog.props('visible')).toBe(false);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Bank account saved');
    });

    it('keeps the dialog open and shows an error toast when save fails', async () => {
      vi.mocked(bankAccountApi.update).mockRejectedValue(new Error('Server error'));
      const wrapper = createWrapper(pinia);
      await flushPromises();
      await wrapper.find('[data-testid="view-btn-1"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BankAccountEditDialog' });
      await dialog.vm.$emit('save', openAccount);
      await flushPromises();

      expect(dialog.props('visible')).toBe(true);
      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
    });

    it('does not show an error toast on a clean mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(mockNotifyError).not.toHaveBeenCalled();
    });
  });
});
