import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import NeedsVsWantsReportPage from './NeedsVsWantsReportPage.vue';
import { reportApi } from '../reportApi';
import type { ReportResponse } from '../report.types';
import type { NeedsVsWantsRow } from './needsVsWants.types';

vi.mock('../reportApi', () => ({
  reportApi: {
    getNetWorth: vi.fn(),
    getCategorySpending: vi.fn(),
    getNeedsVsWants: vi.fn(),
  },
}));

const mockSetHeading = vi.fn();
vi.mock('../../toolbar/headingStore', () => ({
  useHeadingStore: () => ({ setHeading: mockSetHeading }),
}));

vi.mock('vue3-apexcharts', () => ({
  default: {
    name: 'ApexChart',
    props: ['type', 'options', 'series', 'height'],
    render: () => null,
  },
}));

const thisYear = new Date().getFullYear();

const mockRows: NeedsVsWantsRow[] = [
  {
    period: `${thisYear}-01`,
    budgeted_needs: 200000,
    actual_needs: 195000,
    budgeted_wants: 100000,
    actual_wants: 110000,
    budgeted_savings: 50000,
    actual_savings: 45000,
    budgeted_needs_pct: 57,
    budgeted_wants_pct: 29,
    budgeted_savings_pct: 14,
    actual_needs_pct: 56,
    actual_wants_pct: 31,
    actual_savings_pct: 13,
  },
  {
    period: `${thisYear}-02`,
    budgeted_needs: 210000,
    actual_needs: 205000,
    budgeted_wants: 105000,
    actual_wants: 108000,
    budgeted_savings: 55000,
    actual_savings: 57000,
    budgeted_needs_pct: 57,
    budgeted_wants_pct: 28,
    budgeted_savings_pct: 15,
    actual_needs_pct: 55,
    actual_wants_pct: 29,
    actual_savings_pct: 16,
  },
];

const mockResponse: ReportResponse<NeedsVsWantsRow> = {
  success: true,
  data: mockRows,
  fields: [
    { name: 'period', label: 'Period', numeric: false, class: 'all' },
    { name: 'budgeted_needs', label: 'Needs', numeric: true, class: 'budgeted' },
    { name: 'budgeted_wants', label: 'Wants', numeric: true, class: 'budgeted' },
    { name: 'budgeted_savings', label: 'Savings', numeric: true, class: 'budgeted' },
    { name: 'budgeted_needs_pct', label: 'Needs %', numeric: true, class: 'budgeted' },
    { name: 'budgeted_wants_pct', label: 'Wants %', numeric: true, class: 'budgeted' },
    { name: 'budgeted_savings_pct', label: 'Savings %', numeric: true, class: 'budgeted' },
    { name: 'actual_needs', label: 'Needs', numeric: true, class: 'actual' },
    { name: 'actual_wants', label: 'Wants', numeric: true, class: 'actual' },
    { name: 'actual_savings', label: 'Savings', numeric: true, class: 'actual' },
    { name: 'actual_needs_pct', label: 'Needs %', numeric: true, class: 'actual' },
    { name: 'actual_wants_pct', label: 'Wants %', numeric: true, class: 'actual' },
    { name: 'actual_savings_pct', label: 'Savings %', numeric: true, class: 'actual' },
  ],
};

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(NeedsVsWantsReportPage, {
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('NeedsVsWantsReportPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    vi.mocked(reportApi.getNeedsVsWants).mockResolvedValue(mockResponse);
  });

  describe('on mount', () => {
    it('sets the page heading to "Needs vs Wants"', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(mockSetHeading).toHaveBeenCalledWith('Needs vs Wants');
    });

    it('calls reportApi.getNeedsVsWants on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(reportApi.getNeedsVsWants).toHaveBeenCalledOnce();
    });
  });

  describe('loading state', () => {
    it('shows loading message while data is being fetched', async () => {
      let resolve!: (value: ReportResponse<NeedsVsWantsRow>) => void;
      vi.mocked(reportApi.getNeedsVsWants).mockImplementation(
        () => new Promise((r) => (resolve = r)),
      );

      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Loading...');
      expect(wrapper.find('[data-testid="needs-vs-wants-table"]').exists()).toBe(false);

      resolve({ success: true, data: [], fields: [] });
      await flushPromises();
    });
  });

  describe('error state', () => {
    it('shows error message when fetch fails', async () => {
      vi.mocked(reportApi.getNeedsVsWants).mockRejectedValue(new Error('Network error'));
      const suppress = () => {};
      process.on('unhandledRejection', suppress);

      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Network error');
      expect(wrapper.find('[data-testid="needs-vs-wants-table"]').exists()).toBe(false);

      process.off('unhandledRejection', suppress);
    });
  });

  describe('data display', () => {
    it('renders the data table', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="needs-vs-wants-table"]').exists()).toBe(true);
    });

    it('renders the chart', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.findComponent({ name: 'ApexChart' }).exists()).toBe(true);
    });

    it('displays formatted period values in the table', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain(`Jan ${thisYear}`);
      expect(wrapper.text()).toContain(`Feb ${thisYear}`);
    });
  });

  describe('view toggle', () => {
    it('renders the view toggle', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="view-toggle"]').exists()).toBe(true);
    });

    it('defaults to Budgeted view', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const toggle = wrapper.find('[data-testid="view-toggle"]');
      expect(toggle.text()).toContain('Budgeted');
    });

    it('chart series uses budgeted percentages by default', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const chart = wrapper.findComponent({ name: 'ApexChart' });
      const series = chart.props('series') as Array<{ name: string; data: number[] }>;

      expect(series[0].name).toBe('Needs');
      expect(series[0].data).toEqual([57, 57]);
      expect(series[1].name).toBe('Wants');
      expect(series[1].data).toEqual([29, 28]);
      expect(series[2].name).toBe('Savings');
      expect(series[2].data).toEqual([14, 15]);
    });
  });
});
