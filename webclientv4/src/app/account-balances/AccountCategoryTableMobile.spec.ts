import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import AccountCategoryTableMobile from './AccountCategoryTableMobile.vue';
import type { AccountBalanceData } from './accountBalance.types';
import { buildAccountBalance } from '../../test/factories';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Selectors
const ACCOUNT_CARD = '[data-testid="account-card"]';
const ACCOUNT_NAME = '[data-testid="account-name"]';
const ACCOUNT_BALANCE = '[data-testid="account-balance"]';
const CARD_DETAIL = '[data-testid="card-detail"]';
const CATEGORY_TOTAL = '[data-testid="category-total"]';
const VIEW_TRANSACTIONS_BTN = '[data-testid="view-transactions-btn"]';
const LOAN_CARD = '[data-testid="loan-card"]';

const savingsAccount: AccountBalanceData = buildAccountBalance({
  id: 1,
  name: 'Joint Savings',
  account_type: 'savings_account',
  account_category: 'current',
  is_cash: true,
  closing_date: '2026-03-24',
  next_closing_date: '2026-04-24',
  closing_balance: 100000,
  expected_closing_balance: 90000,
  current_balance: 110000,
  asset_bank_account_id: null,
  institution: { id: 1, name: 'ABN Amro' },
});

const checkingAccount: AccountBalanceData = buildAccountBalance({
  id: 2,
  name: 'Joint Checking',
  account_type: 'checking_account',
  account_category: 'current',
  is_cash: true,
  closing_date: '2026-03-24',
  next_closing_date: '2026-04-24',
  closing_balance: 50000,
  expected_closing_balance: 45000,
  current_balance: 55000,
  asset_bank_account_id: null,
});

const houseWithLoans: AccountBalanceData = buildAccountBalance({
  id: 10,
  name: 'House',
  account_type: 'normal',
  account_category: 'asset',
  is_cash: false,
  closing_date: '2026-03-24',
  next_closing_date: '2026-04-24',
  closing_balance: 500000,
  expected_closing_balance: 500000,
  current_balance: 500000,
  asset_bank_account_id: null,
  loans: [
    buildAccountBalance({
      id: 11,
      name: 'Mortgage A',
      account_type: 'normal',
      account_category: 'liability',
      is_cash: false,
      closing_date: '2026-03-24',
      next_closing_date: '2026-04-24',
      closing_balance: -200000,
      expected_closing_balance: -200000,
      current_balance: -200000,
      asset_bank_account_id: 10,
    }),
    buildAccountBalance({
      id: 12,
      name: 'Mortgage B',
      account_type: 'normal',
      account_category: 'liability',
      is_cash: false,
      closing_date: '2026-03-24',
      next_closing_date: '2026-04-24',
      closing_balance: -100000,
      expected_closing_balance: -100000,
      current_balance: -100000,
      asset_bank_account_id: 10,
    }),
  ],
});

function createWrapper(
  accounts: AccountBalanceData[],
  heading = 'Current Accounts',
  dashIfZero = false,
  expanded = true,
): VueWrapper {
  return mount(AccountCategoryTableMobile, {
    props: { heading, accounts, dashIfZero, expanded },
    global: {
      plugins: [PrimeVue],
      stubs: { 'router-link': true },
      directives: { tooltip: () => {} },
    },
  });
}

describe('AccountCategoryTableMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('heading and section total', () => {
    it('renders the heading text', () => {
      const wrapper = createWrapper([savingsAccount]);

      expect(wrapper.text()).toContain('Current Accounts');
    });

    it('renders the total current balance in the heading', () => {
      const wrapper = createWrapper([savingsAccount]);

      // 110000 cents = 1,100.00
      expect(wrapper.find('.section-heading').text()).toContain('1,100.00');
    });

    it('sums multiple accounts in the heading total', () => {
      const wrapper = createWrapper([savingsAccount, checkingAccount]);

      // 110000 + 55000 = 165000 cents = 1,650.00
      expect(wrapper.find('.section-heading').text()).toContain('1,650.00');
    });
  });

  describe('account cards', () => {
    it('renders one card per account', () => {
      const wrapper = createWrapper([savingsAccount, checkingAccount]);

      expect(wrapper.findAll(ACCOUNT_CARD)).toHaveLength(2);
    });

    it('renders the account name', () => {
      const wrapper = createWrapper([savingsAccount]);

      const name = wrapper.find(ACCOUNT_NAME);
      expect(name.text()).toContain('Joint Savings');
    });

    it('renders the current balance in the card', () => {
      const wrapper = createWrapper([savingsAccount]);

      // 110000 cents = 1,100.00
      expect(wrapper.find(ACCOUNT_BALANCE).text()).toContain('1,100.00');
    });

    it('shows sink fund icon for sink_fund account_type', () => {
      const sinkFundAccount = buildAccountBalance({
        id: 3,
        name: 'Emergency Fund',
        account_type: 'sink_fund',
        current_balance: 50000,
      });

      const wrapper = createWrapper([sinkFundAccount]);

      expect(wrapper.find('.sink-fund-icon').exists()).toBe(true);
    });

    it('does not show sink fund icon for normal accounts', () => {
      const wrapper = createWrapper([savingsAccount]);

      expect(wrapper.find('.sink-fund-icon').exists()).toBe(false);
    });
  });

  describe('expand / collapse', () => {
    it('card detail is not shown by default', () => {
      const wrapper = createWrapper([savingsAccount]);

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);
    });

    it('clicking a card expands its detail section', async () => {
      const wrapper = createWrapper([savingsAccount]);

      await wrapper.find(ACCOUNT_CARD).trigger('click');

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(true);
    });

    it('clicking an expanded card collapses it', async () => {
      const wrapper = createWrapper([savingsAccount]);

      await wrapper.find(ACCOUNT_CARD).trigger('click');
      await wrapper.find(ACCOUNT_CARD).trigger('click');

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);
    });

    it('only one card can be expanded at a time', async () => {
      const wrapper = createWrapper([savingsAccount, checkingAccount]);
      const cards = wrapper.findAll(ACCOUNT_CARD);

      await cards[0].trigger('click');
      await cards[1].trigger('click');

      expect(wrapper.findAll(CARD_DETAIL)).toHaveLength(1);
      expect(cards[1].find(CARD_DETAIL).exists()).toBe(true);
    });
  });

  describe('expanded card detail', () => {
    it('shows institution name', async () => {
      const wrapper = createWrapper([savingsAccount]);

      await wrapper.find(ACCOUNT_CARD).trigger('click');

      expect(wrapper.find(CARD_DETAIL).text()).toContain('ABN Amro');
    });

    it('shows empty value when institution is missing', async () => {
      const wrapper = createWrapper([checkingAccount]);

      await wrapper.find(ACCOUNT_CARD).trigger('click');

      const institutionItem = wrapper.find('.detail-item--full');
      expect(institutionItem.text()).toContain('Institution');
      expect(institutionItem.find('.detail-value').text()).toBe('');
    });

    it('shows the closing balance', async () => {
      const wrapper = createWrapper([savingsAccount]);

      await wrapper.find(ACCOUNT_CARD).trigger('click');

      // closing_balance 100000 cents = 1,000.00
      expect(wrapper.find(CARD_DETAIL).text()).toContain('1,000.00');
    });

    it('shows the expected closing balance', async () => {
      const wrapper = createWrapper([savingsAccount]);

      await wrapper.find(ACCOUNT_CARD).trigger('click');

      // expected_closing_balance 90000 cents = 900.00
      expect(wrapper.find(CARD_DETAIL).text()).toContain('900.00');
    });

    it('shows closing date formatted', async () => {
      const wrapper = createWrapper([savingsAccount]);

      await wrapper.find(ACCOUNT_CARD).trigger('click');

      // 2026-03-24 → 24-03-2026
      expect(wrapper.find(CARD_DETAIL).text()).toContain('24-03-2026');
    });

    it('shows next closing date formatted', async () => {
      const wrapper = createWrapper([savingsAccount]);

      await wrapper.find(ACCOUNT_CARD).trigger('click');

      // 2026-04-24 → 24-04-2026
      expect(wrapper.find(CARD_DETAIL).text()).toContain('24-04-2026');
    });

    it('renders View Transactions button', async () => {
      const wrapper = createWrapper([savingsAccount]);

      await wrapper.find(ACCOUNT_CARD).trigger('click');

      expect(wrapper.find(VIEW_TRANSACTIONS_BTN).exists()).toBe(true);
    });

    it('View Transactions button navigates to transactions page', async () => {
      const wrapper = createWrapper([savingsAccount]);

      await wrapper.find(ACCOUNT_CARD).trigger('click');
      await wrapper.find(VIEW_TRANSACTIONS_BTN).trigger('click');

      expect(mockPush).toHaveBeenCalledWith('/transactions?bank_account_id=1');
    });

    it('clicking View Transactions does not collapse the card', async () => {
      const wrapper = createWrapper([savingsAccount]);

      await wrapper.find(ACCOUNT_CARD).trigger('click');
      await wrapper.find(VIEW_TRANSACTIONS_BTN).trigger('click');

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(true);
    });
  });

  describe('loans section', () => {
    it('renders loan cards when account has nested loans', async () => {
      const wrapper = createWrapper([houseWithLoans], 'Non Cash Assets');

      await wrapper.find(ACCOUNT_CARD).trigger('click');

      expect(wrapper.findAll(LOAN_CARD)).toHaveLength(2);
      expect(wrapper.text()).toContain('Mortgage A');
      expect(wrapper.text()).toContain('Mortgage B');
    });

    it('does not render loans section when account has no loans', async () => {
      const wrapper = createWrapper([savingsAccount]);

      await wrapper.find(ACCOUNT_CARD).trigger('click');

      expect(wrapper.find(LOAN_CARD).exists()).toBe(false);
    });

    it('renders equity row showing asset minus loan balances', async () => {
      const wrapper = createWrapper([houseWithLoans], 'Non Cash Assets');

      await wrapper.find(ACCOUNT_CARD).trigger('click');

      const equityRow = wrapper.find('.equity-row');
      expect(equityRow.exists()).toBe(true);
      expect(equityRow.text()).toContain('Equity');
      // 500000 + (-200000) + (-100000) = 200000 cents = 2,000.00
      expect(equityRow.text()).toContain('2,000.00');
    });
  });

  describe('totals footer', () => {
    it('renders the totals footer', () => {
      const wrapper = createWrapper([savingsAccount]);

      expect(wrapper.find(CATEGORY_TOTAL).exists()).toBe(true);
    });

    it('displays the summed current balance in the footer', () => {
      const wrapper = createWrapper([savingsAccount, checkingAccount]);

      // 110000 + 55000 = 165000 cents = 1,650.00
      expect(wrapper.find(CATEGORY_TOTAL).text()).toContain('1,650.00');
    });

    it('sums asset and nested loans in the footer total', () => {
      const wrapper = createWrapper([houseWithLoans], 'Non Cash Assets');

      // 500000 + (-200000) + (-100000) = 200000 cents = 2,000.00
      expect(wrapper.find(CATEGORY_TOTAL).text()).toContain('2,000.00');
    });
  });

  describe('dashIfZero prop', () => {
    it('passes dashIfZero to account balance displays', () => {
      const zeroAccount = buildAccountBalance({
        id: 5,
        name: 'Zero Account',
        current_balance: 0,
      });

      const wrapper = createWrapper([zeroAccount], 'Current Accounts', true);

      // When dashIfZero is true and balance is 0, EcMoneyDisplay renders a dash
      expect(wrapper.find(ACCOUNT_BALANCE).text()).toContain('—');
    });
  });

  describe('collapsible section', () => {
    it('hides account cards when collapsed', () => {
      const wrapper = createWrapper([savingsAccount], 'Current Accounts', false, false);

      expect(wrapper.find(ACCOUNT_CARD).exists()).toBe(false);
    });

    it('hides totals footer when collapsed', () => {
      const wrapper = createWrapper([savingsAccount], 'Current Accounts', false, false);

      expect(wrapper.find(CATEGORY_TOTAL).exists()).toBe(false);
    });

    it('shows heading with total when collapsed', () => {
      const wrapper = createWrapper([savingsAccount], 'Current Accounts', false, false);

      expect(wrapper.find('[data-testid="section-heading"]').text()).toContain('Current Accounts');
      expect(wrapper.find('[data-testid="section-heading"]').text()).toContain('1,100.00');
    });

    it('emits toggle when heading is clicked', async () => {
      const wrapper = createWrapper([savingsAccount], 'Current Accounts', false, false);

      await wrapper.find('[data-testid="section-heading"]').trigger('click');

      expect(wrapper.emitted('toggle')).toHaveLength(1);
    });

    it('shows account cards when expanded', () => {
      const wrapper = createWrapper([savingsAccount, checkingAccount]);

      expect(wrapper.findAll(ACCOUNT_CARD)).toHaveLength(2);
    });

    it('shows totals footer when expanded', () => {
      const wrapper = createWrapper([savingsAccount]);

      expect(wrapper.find(CATEGORY_TOTAL).exists()).toBe(true);
    });
  });
});
