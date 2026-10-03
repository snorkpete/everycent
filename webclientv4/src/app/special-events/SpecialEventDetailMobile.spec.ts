import { describe, it, expect, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import SpecialEventDetailMobile from './SpecialEventDetailMobile.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import { budgetApi } from '../budgets/budgetApi';
import { buildSpecialEvent, buildSpecialEventAllocation } from '../../test/factories';
import { getTooltipValue } from '../../test/tooltip-helper';
import { DialogStub } from '../../test/stubs';
import type { SpecialEventAllocationData } from './specialEvent.types';

const ALLOCATION_CARD = '[data-testid="allocation-card"]';
const CARD_DETAIL = '[data-testid="card-detail"]';
const SHOW_TRANSACTIONS_BTN = '[data-testid="show-transactions-btn"]';

vi.mock('../budgets/budgetApi', () => ({
  budgetApi: {
    getTransactionsForAllocation: vi.fn().mockResolvedValue([]),
  },
}));

const allocation1 = buildSpecialEventAllocation({
  id: 1,
  name: 'Hotel',
  amount: 30000,
  spent: 25000,
  budget_name: 'Aug 2024',
  allocation_category_name: 'Travel',
});

const allocation2 = buildSpecialEventAllocation({
  id: 2,
  name: 'Flights',
  amount: 20000,
  spent: 18000,
  budget_name: 'Jul 2024',
  allocation_category_name: 'Travel',
});

const event = buildSpecialEvent({
  id: 1,
  name: 'UK Stonehenge 2024',
  budget_amount: 300000,
  actual_amount: 286313,
  start_date: '2024-08-01',
  allocations: [allocation1, allocation2],
});

function createWrapper(
  overrides: {
    event?: typeof event | null;
    allocations?: SpecialEventAllocationData[];
    totalSpent?: number;
  } = {},
): VueWrapper {
  return mount(SpecialEventDetailMobile, {
    props: {
      event: overrides.event ?? event,
      allocations: overrides.allocations ?? [allocation1, allocation2],
      totalSpent: overrides.totalSpent ?? 43000,
    },
    global: { plugins: [PrimeVue], stubs: { Dialog: DialogStub } },
  });
}

describe('SpecialEventDetailMobile', () => {
  describe('header card', () => {
    it('displays the event name', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.event-name').text()).toBe('UK Stonehenge 2024');
    });

    it('displays budget amount', () => {
      const wrapper = createWrapper();

      const budget = wrapper.find('[data-testid="summary-budget"]');
      expect(budget.text()).toContain('3,000.00');
    });

    it('displays actual amount', () => {
      const wrapper = createWrapper();

      const actual = wrapper.find('[data-testid="summary-actual"]');
      expect(actual.text()).toContain('2,863.13');
    });

    it('displays start date', () => {
      const wrapper = createWrapper();

      const date = wrapper.find('[data-testid="summary-date"]');
      expect(date.text()).toContain('01-08-2024');
    });

    it('hides start date when not set', () => {
      const noDateEvent = buildSpecialEvent({ start_date: undefined });
      const wrapper = createWrapper({ event: noDateEvent });

      expect(wrapper.find('[data-testid="summary-date"]').exists()).toBe(false);
    });

    it('displays total spent', () => {
      const wrapper = createWrapper();

      const spent = wrapper.find('[data-testid="summary-spent"]');
      expect(spent.text()).toContain('430.00');
    });
  });

  describe('allocation cards', () => {
    it('renders a card for each allocation', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll(ALLOCATION_CARD);
      expect(cards).toHaveLength(2);
    });

    it('displays allocation names', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Hotel');
      expect(wrapper.text()).toContain('Flights');
    });

    it('displays spent amount on each card', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll(ALLOCATION_CARD);
      expect(cards[0].text()).toContain('250.00');
      expect(cards[1].text()).toContain('180.00');
    });
  });

  describe('show transactions eye icon', () => {
    it('renders an eye button on each allocation card', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll(ALLOCATION_CARD);
      expect(cards[0].find(SHOW_TRANSACTIONS_BTN).exists()).toBe(true);
      expect(cards[1].find(SHOW_TRANSACTIONS_BTN).exists()).toBe(true);
    });

    it('has a tooltip on the eye button', () => {
      const wrapper = createWrapper();

      const button = wrapper.find(SHOW_TRANSACTIONS_BTN);
      expect(getTooltipValue(button)).toBe('Show transactions for this allocation');
    });

    it('opens the transactions dialog for the clicked allocation', async () => {
      const wrapper = createWrapper();
      const cards = wrapper.findAll(ALLOCATION_CARD);

      await cards[1].find(SHOW_TRANSACTIONS_BTN).trigger('click');

      const dialog = wrapper.findComponent(AllocationTransactionsDialog);
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('allocationId')).toBe(2);
      expect(dialog.props('allocationName')).toBe('Flights');
    });

    it('wires the dialog to the budget allocation transactions endpoint', () => {
      const wrapper = createWrapper();

      const dialog = wrapper.findComponent(AllocationTransactionsDialog);
      expect(dialog.props('fetchTransactions')).toBe(budgetApi.getTransactionsForAllocation);
    });

    it('does not expand the card when the eye button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(SHOW_TRANSACTIONS_BTN).trigger('click');

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);
    });

    it('falls back to empty id and name when the allocation has none', async () => {
      const wrapper = createWrapper({
        allocations: [buildSpecialEventAllocation({ id: undefined, name: undefined })],
      });

      await wrapper.find(SHOW_TRANSACTIONS_BTN).trigger('click');

      const dialog = wrapper.findComponent(AllocationTransactionsDialog);
      expect(dialog.props('allocationId')).toBe(0);
      expect(dialog.props('allocationName')).toBe('');
    });

    it('closes the dialog when it emits update:visible false', async () => {
      const wrapper = createWrapper();
      await wrapper.find(SHOW_TRANSACTIONS_BTN).trigger('click');

      const dialog = wrapper.findComponent(AllocationTransactionsDialog);
      await dialog.vm.$emit('update:visible', false);

      expect(dialog.props('visible')).toBe(false);
    });
  });

  describe('expand and collapse', () => {
    it('expands a card when clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(ALLOCATION_CARD).trigger('click');

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(true);
    });

    it('shows budget name in expanded detail', async () => {
      const wrapper = createWrapper();

      await wrapper.find(ALLOCATION_CARD).trigger('click');

      const budgetName = wrapper.find('[data-testid="detail-budget-name"]');
      expect(budgetName.text()).toContain('Aug 2024');
    });

    it('shows category in expanded detail', async () => {
      const wrapper = createWrapper();

      await wrapper.find(ALLOCATION_CARD).trigger('click');

      const category = wrapper.find('[data-testid="detail-category"]');
      expect(category.text()).toContain('Travel');
    });

    it('shows budgeted amount in expanded detail', async () => {
      const wrapper = createWrapper();

      await wrapper.find(ALLOCATION_CARD).trigger('click');

      const amount = wrapper.find('[data-testid="detail-amount"]');
      expect(amount.text()).toContain('300.00');
    });

    it('collapses when clicked again', async () => {
      const wrapper = createWrapper();
      const card = wrapper.find(ALLOCATION_CARD);

      await card.trigger('click');
      expect(wrapper.find(CARD_DETAIL).exists()).toBe(true);

      await card.trigger('click');
      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);
    });

    it('collapses previous card when a different card is expanded', async () => {
      const wrapper = createWrapper();
      const cards = wrapper.findAll(ALLOCATION_CARD);

      await cards[0].trigger('click');
      expect(wrapper.findAll(CARD_DETAIL)).toHaveLength(1);

      await cards[1].trigger('click');
      expect(wrapper.findAll(CARD_DETAIL)).toHaveLength(1);
      expect(cards[1].find(CARD_DETAIL).exists()).toBe(true);
    });
  });

  describe('empty state', () => {
    it('shows empty message when no allocations', () => {
      const wrapper = createWrapper({ allocations: [], totalSpent: 0 });

      expect(wrapper.find('.detail-mobile > [data-testid="empty-state"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('No allocations yet');
    });

    it('does not show empty message when allocations exist', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.detail-mobile > [data-testid="empty-state"]').exists()).toBe(false);
    });
  });
});
