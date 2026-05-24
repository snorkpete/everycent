import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import DatePicker from 'primevue/datepicker';
import LlmUsageLogPage from './LlmUsageLogPage.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { useLlmUsageStore } from './llmUsageStore';
import apiGateway from '../../api/api-gateway';
import { buildApiGatewayMock } from '../../test/buildApiGatewayMock';
import { buildLlmUsageRecord, buildLlmUsageSummary } from '../../test/factories';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockApiGateway = buildApiGatewayMock();

// DatePicker calls window.matchMedia on mount
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

const defaultRecords = [
  buildLlmUsageRecord({
    id: 1,
    provider: 'anthropic',
    llm_model_name: 'claude-sonnet-4-6',
    usage_category: 'chat',
    total_tokens: 150,
    total_cost: 30,
    request_duration_ms: 1200,
    created_at: '2026-05-24T10:00:00.000Z',
  }),
  buildLlmUsageRecord({
    id: 2,
    provider: 'openai',
    llm_model_name: 'gpt-4o',
    usage_category: 'query_embedding',
    total_tokens: 500,
    total_cost: 5,
    request_duration_ms: 300,
    created_at: '2026-05-23T14:30:00.000Z',
  }),
];

const defaultSummary = buildLlmUsageSummary({
  total_records: 100,
  total_tokens: 50000,
  total_cost: 250,
});

function seedDefaultApiMocks() {
  mockApiGateway.get('/llm_usage_records', { records: defaultRecords, total_count: 100 });
  mockApiGateway.get('/llm_usage_records/summary', defaultSummary);
}

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(LlmUsageLogPage, {
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('LlmUsageLogPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    mockApiGateway.reset();
    seedDefaultApiMocks();
  });

  describe('on mount', () => {
    it('sets the page heading to "Usage Log"', async () => {
      createWrapper(pinia);
      await flushPromises();

      const headingStore = useHeadingStore();
      expect(headingStore.heading).toBe('Usage Log');
    });

    it('calls fetch on mount to load records and summary', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records', expect.anything());
      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records/summary', expect.anything());
    });
  });

  describe('summary row', () => {
    it('renders total records from summary', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="total-records"]').text()).toContain('100');
    });

    it('renders total tokens from summary', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="total-tokens"]').text()).toContain('50,000');
    });

    it('renders total cost formatted to 4 decimal places', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      // total_cost 250 decimal cents = $2.5000
      expect(wrapper.find('[data-testid="total-cost"]').text()).toContain('$2.5000');
    });

    it('does not render summary row until summary loads', async () => {
      mockApiGateway.get('/llm_usage_records/summary', {
        total_records: 0,
        total_tokens: 0,
        total_cost: 0,
        by_provider: [],
        by_category: [],
      });
      // summary starts as null — row should not show until fetch completes
      const wrapper = createWrapper(pinia);
      // Before flushPromises: store.summary is null
      expect(wrapper.find('[data-testid="summary-row"]').exists()).toBe(false);
    });
  });

  describe('data table', () => {
    it('renders rows from store records', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const table = wrapper.find('[data-testid="usage-table"]');
      expect(table.exists()).toBe(true);
      expect(table.text()).toContain('anthropic');
      expect(table.text()).toContain('claude-sonnet-4-6');
    });

    it('renders the provider and model name for each record', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const table = wrapper.find('[data-testid="usage-table"]');
      expect(table.text()).toContain('openai');
      expect(table.text()).toContain('gpt-4o');
    });

    it('renders cost formatted to 4 decimal places in rows', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      // record 1: total_cost 30 decimal cents = $0.3000
      const table = wrapper.find('[data-testid="usage-table"]');
      expect(table.text()).toContain('$0.3000');
    });

    it('renders duration with ms suffix', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const table = wrapper.find('[data-testid="usage-table"]');
      expect(table.text()).toContain('1200ms');
    });

    it('renders the created_at date formatted in local time', async () => {
      // Format the expected date using the same logic as formatCreatedAt so the
      // test stays correct regardless of the runner's local timezone offset.
      const date = new Date('2026-05-24T10:00:00.000Z');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const expectedDate = `${day}-${month}-${year} ${hours}:${minutes}`;

      const wrapper = createWrapper(pinia);
      await flushPromises();

      const table = wrapper.find('[data-testid="usage-table"]');
      expect(table.text()).toContain(expectedDate);
    });

    it('renders empty table when no records are returned', async () => {
      mockApiGateway.get('/llm_usage_records', { records: [], total_count: 0 });
      mockApiGateway.get('/llm_usage_records/summary', buildLlmUsageSummary({ total_records: 0 }));

      const wrapper = createWrapper(pinia);
      await flushPromises();

      const table = wrapper.find('[data-testid="usage-table"]');
      expect(table.exists()).toBe(true);
      expect(table.text()).not.toContain('anthropic');
    });
  });

  describe('date filters', () => {
    it('calls setDateRange when start date changes', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const store = useLlmUsageStore();
      const setDateRangeSpy = vi.spyOn(store, 'setDateRange');

      const startPicker = wrapper.findComponent({ name: 'DatePicker' });
      startPicker.vm.$emit('update:modelValue', new Date(2026, 0, 1));
      await nextTick();

      expect(setDateRangeSpy).toHaveBeenCalledWith('2026-01-01', null);
    });

    it('calls setDateRange when end date changes', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const store = useLlmUsageStore();
      const setDateRangeSpy = vi.spyOn(store, 'setDateRange');

      const datePickers = wrapper.findAllComponents(DatePicker);
      datePickers[1]!.vm.$emit('update:modelValue', new Date(2026, 0, 31));
      await nextTick();

      expect(setDateRangeSpy).toHaveBeenCalledWith(null, '2026-01-31');
    });

    it('clears start date when DatePicker emits null', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const store = useLlmUsageStore();
      store.startDate = '2026-01-01';
      const setDateRangeSpy = vi.spyOn(store, 'setDateRange');

      const startPicker = wrapper.findComponent({ name: 'DatePicker' });
      startPicker.vm.$emit('update:modelValue', null);
      await nextTick();

      expect(setDateRangeSpy).toHaveBeenCalledWith(null, null);
    });
  });

  describe('pagination', () => {
    it('shows pagination row when total count is greater than 0', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="pagination-row"]').exists()).toBe(true);
    });

    it('hides pagination row when there are no records', async () => {
      mockApiGateway.get('/llm_usage_records', { records: [], total_count: 0 });
      mockApiGateway.get('/llm_usage_records/summary', buildLlmUsageSummary({ total_records: 0 }));

      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="pagination-row"]').exists()).toBe(false);
    });

    it('shows current page info', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      // 100 records at 50 per page = 2 pages
      expect(wrapper.find('[data-testid="pagination-info"]').text()).toContain('Page 1 of 2');
    });

    it('disables prev button on the first page', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const prevBtn = wrapper.find('[data-testid="prev-page-btn"]');
      expect(prevBtn.attributes('disabled')).toBeDefined();
    });

    it('enables next button when there are more pages', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const nextBtn = wrapper.find('[data-testid="next-page-btn"]');
      expect(nextBtn.attributes('disabled')).toBeUndefined();
    });

    it('calls setPage with incremented page when next is clicked', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const store = useLlmUsageStore();
      const setPageSpy = vi.spyOn(store, 'setPage');

      await wrapper.find('[data-testid="next-page-btn"]').trigger('click');

      expect(setPageSpy).toHaveBeenCalledWith(2);
    });

    it('disables next button on the last page', async () => {
      mockApiGateway.get('/llm_usage_records', { records: defaultRecords, total_count: 50 });
      // total_count 50 at perPage 50 = 1 page — next should be disabled

      const wrapper = createWrapper(pinia);
      await flushPromises();

      const nextBtn = wrapper.find('[data-testid="next-page-btn"]');
      expect(nextBtn.attributes('disabled')).toBeDefined();
    });
  });

  describe('refresh button', () => {
    it('shows loading state on refresh button while fetching', async () => {
      vi.mocked(apiGateway.get).mockImplementationOnce(() => new Promise(() => {}));

      const wrapper = createWrapper(pinia);
      await nextTick();

      const refreshBtn = wrapper
        .findAllComponents({ name: 'Button' })
        .find((b) => b.attributes('data-testid') === 'refresh-btn')!;
      expect(refreshBtn.props('loading')).toBe(true);
    });

    it('calls fetch when refresh button is clicked', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const callCountBefore = vi.mocked(apiGateway.get).mock.calls.length;
      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');
      await flushPromises();

      expect(vi.mocked(apiGateway.get).mock.calls.length).toBeGreaterThan(callCountBefore);
    });
  });

  describe('error state', () => {
    it('shows error message when fetch fails', async () => {
      mockApiGateway.rejectGet('/llm_usage_records', new Error('Server error'));

      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Server error');
    });
  });
});
