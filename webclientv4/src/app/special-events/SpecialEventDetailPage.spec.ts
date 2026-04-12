import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { mount, VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import SpecialEventDetailPage from './SpecialEventDetailPage.vue';
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
const mockRouteParams = { id: '1' };
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: mockRouteParams, query: {} }),
}));

const eventWithAllocations: SpecialEventData = {
  id: 1,
  name: 'Birthday Party',
  budget_amount: 50000,
  actual_amount: 30000,
  start_date: '2026-06-15',
  allocations: [
    {
      id: 10,
      name: 'Decorations',
      budget_name: 'June 2026',
      allocation_category_name: 'Entertainment',
      amount: 20000,
      spent: 15000,
    },
    {
      id: 11,
      name: 'Food',
      budget_name: 'June 2026',
      allocation_category_name: 'Groceries',
      amount: 30000,
      spent: 15000,
    },
  ],
};

const mockStore = reactive({
  currentSpecialEvent: eventWithAllocations as SpecialEventData | null,
  loading: false,
  error: null as string | null,
  fetchOne: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
});

vi.mock('./specialEventStore', () => ({
  useSpecialEventStore: () => mockStore,
}));

const FormStub = {
  name: 'SpecialEventForm',
  template: '<div data-testid="event-form" />',
  props: ['visible', 'specialEvent'],
  emits: ['update:visible', 'save'],
};

function createWrapper(): VueWrapper {
  return mount(SpecialEventDetailPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: {
        SpecialEventForm: FormStub,
      },
    },
  });
}

describe('SpecialEventDetailPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.currentSpecialEvent = eventWithAllocations;
    mockStore.loading = false;
    mockStore.error = null;
    mockStore.fetchOne.mockResolvedValue(undefined);
    mockStore.update.mockResolvedValue(undefined);
    mockRouteParams.id = '1';
  });

  describe('on mount', () => {
    it('sets the page heading to "Special Event"', async () => {
      createWrapper();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Special Event');
    });

    it('calls fetchOne with the route param id', async () => {
      createWrapper();
      await nextTick();

      expect(mockStore.fetchOne).toHaveBeenCalledWith(1);
    });
  });

  describe('event header', () => {
    it('displays the event name', () => {
      const wrapper = createWrapper();

      const header = wrapper.find('[data-testid="event-header"]');
      expect(header.text()).toContain('Birthday Party');
    });

    it('displays the budget amount', () => {
      const wrapper = createWrapper();

      const header = wrapper.find('[data-testid="event-header"]');
      expect(header.text()).toContain('500.00');
    });

    it('displays the actual amount', () => {
      const wrapper = createWrapper();

      const header = wrapper.find('[data-testid="event-header"]');
      expect(header.text()).toContain('300.00');
    });

    it('displays the start date', () => {
      const wrapper = createWrapper();

      const header = wrapper.find('[data-testid="event-header"]');
      expect(header.text()).toContain('15-06-2026');
    });

    it('hides start date when not set', async () => {
      mockStore.currentSpecialEvent = {
        ...eventWithAllocations,
        start_date: undefined,
      };
      const wrapper = createWrapper();
      await nextTick();

      const header = wrapper.find('[data-testid="event-header"]');
      expect(header.text()).not.toContain('Start:');
    });
  });

  describe('allocations table', () => {
    it('renders allocation names', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Decorations');
      expect(wrapper.text()).toContain('Food');
    });

    it('renders budget names', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('June 2026');
    });

    it('renders allocation category names', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Entertainment');
      expect(wrapper.text()).toContain('Groceries');
    });

    it('renders formatted amounts', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('200.00');
      expect(wrapper.text()).toContain('300.00');
    });

    it('renders formatted spent values', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('150.00');
    });

    it('renders total spent in footer', () => {
      const wrapper = createWrapper();

      // Total spent: 15000 + 15000 = 30000 = 300.00
      const table = wrapper.find('[data-testid="allocations-table"]');
      expect(table.text()).toContain('300.00');
    });

    it('renders empty table when no allocations', async () => {
      mockStore.currentSpecialEvent = {
        ...eventWithAllocations,
        allocations: [],
      };
      const wrapper = createWrapper();
      await nextTick();

      const table = wrapper.find('[data-testid="allocations-table"]');
      expect(table.exists()).toBe(true);
    });
  });

  describe('back button', () => {
    it('navigates to the special events list', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="back-btn"]').trigger('click');

      expect(mockPush).toHaveBeenCalledWith({ name: 'special-events' });
    });

    it('has a title attribute', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find('[data-testid="back-btn"]');
      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });
  });

  describe('edit details button', () => {
    it('opens the form dialog with the current event', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      expect(form.props('visible')).toBe(true);
      expect(form.props('specialEvent')).toEqual(eventWithAllocations);
    });

    it('has a title attribute', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find('[data-testid="edit-btn"]');
      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });
  });

  describe('adjust allocations button', () => {
    it('navigates to the allocations page', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="adjust-allocations-btn"]').trigger('click');

      expect(mockPush).toHaveBeenCalledWith({
        name: 'special-event-allocations',
        params: { id: '1' },
      });
    });

    it('has a title attribute', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find('[data-testid="adjust-allocations-btn"]');
      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });
  });

  describe('refresh button', () => {
    it('calls fetchOne with the route param id', async () => {
      const wrapper = createWrapper();
      vi.clearAllMocks();

      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');

      expect(mockStore.fetchOne).toHaveBeenCalledWith(1);
    });

    it('is disabled while loading', () => {
      mockStore.loading = true;
      const wrapper = createWrapper();

      const btn = wrapper.find('[data-testid="refresh-btn"]');
      expect(btn.attributes('disabled')).toBeDefined();
    });

    it('has a title attribute', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find('[data-testid="refresh-btn"]');
      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });
  });

  describe('form submission', () => {
    it('calls store.update and fetchOne, then shows success notification', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      const updatedData = { id: 1, name: 'Updated Birthday', budget_amount: 60000 };
      await form.vm.$emit('save', updatedData);
      await flushPromises();

      expect(mockStore.update).toHaveBeenCalledWith(1, updatedData);
      expect(mockStore.fetchOne).toHaveBeenCalledWith(1);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Special event updated');
      expect(form.props('visible')).toBe(false);
    });

    it('shows error notification when update fails', async () => {
      const errorMessage = 'Update failed';
      mockStore.update.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });

      const wrapper = createWrapper();
      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      await form.vm.$emit('save', { id: 1, name: 'Fail Update' });
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
      expect(form.props('visible')).toBe(true);
    });

    it('does nothing when submitted data has no id', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      const form = wrapper.findComponent({ name: 'SpecialEventForm' });
      await form.vm.$emit('save', { name: 'No ID' });
      await nextTick();

      expect(mockStore.update).not.toHaveBeenCalled();
    });
  });
});
