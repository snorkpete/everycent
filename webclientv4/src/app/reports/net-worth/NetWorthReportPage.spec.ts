import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import NetWorthReportPage from './NetWorthReportPage.vue';
import { reportApi } from '../reportApi';
import type { ReportResponse } from '../report.types';
import type { NetWorthRow } from './netWorth.types';

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

const mockRows: NetWorthRow[] = [
  { period: `${thisYear}-01`, net_change: 5000, net_worth: 150000 },
  { period: `${thisYear}-02`, net_change: -2000, net_worth: 148000 },
];

const mockResponse: ReportResponse<NetWorthRow> = {
  success: true,
  data: mockRows,
  fields: [
    { name: 'period', label: 'Period', numeric: false },
    { name: 'net_change', label: 'Net Change', numeric: true },
    { name: 'net_worth', label: 'Net Worth', numeric: true },
  ],
};

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(NetWorthReportPage, {
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('NetWorthReportPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    vi.mocked(reportApi.getNetWorth).mockResolvedValue(mockResponse);
  });

  describe('on mount', () => {
    it('sets the page heading to "Net Worth"', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(mockSetHeading).toHaveBeenCalledWith('Net Worth');
    });

    it('calls reportApi.getNetWorth on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(reportApi.getNetWorth).toHaveBeenCalledOnce();
    });
  });

  describe('loading state', () => {
    it('shows loading message while data is being fetched', async () => {
      let resolve!: (value: ReportResponse<NetWorthRow>) => void;
      vi.mocked(reportApi.getNetWorth).mockImplementation(
        () => new Promise((r) => (resolve = r)),
      );

      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Loading...');
      expect(wrapper.find('[data-testid="net-worth-table"]').exists()).toBe(false);

      resolve({ success: true, data: [], fields: [] });
      await flushPromises();
    });
  });

  describe('error state', () => {
    it('shows error message when fetch fails', async () => {
      vi.mocked(reportApi.getNetWorth).mockRejectedValue(new Error('Network error'));
      const suppress = () => {};
      process.on('unhandledRejection', suppress);

      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Network error');
      expect(wrapper.find('[data-testid="net-worth-table"]').exists()).toBe(false);

      process.off('unhandledRejection', suppress);
    });
  });

  describe('data display', () => {
    it('renders the data table', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="net-worth-table"]').exists()).toBe(true);
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
});
