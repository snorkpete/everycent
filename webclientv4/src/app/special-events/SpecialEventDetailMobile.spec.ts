import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import SpecialEventDetailMobile from './SpecialEventDetailMobile.vue';
import { buildSpecialEvent, buildSpecialEventAllocation } from '../../test/factories';
import type { SpecialEventAllocationData } from './specialEvent.types';

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
    global: { plugins: [PrimeVue] },
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

      const cards = wrapper.findAll('[data-testid="allocation-card"]');
      expect(cards).toHaveLength(2);
    });

    it('displays allocation names', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Hotel');
      expect(wrapper.text()).toContain('Flights');
    });

    it('displays spent amount on each card', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('[data-testid="allocation-card"]');
      expect(cards[0].text()).toContain('250.00');
      expect(cards[1].text()).toContain('180.00');
    });
  });

  describe('expand and collapse', () => {
    it('expands a card when clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="allocation-card"]').trigger('click');

      expect(wrapper.find('[data-testid="card-detail"]').exists()).toBe(true);
    });

    it('shows budget name in expanded detail', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="allocation-card"]').trigger('click');

      const budgetName = wrapper.find('[data-testid="detail-budget-name"]');
      expect(budgetName.text()).toContain('Aug 2024');
    });

    it('shows category in expanded detail', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="allocation-card"]').trigger('click');

      const category = wrapper.find('[data-testid="detail-category"]');
      expect(category.text()).toContain('Travel');
    });

    it('shows budgeted amount in expanded detail', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="allocation-card"]').trigger('click');

      const amount = wrapper.find('[data-testid="detail-amount"]');
      expect(amount.text()).toContain('300.00');
    });

    it('collapses when clicked again', async () => {
      const wrapper = createWrapper();
      const card = wrapper.find('[data-testid="allocation-card"]');

      await card.trigger('click');
      expect(wrapper.find('[data-testid="card-detail"]').exists()).toBe(true);

      await card.trigger('click');
      expect(wrapper.find('[data-testid="card-detail"]').exists()).toBe(false);
    });

    it('collapses previous card when a different card is expanded', async () => {
      const wrapper = createWrapper();
      const cards = wrapper.findAll('[data-testid="allocation-card"]');

      await cards[0].trigger('click');
      expect(wrapper.findAll('[data-testid="card-detail"]')).toHaveLength(1);

      await cards[1].trigger('click');
      expect(wrapper.findAll('[data-testid="card-detail"]')).toHaveLength(1);
      expect(cards[1].find('[data-testid="card-detail"]').exists()).toBe(true);
    });
  });

  describe('empty state', () => {
    it('shows empty message when no allocations', () => {
      const wrapper = createWrapper({ allocations: [], totalSpent: 0 });

      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('No allocations yet');
    });

    it('does not show empty message when allocations exist', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false);
    });
  });
});
