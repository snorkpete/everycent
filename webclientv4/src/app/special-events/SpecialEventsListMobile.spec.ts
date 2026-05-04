import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import SpecialEventsListMobile from './SpecialEventsListMobile.vue';
import { buildSpecialEvent } from '../../test/factories';

const event1 = buildSpecialEvent({
  id: 1,
  name: 'Birthday Party',
  budget_amount: 50000,
  actual_amount: 30000,
  start_date: '2026-06-15',
});

const event2 = buildSpecialEvent({
  id: 2,
  name: 'Wedding',
  budget_amount: 200000,
  actual_amount: 250000,
  start_date: '2026-12-01',
});

const eventWithoutDate = buildSpecialEvent({
  id: 3,
  name: 'No Date Event',
  budget_amount: 10000,
  actual_amount: 0,
  start_date: undefined,
});

function createWrapper(specialEvents = [event1, event2]): VueWrapper {
  return mount(SpecialEventsListMobile, {
    props: { specialEvents },
    global: { plugins: [PrimeVue] },
  });
}

describe('SpecialEventsListMobile', () => {
  describe('card rendering', () => {
    it('renders a card for each event', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('[data-testid="event-card"]');
      expect(cards).toHaveLength(2);
    });

    it('displays event names', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Birthday Party');
      expect(wrapper.text()).toContain('Wedding');
    });

    it('displays formatted start dates', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('15-06-2026');
      expect(wrapper.text()).toContain('01-12-2026');
    });

    it('hides date when start_date is undefined', () => {
      const wrapper = createWrapper([eventWithoutDate]);

      const card = wrapper.find('[data-testid="event-card"]');
      expect(card.find('.card-date').exists()).toBe(false);
    });

    it('shows a right chevron on collapsed cards', () => {
      const wrapper = createWrapper();

      const chevron = wrapper.find('.card-chevron');
      expect(chevron.classes()).toContain('pi-chevron-right');
    });
  });

  describe('expand and collapse', () => {
    it('expands a card when clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="event-card"]').trigger('click');

      expect(wrapper.find('[data-testid="card-detail"]').exists()).toBe(true);
    });

    it('shows a down chevron on the expanded card', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="event-card"]').trigger('click');

      const chevron = wrapper.find('.card-chevron');
      expect(chevron.classes()).toContain('pi-chevron-down');
    });

    it('collapses an expanded card when clicked again', async () => {
      const wrapper = createWrapper();
      const card = wrapper.find('[data-testid="event-card"]');

      await card.trigger('click');
      expect(wrapper.find('[data-testid="card-detail"]').exists()).toBe(true);

      await card.trigger('click');
      expect(wrapper.find('[data-testid="card-detail"]').exists()).toBe(false);
    });

    it('collapses the previous card when a different card is expanded', async () => {
      const wrapper = createWrapper();
      const cards = wrapper.findAll('[data-testid="event-card"]');

      await cards[0].trigger('click');
      expect(wrapper.findAll('[data-testid="card-detail"]')).toHaveLength(1);

      await cards[1].trigger('click');
      const details = wrapper.findAll('[data-testid="card-detail"]');
      expect(details).toHaveLength(1);
      expect(cards[1].find('[data-testid="card-detail"]').exists()).toBe(true);
    });
  });

  describe('expanded detail', () => {
    it('displays budget amount', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="event-card"]').trigger('click');

      const budget = wrapper.find('[data-testid="detail-budget"]');
      expect(budget.text()).toContain('500.00');
    });

    it('displays actual amount', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="event-card"]').trigger('click');

      const actual = wrapper.find('[data-testid="detail-actual"]');
      expect(actual.text()).toContain('300.00');
    });

    it('displays calculated difference', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="event-card"]').trigger('click');

      const difference = wrapper.find('[data-testid="detail-difference"]');
      expect(difference.text()).toContain('200.00');
    });
  });

  describe('action buttons', () => {
    it('emits view when View button is clicked', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="event-card"]').trigger('click');

      await wrapper.find('[data-testid="view-btn-1"]').trigger('click');

      expect(wrapper.emitted('view')).toEqual([[event1]]);
    });

    it('emits edit when edit button is clicked', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="event-card"]').trigger('click');

      await wrapper.find('[data-testid="edit-btn-1"]').trigger('click');

      expect(wrapper.emitted('edit')).toEqual([[event1]]);
    });

    it('emits delete when delete button is clicked', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="event-card"]').trigger('click');

      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');

      expect(wrapper.emitted('delete')).toEqual([[event1]]);
    });

    it('does not collapse the card when an action button is clicked', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="event-card"]').trigger('click');

      await wrapper.find('[data-testid="view-btn-1"]').trigger('click');

      expect(wrapper.find('[data-testid="card-detail"]').exists()).toBe(true);
    });

    it('action buttons have tooltips', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="event-card"]').trigger('click');

      const viewBtn = wrapper.find('[data-testid="view-btn-1"]');
      const editBtn = wrapper.find('[data-testid="edit-btn-1"]');
      const deleteBtn = wrapper.find('[data-testid="delete-btn-1"]');

      expect(viewBtn.attributes('data-pd-tooltip')).toBeTruthy();
      expect(editBtn.attributes('data-pd-tooltip')).toBeTruthy();
      expect(deleteBtn.attributes('data-pd-tooltip')).toBeTruthy();
    });
  });
});
