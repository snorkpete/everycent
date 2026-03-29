import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount, VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import SpecialEventsPage from './SpecialEventsPage.vue';
import type { SpecialEventData } from './specialEvent.types';

const mockSetHeading = vi.fn();
vi.mock('../toolbar/headingStore', () => ({
  useHeadingStore: () => ({ setHeading: mockSetHeading }),
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

const event1: SpecialEventData = {
  id: 1,
  name: 'Birthday Party',
  budget_amount: 50000,
  actual_amount: 30000,
  start_date: '2026-06-15',
};

const event2: SpecialEventData = {
  id: 2,
  name: 'Wedding',
  budget_amount: 200000,
  actual_amount: 250000,
  start_date: '2026-12-01',
};

const mockStore = reactive({
  specialEvents: [event1, event2] as SpecialEventData[],
  loading: false,
  error: null as string | null,
  fetchAll: vi.fn().mockResolvedValue(undefined),
  create: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
});

vi.mock('./specialEventStore', () => ({
  useSpecialEventStore: () => mockStore,
}));

const FormStub = {
  name: 'SpecialEventForm',
  template: '<div data-testid="event-form" />',
  props: ['visible', 'specialEvent'],
  emits: ['update:visible', 'submit'],
};

const DialogStub = {
  name: 'Dialog',
  template: '<div data-testid="delete-dialog"><slot /><slot name="footer" /></div>',
  props: ['visible', 'header', 'modal', 'style'],
  emits: ['update:visible'],
};

function createWrapper(): VueWrapper {
  return mount(SpecialEventsPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: {
        SpecialEventForm: FormStub,
        Dialog: DialogStub,
      },
    },
  });
}

describe('SpecialEventsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.specialEvents = [event1, event2];
    mockStore.loading = false;
    mockStore.error = null;
    mockStore.fetchAll.mockResolvedValue(undefined);
    mockStore.create.mockResolvedValue(undefined);
    mockStore.update.mockResolvedValue(undefined);
    mockStore.remove.mockResolvedValue(undefined);
  });

  describe('on mount', () => {
    it('sets the page heading to "Special Events"', async () => {
      createWrapper();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Special Events');
    });

    it('calls fetchAll on mount', async () => {
      createWrapper();
      await nextTick();

      expect(mockStore.fetchAll).toHaveBeenCalled();
    });
  });

  describe('data table', () => {
    it('renders event names', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Birthday Party');
      expect(wrapper.text()).toContain('Wedding');
    });

    it('renders formatted budget amounts', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('500.00');
      expect(wrapper.text()).toContain('2,000.00');
    });

    it('renders formatted actual amounts', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('300.00');
      expect(wrapper.text()).toContain('2,500.00');
    });

    it('renders calculated difference', () => {
      const wrapper = createWrapper();

      // event1: 50000 - 30000 = 20000 = 200.00
      expect(wrapper.text()).toContain('200.00');
    });
  });

  describe('event name link', () => {
    it('navigates to the event detail page when clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="event-link-1"]').trigger('click');

      expect(mockPush).toHaveBeenCalledWith({ name: 'special-event-detail', params: { id: 1 } });
    });
  });

  describe('edit button', () => {
    it('opens the form dialog with the selected event', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="edit-btn-1"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      expect(form.props('visible')).toBe(true);
      expect(form.props('specialEvent')).toEqual(event1);
    });

    it('has a title attribute', () => {
      const wrapper = createWrapper();

      const editBtn = wrapper.find('[data-testid="edit-btn-1"]');
      expect(editBtn.attributes('title')).toBeTruthy();
    });
  });

  describe('add button', () => {
    it('opens the form dialog with null event', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      expect(form.props('visible')).toBe(true);
      expect(form.props('specialEvent')).toBeNull();
    });
  });

  describe('delete button', () => {
    it('opens the delete confirmation dialog', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');

      expect(wrapper.text()).toContain('Birthday Party');
      const dialog = wrapper
        .findAllComponents({ name: 'Dialog' })
        .find((c) => c.props('header') === 'Confirm Delete');
      expect(dialog?.props('visible')).toBe(true);
    });

    it('has a title attribute', () => {
      const wrapper = createWrapper();

      const deleteBtn = wrapper.find('[data-testid="delete-btn-1"]');
      expect(deleteBtn.attributes('title')).toBeTruthy();
    });
  });

  describe('confirm delete', () => {
    it('calls store.remove and shows success notification', async () => {
      const wrapper = createWrapper();

      // Open delete dialog
      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');
      await nextTick();

      // Confirm delete
      await wrapper.find('[data-testid="confirm-delete-btn"]').trigger('click');
      await nextTick();

      expect(mockStore.remove).toHaveBeenCalledWith(1);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Special event deleted');
    });

    it('shows error notification when delete fails', async () => {
      const errorMessage = 'Delete failed';
      mockStore.remove.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });

      const wrapper = createWrapper();
      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');
      await nextTick();
      await wrapper.find('[data-testid="confirm-delete-btn"]').trigger('click');
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });

    it('cancel button closes the delete dialog', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');
      await nextTick();

      await wrapper.find('[data-testid="cancel-delete-btn"]').trigger('click');
      await nextTick();

      const dialog = wrapper
        .findAllComponents({ name: 'Dialog' })
        .find((c) => c.props('header') === 'Confirm Delete');
      expect(dialog?.props('visible')).toBe(false);
    });
  });

  describe('form submission', () => {
    it('calls store.create for a new event and shows success', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      const newEventData = { name: 'New Event', budget_amount: 10000 };
      await form.vm.$emit('submit', newEventData);
      await nextTick();

      expect(mockStore.create).toHaveBeenCalledWith(newEventData);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Special event created');
      expect(form.props('visible')).toBe(false);
    });

    it('calls store.update for an existing event and shows success', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="edit-btn-1"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      const updatedData = { id: 1, name: 'Updated Birthday', budget_amount: 60000 };
      await form.vm.$emit('submit', updatedData);
      await nextTick();

      expect(mockStore.update).toHaveBeenCalledWith(1, {
        name: 'Updated Birthday',
        budget_amount: 60000,
      });
      expect(mockNotifySuccess).toHaveBeenCalledWith('Special event updated');
      expect(form.props('visible')).toBe(false);
    });

    it('shows error notification when create fails', async () => {
      const errorMessage = 'Create failed';
      mockStore.create.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });

      const wrapper = createWrapper();
      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      await form.vm.$emit('submit', { name: 'Failing Event' });
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
      expect(form.props('visible')).toBe(true);
    });

    it('shows error notification when update fails', async () => {
      const errorMessage = 'Update failed';
      mockStore.update.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });

      const wrapper = createWrapper();
      await wrapper.find('[data-testid="edit-btn-1"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      await form.vm.$emit('submit', { id: 1, name: 'Fail Update' });
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
      expect(form.props('visible')).toBe(true);
    });
  });

  describe('refresh button', () => {
    it('calls fetchAll', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');

      expect(mockStore.fetchAll).toHaveBeenCalledTimes(2); // once on mount, once on refresh
    });

    it('is disabled while loading', () => {
      mockStore.loading = true;
      const wrapper = createWrapper();

      const refreshBtn = wrapper.find('[data-testid="refresh-btn"]');
      expect(refreshBtn.attributes('disabled')).toBeDefined();
    });
  });
});
