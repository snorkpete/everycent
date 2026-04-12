import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, ref } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionsToolbarMobile from './TransactionsToolbarMobile.vue';
import { useTransactionStore } from './transactionStore';
import { buildBankAccount } from '../../test/factories/bankAccountFactory';
import { buildBudget } from '../../test/factories/budgetFactory';

const EDIT_BTN = '[data-testid="edit-btn"]';
const SAVE_BTN = '[data-testid="save-btn"]';
const CANCEL_BTN = '[data-testid="cancel-btn"]';
const REFRESH_BTN = '[data-testid="refresh-btn"]';
const ADD_BTN = '[data-testid="add-btn-mobile"]';
const AUTO_ALLOCATE_BTN = '[data-testid="auto-allocate-btn"]';
const DASH_ZERO_TOGGLE = '[data-testid="dash-zero-toggle"]';
const GO_TO_BUDGET_LINK = '[data-testid="go-to-budget-link"]';
const IMPORT_MENU_BTN = '[data-testid="import-menu-btn"]';

vi.mock('../shared/composables/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: ref(true),
    isCompact: ref(true),
  }),
}));

vi.mock('./transactionApi', () => ({
  transactionApi: {
    getAll: vi.fn(),
    save: vi.fn(),
    getSinkFundAllocations: vi.fn(),
  },
}));

vi.mock('../budgets/budgetApi', () => ({
  budgetApi: {
    getAll: vi.fn(),
    getAllocations: vi.fn(),
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

const checkingAccount = buildBankAccount({ id: 1, name: 'Checking' });
const jan2025 = buildBudget({ id: 1, name: 'Jan 2025', status: 'open' });

let pinia: Pinia;
let store: ReturnType<typeof useTransactionStore>;

function createWrapper(
  props: {
    selectedBankAccountId?: number | null;
    selectedBudgetId?: number | null;
    dashIfZero?: boolean;
  } = {},
): VueWrapper {
  return mount(TransactionsToolbarMobile, {
    props: {
      selectedBankAccountId: props.selectedBankAccountId ?? 1,
      selectedBudgetId: props.selectedBudgetId ?? 1,
      dashIfZero: props.dashIfZero ?? true,
    },
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

async function setupStore() {
  const { budgetApi } = await import('../budgets/budgetApi');
  const { bankAccountApi } = await import('../bank-accounts/bankAccountApi');
  vi.mocked(budgetApi.getAll).mockResolvedValue([jan2025]);
  vi.mocked(bankAccountApi.getOpen).mockResolvedValue([checkingAccount]);

  store = useTransactionStore();
  await store.fetchMetadata();
  await flushPromises();
  store.isEditMode = false;
}

describe('TransactionsToolbarMobile', () => {
  beforeEach(async () => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    await setupStore();
  });

  describe('view mode', () => {
    it('shows Edit button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
    });

    it('does not show Save or Cancel buttons', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(false);
    });

    it('shows refresh button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(REFRESH_BTN).exists()).toBe(true);
    });

    it('shows go-to-budget link', () => {
      const wrapper = createWrapper({ selectedBudgetId: 5 });

      const link = wrapper.find(GO_TO_BUDGET_LINK);
      expect(link.exists()).toBe(true);
      expect(link.attributes('href')).toBe('#/budgets/5');
    });

    it('shows import menu button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(IMPORT_MENU_BTN).exists()).toBe(true);
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      store.isEditMode = true;
    });

    it('shows Save and Cancel buttons', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
    });

    it('does not show Edit button', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(false);
    });

    it('shows Add button', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(ADD_BTN).exists()).toBe(true);
    });

    it('shows Auto Allocate button', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(AUTO_ALLOCATE_BTN).exists()).toBe(true);
    });
  });

  describe('events', () => {
    it('emits refresh when refresh button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(REFRESH_BTN).trigger('click');

      expect(wrapper.emitted('refresh')).toBeTruthy();
    });

    it('emits save when save button is clicked', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');

      expect(wrapper.emitted('save')).toBeTruthy();
    });

    it('emits cancel when cancel button is clicked', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(CANCEL_BTN).trigger('click');

      expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('emits addTransaction when add button is clicked', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(ADD_BTN).trigger('click');

      expect(wrapper.emitted('addTransaction')).toBeTruthy();
    });

    it('emits autoAllocate when auto allocate button is clicked', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(AUTO_ALLOCATE_BTN).trigger('click');

      expect(wrapper.emitted('autoAllocate')).toBeTruthy();
    });

    it('emits update:dashIfZero when dash-zero toggle is clicked', async () => {
      const wrapper = createWrapper({ dashIfZero: true });

      await wrapper.find(DASH_ZERO_TOGGLE).trigger('click');

      expect(wrapper.emitted('update:dashIfZero')).toEqual([[false]]);
    });

    it('emits update:selectedBankAccountId when bank account is changed', async () => {
      const wrapper = createWrapper();

      const bankAccountSelect = wrapper.find('[data-testid="bank-account-select"]');
      const selectComponent = bankAccountSelect.findComponent({ name: 'Select' });
      await selectComponent.vm.$emit('update:modelValue', 1);

      expect(wrapper.emitted('update:selectedBankAccountId')).toEqual([[1]]);
    });

    it('emits update:selectedBudgetId when budget is changed', async () => {
      const wrapper = createWrapper();

      const budgetSelect = wrapper.find('[data-testid="budget-select"]');
      const selectComponent = budgetSelect.findComponent({ name: 'Select' });
      await selectComponent.vm.$emit('update:modelValue', 1);

      expect(wrapper.emitted('update:selectedBudgetId')).toEqual([[1]]);
    });
  });
});
