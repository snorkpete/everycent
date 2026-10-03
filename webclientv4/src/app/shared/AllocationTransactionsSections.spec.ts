import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import AllocationTransactionsSections from './AllocationTransactionsSections.vue';
import type { AllocationTransactionSection } from './allocationTransactions.types';
import type { TransactionData } from '../transactions/transaction.types';

const SECTION = '[data-testid="transactions-section"]';
const SECTION_HEADING = '[data-testid="section-heading"]';
const SECTION_EMPTY = '[data-testid="section-empty"]';
const SUBTOTAL_ROW = '[data-testid="subtotal-row"]';
const GRAND_TOTAL_ROW = '[data-testid="grand-total-row"]';
const TRANSACTION_ROW = '[data-testid="transaction-row"]';

const julyTransactions: TransactionData[] = [
  { id: 1, transaction_date: '2024-07-02', description: 'Supermarket', net_amount: -5000 },
  { id: 2, transaction_date: '2024-07-09', description: 'Corner store', net_amount: -1500 },
];
const augustTransactions: TransactionData[] = [
  { id: 3, transaction_date: '2024-08-02', description: 'Bakery', net_amount: -2000 },
  { id: 4, transaction_date: '2024-08-03', description: 'Refund' },
];

const julySection: AllocationTransactionSection = {
  allocation: { id: 1, name: 'Food', label: 'Jul 2024' },
  transactions: julyTransactions,
};
const augustSection: AllocationTransactionSection = {
  allocation: { id: 2, name: 'Food', label: 'Aug 2024' },
  transactions: augustTransactions,
};

function createWrapper(sections: AllocationTransactionSection[]): VueWrapper {
  return mount(AllocationTransactionsSections, {
    props: { sections },
    global: { plugins: [PrimeVue] },
  });
}

describe('AllocationTransactionsSections', () => {
  it('renders one section per allocation', () => {
    const wrapper = createWrapper([julySection, augustSection]);

    expect(wrapper.findAll(SECTION)).toHaveLength(2);
  });

  it('headlines each section with its label', () => {
    const wrapper = createWrapper([julySection, augustSection]);

    const headings = wrapper.findAll(SECTION_HEADING);
    expect(headings.map((heading) => heading.text())).toEqual(['Jul 2024', 'Aug 2024']);
  });

  it('falls back to the allocation name when there is no label', () => {
    const wrapper = createWrapper([
      { allocation: { id: 1, name: 'Food' }, transactions: julyTransactions },
    ]);

    expect(wrapper.find(SECTION_HEADING).text()).toBe('Food');
  });

  it('renders a row for each transaction in its section', () => {
    const wrapper = createWrapper([julySection, augustSection]);

    expect(wrapper.findAll(TRANSACTION_ROW)).toHaveLength(4);
    expect(wrapper.findAll(SECTION)[0].text()).toContain('Supermarket');
    expect(wrapper.findAll(SECTION)[1].text()).toContain('Bakery');
  });

  it('shows a subtotal per section', () => {
    const wrapper = createWrapper([julySection, augustSection]);

    const subtotals = wrapper.findAll(SUBTOTAL_ROW);
    expect(subtotals[0].text()).toContain('-65.00');
    expect(subtotals[1].text()).toContain('-20.00');
  });

  it('shows a grand total when there is more than one section', () => {
    const wrapper = createWrapper([julySection, augustSection]);

    expect(wrapper.find(GRAND_TOTAL_ROW).text()).toContain('-85.00');
  });

  it('omits the grand total for a single section', () => {
    const wrapper = createWrapper([julySection]);

    expect(wrapper.find(GRAND_TOTAL_ROW).exists()).toBe(false);
  });

  it('shows a muted line for a section without transactions', () => {
    const wrapper = createWrapper([
      julySection,
      { allocation: augustSection.allocation, transactions: [] },
    ]);

    expect(wrapper.findAll(SECTION_EMPTY)).toHaveLength(1);
    expect(wrapper.findAll(SUBTOTAL_ROW)).toHaveLength(1);
  });
});
