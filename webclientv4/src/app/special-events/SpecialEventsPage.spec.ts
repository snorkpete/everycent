import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import SpecialEventsPage from './SpecialEventsPage.vue';
import { specialEventApi } from './specialEventApi';
import { useHeadingStore } from '../toolbar/headingStore';
import { DialogStub } from '../../test/stubs';
import { buildSpecialEvent } from '../../test/factories';

vi.mock('./specialEventApi', () => ({
  specialEventApi: {
    getAll: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateAllocations: vi.fn(),
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

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ path: '/special-events', query: {} }),
}));

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

const FormStub = {
  name: 'SpecialEventForm',
  template: '<div data-testid="event-form" />',
  props: ['visible', 'specialEvent'],
  emits: ['update:visible', 'submit'],
};

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(SpecialEventsPage, {
    global: {
      plugins: [PrimeVue, pinia],
      stubs: {
        SpecialEventForm: FormStub,
        Dialog: DialogStub,
      },
    },
  });
}

describe('SpecialEventsPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    vi.mocked(specialEventApi.getAll).mockResolvedValue([event1, event2]);
    vi.mocked(specialEventApi.create).mockResolvedValue(event1);
    vi.mocked(specialEventApi.update).mockResolvedValue(event1);
    vi.mocked(specialEventApi.delete).mockResolvedValue(undefined as never);
  });

  describe('on mount', () => {
    it('sets the page heading to "Special Events"', async () => {
      createWrapper(pinia);
      await flushPromises();

      const headingStore = useHeadingStore();
      expect(headingStore.heading).toBe('Special Events');
    });

    it('calls specialEventApi.getAll on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(specialEventApi.getAll).toHaveBeenCalled();
    });
  });

  describe('data table', () => {
    it('renders event names', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Birthday Party');
      expect(wrapper.text()).toContain('Wedding');
    });

    it('renders formatted budget amounts', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('500.00');
      expect(wrapper.text()).toContain('2,000.00');
    });

    it('renders formatted actual amounts', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('300.00');
      expect(wrapper.text()).toContain('2,500.00');
    });

    it('renders calculated difference', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      // event1: 50000 - 30000 = 20000 = 200.00
      expect(wrapper.text()).toContain('200.00');
    });
  });

  describe('event name link', () => {
    it('navigates to the event detail page when clicked', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="event-link-1"]').trigger('click');

      expect(mockPush).toHaveBeenCalledWith({ name: 'special-event-detail', params: { id: 1 } });
    });
  });

  describe('edit button', () => {
    it('opens the form dialog with the selected event', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn-1"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      expect(form.props('visible')).toBe(true);
      expect(form.props('specialEvent')).toEqual(event1);
    });

    it('has a tooltip', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const editBtn = wrapper.find('[data-testid="edit-btn-1"]');
      expect(editBtn.attributes('data-pd-tooltip')).toBeTruthy();
    });
  });

  describe('add button', () => {
    it('opens the form dialog with null event', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      expect(form.props('visible')).toBe(true);
      expect(form.props('specialEvent')).toBeNull();
    });
  });

  describe('delete button', () => {
    it('opens the delete confirmation dialog', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');

      expect(wrapper.text()).toContain('Birthday Party');
      const dialog = wrapper
        .findAllComponents({ name: 'Dialog' })
        .find((c) => c.props('header') === 'Confirm Delete');
      expect(dialog?.props('visible')).toBe(true);
    });

    it('has a tooltip', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const deleteBtn = wrapper.find('[data-testid="delete-btn-1"]');
      expect(deleteBtn.attributes('data-pd-tooltip')).toBeTruthy();
    });
  });

  describe('confirm delete', () => {
    it('calls specialEventApi.delete and shows success notification', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      // Open delete dialog
      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');

      // Confirm delete
      await wrapper.find('[data-testid="confirm-delete-btn"]').trigger('click');
      await flushPromises();

      expect(specialEventApi.delete).toHaveBeenCalledWith(1);
      expect(specialEventApi.getAll).toHaveBeenCalledTimes(2); // once on mount, once after delete
      expect(mockNotifySuccess).toHaveBeenCalledWith('Special event deleted');
    });

    it('shows error notification when delete fails', async () => {
      vi.mocked(specialEventApi.delete).mockRejectedValue(new Error('Server error'));

      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');
      await wrapper.find('[data-testid="confirm-delete-btn"]').trigger('click');
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
    });

    it('cancel button closes the delete dialog', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');

      await wrapper.find('[data-testid="cancel-delete-btn"]').trigger('click');

      const dialog = wrapper
        .findAllComponents({ name: 'Dialog' })
        .find((c) => c.props('header') === 'Confirm Delete');
      expect(dialog?.props('visible')).toBe(false);
    });
  });

  describe('form submission', () => {
    it('calls specialEventApi.create for a new event and shows success', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      const newEventData = { name: 'New Event', budget_amount: 10000 };
      await form.vm.$emit('submit', newEventData);
      await flushPromises();

      expect(specialEventApi.create).toHaveBeenCalledWith(newEventData);
      expect(specialEventApi.getAll).toHaveBeenCalledTimes(2); // once on mount, once after create
      expect(mockNotifySuccess).toHaveBeenCalledWith('Special event created');
      expect(form.props('visible')).toBe(false);
    });

    it('calls specialEventApi.update for an existing event and shows success', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn-1"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      const updatedData = { id: 1, name: 'Updated Birthday', budget_amount: 60000 };
      await form.vm.$emit('submit', updatedData);
      await flushPromises();

      expect(specialEventApi.update).toHaveBeenCalledWith(1, {
        name: 'Updated Birthday',
        budget_amount: 60000,
      });
      expect(specialEventApi.getAll).toHaveBeenCalledTimes(2); // once on mount, once after update
      expect(mockNotifySuccess).toHaveBeenCalledWith('Special event updated');
      expect(form.props('visible')).toBe(false);
    });

    it('shows error notification when create fails', async () => {
      vi.mocked(specialEventApi.create).mockRejectedValue(new Error('Server error'));

      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      await form.vm.$emit('submit', { name: 'Failing Event' });
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
      expect(form.props('visible')).toBe(true);
    });

    it('shows error notification when update fails', async () => {
      vi.mocked(specialEventApi.update).mockRejectedValue(new Error('Server error'));

      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn-1"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      await form.vm.$emit('submit', { id: 1, name: 'Fail Update' });
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
      expect(form.props('visible')).toBe(true);
    });
  });

  describe('refresh button', () => {
    it('calls specialEventApi.getAll', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');
      await flushPromises();

      expect(specialEventApi.getAll).toHaveBeenCalledTimes(2); // once on mount, once on refresh
    });

    it('is disabled while loading', async () => {
      // Make getAll hang so loading stays true
      vi.mocked(specialEventApi.getAll).mockReturnValue(new Promise(() => {}));

      const wrapper = createWrapper(pinia);
      // Don't flush — loading is still in progress
      // Need a tick for the component to render with loading state
      await flushPromises().catch(() => {});

      const refreshBtn = wrapper.find('[data-testid="refresh-btn"]');
      expect(refreshBtn.attributes('data-p-disabled')).toBe('true');
    });
  });
});
