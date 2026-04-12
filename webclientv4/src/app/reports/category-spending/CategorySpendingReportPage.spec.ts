import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import CategorySpendingReportPage from './CategorySpendingReportPage.vue';
import { reportApi } from '../reportApi';
import type { ReportResponse } from '../report.types';
import type { CategorySpendingRow } from './categorySpending.types';

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

const mockRows: CategorySpendingRow[] = [
  { period: `${thisYear}-01`, category_name: 'Groceries', budgeted: 50000, spent: 45000, diff: 5000 },
  { period: `${thisYear}-01`, category_name: 'Dining', budgeted: 20000, spent: 22000, diff: -2000 },
  { period: `${thisYear}-02`, category_name: 'Groceries', budgeted: 50000, spent: 48000, diff: 2000 },
  { period: `${thisYear}-02`, category_name: 'Dining', budgeted: 20000, spent: 19000, diff: 1000 },
];

const mockResponse: ReportResponse<CategorySpendingRow> = {
  success: true,
  data: mockRows,
  fields: [
    { name: 'period', label: 'Period', numeric: false },
    { name: 'category_name', label: 'Category', numeric: false },
    { name: 'budgeted', label: 'Budgeted', numeric: true },
    { name: 'spent', label: 'Spent', numeric: true },
    { name: 'diff', label: 'Diff', numeric: true },
  ],
};

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(CategorySpendingReportPage, {
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('CategorySpendingReportPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    vi.mocked(reportApi.getCategorySpending).mockResolvedValue(mockResponse);
  });

  describe('on mount', () => {
    it('sets the page heading to "Category Spending"', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(mockSetHeading).toHaveBeenCalledWith('Category Spending');
    });

    it('calls reportApi.getCategorySpending on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(reportApi.getCategorySpending).toHaveBeenCalledOnce();
    });
  });

  describe('loading state', () => {
    it('shows loading message while data is being fetched', async () => {
      let resolve!: (value: ReportResponse<CategorySpendingRow>) => void;
      vi.mocked(reportApi.getCategorySpending).mockImplementation(
        () => new Promise((r) => (resolve = r)),
      );

      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Loading...');
      expect(wrapper.find('[data-testid="category-spending-table"]').exists()).toBe(false);

      resolve({ success: true, data: [], fields: [] });
      await flushPromises();
    });
  });

  describe('error state', () => {
    it('shows error message when fetch fails', async () => {
      vi.mocked(reportApi.getCategorySpending).mockRejectedValue(new Error('Network error'));
      const suppress = () => {};
      process.on('unhandledRejection', suppress);

      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Network error');
      expect(wrapper.find('[data-testid="category-spending-table"]').exists()).toBe(false);

      process.off('unhandledRejection', suppress);
    });
  });

  describe('data display', () => {
    it('renders the data table', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="category-spending-table"]').exists()).toBe(true);
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

    it('defaults to the first category alphabetically', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Dining');
      expect(wrapper.text()).not.toContain('Groceries');
    });
  });

  describe('category filter', () => {
    it('renders the category filter dropdown', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="category-filter"]').exists()).toBe(true);
    });

    it('defaults to first category and only shows its rows', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('Dining');
      expect(wrapper.text()).not.toContain('Groceries');
    });
  });
});
