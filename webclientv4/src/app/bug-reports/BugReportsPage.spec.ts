import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import BugReportsPage from './BugReportsPage.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { useBugReportStore } from './bugReportStore';
import apiGateway from '../../api/api-gateway';
import { buildApiGatewayMock } from '../../test/buildApiGatewayMock';
import { buildBugReport } from '../../test/factories';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockNotifySuccess = vi.fn();
const mockNotifyError = vi.fn();
vi.mock('../notifications/useNotifications', () => ({
  useNotifications: () => ({
    success: mockNotifySuccess,
    error: mockNotifyError,
    info: vi.fn(),
  }),
}));

const mockApiGateway = buildApiGatewayMock();

const defaultReports = [
  buildBugReport({ id: 1, title: 'Login fails', status: 'open', reporter_name: 'Jane Smith' }),
  buildBugReport({
    id: 2,
    title: 'Crash on import',
    status: 'in_progress',
    reporter_name: 'John Doe',
  }),
  buildBugReport({ id: 3, title: 'Wrong balance', status: 'fixed', reporter_name: 'Jane Smith' }),
];

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(BugReportsPage, {
    global: {
      plugins: [PrimeVue, ToastService, pinia],
    },
  });
}

describe('BugReportsPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    mockApiGateway.reset();
    mockApiGateway.get('/bug_reports', defaultReports);
  });

  describe('on mount', () => {
    it('sets the page heading to "Bug Reports"', async () => {
      createWrapper(pinia);
      await flushPromises();

      const headingStore = useHeadingStore();
      expect(headingStore.heading).toBe('Bug Reports');
    });

    it('calls fetchAll on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(apiGateway.get).toHaveBeenCalledWith('/bug_reports');
    });
  });

  describe('list rendering', () => {
    it('renders a row for each bug report', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const rows = wrapper.findAll('[data-testid="bug-report-row"]');
      expect(rows).toHaveLength(3);
    });

    it('renders the title of each report', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Login fails');
      expect(wrapper.text()).toContain('Crash on import');
      expect(wrapper.text()).toContain('Wrong balance');
    });

    it('renders the reporter name', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Jane Smith');
      expect(wrapper.text()).toContain('John Doe');
    });

    it('renders the reported date formatted as dd-mm-yyyy', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      // factory created_at is 2026-06-15T10:00:00.000Z
      expect(wrapper.text()).toContain('15-06-2026');
    });

    it('renders empty state when there are no reports', async () => {
      mockApiGateway.get('/bug_reports', []);

      const wrapper = createWrapper(pinia);
      await flushPromises();

      const rows = wrapper.findAll('[data-testid="bug-report-row"]');
      expect(rows).toHaveLength(0);
    });
  });

  describe('status change', () => {
    it('calls store.updateStatus when a status is selected', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      mockApiGateway.patch('/bug_reports/1', { ...defaultReports[0], status: 'in_progress' });

      const store = useBugReportStore();
      const updateSpy = vi.spyOn(store, 'updateStatus');

      const selects = wrapper.findAllComponents({ name: 'Select' });
      selects[0]!.vm.$emit('update:modelValue', 'in_progress');
      await flushPromises();

      expect(updateSpy).toHaveBeenCalledWith(1, 'in_progress');
    });

    it('shows a success notification after a successful status update', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      mockApiGateway.patch('/bug_reports/1', { ...defaultReports[0], status: 'in_progress' });

      const selects = wrapper.findAllComponents({ name: 'Select' });
      selects[0]!.vm.$emit('update:modelValue', 'in_progress');
      await flushPromises();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Status updated');
    });

    it('shows an error notification when status update fails', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      mockApiGateway.rejectPatch('/bug_reports/1', new Error('Server error'));

      const selects = wrapper.findAllComponents({ name: 'Select' });
      selects[0]!.vm.$emit('update:modelValue', 'in_progress');
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
    });

    it('does not show success notification when update fails', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      mockApiGateway.rejectPatch('/bug_reports/1', new Error('fail'));

      const selects = wrapper.findAllComponents({ name: 'Select' });
      selects[0]!.vm.$emit('update:modelValue', 'in_progress');
      await flushPromises();

      expect(mockNotifySuccess).not.toHaveBeenCalled();
    });
  });

  describe('error state', () => {
    it('shows error message when fetchAll fails', async () => {
      mockApiGateway.rejectGet('/bug_reports', new Error('Network error'));

      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Network error');
    });
  });
});
