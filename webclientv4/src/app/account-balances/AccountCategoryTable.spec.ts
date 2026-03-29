import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { RouterLinkStub } from '@vue/test-utils';
import AccountCategoryTable from './AccountCategoryTable.vue';
import type { AccountBalanceData } from './accountBalance.types';

const savingsAccount: AccountBalanceData = {
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
  institution: { id: 1, name: 'ABN Amro' },
};

const checkingAccount: AccountBalanceData = {
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
};

const sinkFundAccount: AccountBalanceData = {
  id: 3,
  name: 'Sink Fund',
  account_type: 'sink_fund',
  account_category: 'current',
  is_cash: true,
  closing_date: '2026-03-24',
  next_closing_date: '2026-04-24',
  closing_balance: 200000,
  expected_closing_balance: 180000,
  current_balance: 220000,
};

function createWrapper(heading: string, accounts: AccountBalanceData[]): VueWrapper {
  return mount(AccountCategoryTable, {
    props: { heading, accounts },
    global: {
      stubs: {
        'router-link': RouterLinkStub,
      },
      directives: {
        tooltip: () => {},
      },
    },
  });
}

describe('AccountCategoryTable', () => {
  describe('heading', () => {
    it('renders the heading with inline total', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      const heading = wrapper.find('.section-heading');
      expect(heading.text()).toContain('Current Accounts');
      expect(heading.text()).toContain('1,100.00');
    });

    it('renders summed total for multiple accounts', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount, checkingAccount]);

      const heading = wrapper.find('.section-heading');
      // 110000 + 55000 = 165000 cents = 1,650.00
      expect(heading.text()).toContain('1,650.00');
    });
  });

  describe('columns', () => {
    it('renders Name column header', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      expect(wrapper.find('thead').text()).toContain('Name');
    });

    it('renders Institution column header', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      expect(wrapper.find('thead').text()).toContain('Institution');
    });

    it('does not render Account Type column header', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      const headers = wrapper.findAll('thead th');
      const headerTexts = headers.map((h) => h.text());
      expect(headerTexts).not.toContain('Account Type');
    });

    it('does not render Category column header', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      const headers = wrapper.findAll('thead th');
      const headerTexts = headers.map((h) => h.text());
      expect(headerTexts).not.toContain('Category');
    });

    it('renders Balance At closing_date header from first account', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      expect(wrapper.find('thead').text()).toContain('Balance At');
      // closing_date is 2026-03-24 → "24-03-2026"
      expect(wrapper.find('thead').text()).toContain('24-03-2026');
    });

    it('renders Balance At next_closing_date header from first account', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      // the next_closing_date is 2026-04-24 → "24-04-2026"
      expect(wrapper.find('thead').text()).toContain('24-04-2026');
    });

    it('renders Current Balance column header', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      expect(wrapper.find('thead').text()).toContain('Current Balance');
    });

    it('shows empty date headers when accounts list is empty', () => {
      const wrapper = createWrapper('Current Accounts', []);

      const headers = wrapper.find('thead').text();
      expect(headers).not.toContain('Mar');
    });
  });

  describe('account rows', () => {
    it('renders a row for each account', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount, checkingAccount]);

      expect(wrapper.findAll('tbody tr').length).toBe(2);
    });

    it('renders account name as a router-link to transactions', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      const link = wrapper.findComponent(RouterLinkStub);
      expect(link.text()).toBe('Joint Savings');
      expect(link.props('to')).toBe('/transactions?bank_account_id=1');
    });

    it('renders institution name', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      const cells = wrapper.findAll('tbody tr:first-child td');
      expect(cells[1].text()).toBe('ABN Amro');
    });

    it('renders empty institution when not provided', () => {
      const wrapper = createWrapper('Current Accounts', [checkingAccount]);

      const cells = wrapper.findAll('tbody tr:first-child td');
      expect(cells[1].text()).toBe('');
    });

    it('renders closing_balance formatted', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      const cells = wrapper.findAll('tbody tr:first-child td');
      // 100000 cents = 1,000.00 (column index 2 after removing account_type/category)
      expect(cells[2].text()).toBe('1,000.00');
    });

    it('renders expected_closing_balance formatted', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      const cells = wrapper.findAll('tbody tr:first-child td');
      // 90000 cents = 900.00
      expect(cells[3].text()).toBe('900.00');
    });

    it('renders current_balance formatted', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      const cells = wrapper.findAll('tbody tr:first-child td');
      // 110000 cents = 1,100.00
      expect(cells[4].text()).toBe('1,100.00');
    });
  });

  describe('sink fund icon', () => {
    it('shows sink fund icon for sink_fund account_type', () => {
      const wrapper = createWrapper('Current Accounts', [sinkFundAccount]);

      expect(wrapper.find('.sink-fund-icon').exists()).toBe(true);
    });

    it('does not show sink fund icon for normal accounts', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount]);

      expect(wrapper.find('.sink-fund-icon').exists()).toBe(false);
    });
  });

  describe('footer totals', () => {
    it('renders total closing_balance', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount, checkingAccount]);

      const footerCells = wrapper.findAll('tfoot th');
      // 100000 + 50000 = 150000 cents = 1,500.00
      expect(footerCells[1].text()).toBe('1,500.00');
    });

    it('renders total expected_closing_balance', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount, checkingAccount]);

      const footerCells = wrapper.findAll('tfoot th');
      // 90000 + 45000 = 135000 cents = 1,350.00
      expect(footerCells[2].text()).toBe('1,350.00');
    });

    it('renders total current_balance', () => {
      const wrapper = createWrapper('Current Accounts', [savingsAccount, checkingAccount]);

      const footerCells = wrapper.findAll('tfoot th');
      // 110000 + 55000 = 165000 cents = 1,650.00
      expect(footerCells[3].text()).toBe('1,650.00');
    });

    it('renders zero totals when accounts is empty', () => {
      const wrapper = createWrapper('Current Accounts', []);

      const footerCells = wrapper.findAll('tfoot th');
      expect(footerCells[1].text()).toBe('0.00');
      expect(footerCells[2].text()).toBe('0.00');
      expect(footerCells[3].text()).toBe('0.00');
    });
  });
});
