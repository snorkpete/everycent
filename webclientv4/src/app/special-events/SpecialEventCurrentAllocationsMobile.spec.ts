import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import SpecialEventCurrentAllocationsMobile from './SpecialEventCurrentAllocationsMobile.vue';
import { buildSpecialEventAllocation } from '../../test/factories';

const allocation1 = buildSpecialEventAllocation({
  id: 1,
  name: 'Hotel',
  spent: 25000,
});

const allocation2 = buildSpecialEventAllocation({
  id: 2,
  name: 'Flights',
  spent: 18000,
});

function createWrapper(
  overrides: { allocations?: (typeof allocation1)[]; totalSpent?: number } = {},
): VueWrapper {
  return mount(SpecialEventCurrentAllocationsMobile, {
    props: {
      allocations: overrides.allocations ?? [allocation1, allocation2],
      totalSpent: overrides.totalSpent ?? 43000,
    },
    global: { plugins: [PrimeVue] },
  });
}

describe('SpecialEventCurrentAllocationsMobile', () => {
  describe('allocation cards', () => {
    it('renders a card for each allocation', () => {
      const wrapper = createWrapper();

      expect(wrapper.findAll('[data-testid="current-allocation-card"]')).toHaveLength(2);
    });

    it('displays allocation names', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Hotel');
      expect(wrapper.text()).toContain('Flights');
    });

    it('displays spent amounts', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('250.00');
      expect(wrapper.text()).toContain('180.00');
    });
  });

  describe('remove button', () => {
    it('emits remove when clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="remove-btn-1"]').trigger('click');

      expect(wrapper.emitted('remove')).toEqual([[allocation1]]);
    });

    it('has a tooltip', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find('[data-testid="remove-btn-1"]');
      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });
  });

  describe('total spent', () => {
    it('displays the total spent', () => {
      const wrapper = createWrapper();

      const total = wrapper.find('[data-testid="total-spent"]');
      expect(total.text()).toContain('430.00');
    });

    it('hides total when no allocations', () => {
      const wrapper = createWrapper({ allocations: [], totalSpent: 0 });

      expect(wrapper.find('[data-testid="total-spent"]').exists()).toBe(false);
    });
  });

  describe('empty state', () => {
    it('shows empty message when no allocations', () => {
      const wrapper = createWrapper({ allocations: [], totalSpent: 0 });

      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
    });

    it('hides empty message when allocations exist', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false);
    });
  });
});
