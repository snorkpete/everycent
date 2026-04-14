<template>
  <EcPageLayout page-name="category-spending-report">
    <EcStatusMessage :loading="store.loading" :error="store.error" />
    <template v-if="store.ready">
      <div class="report-controls">
        <Select
          v-model="selectedCategory"
          :options="categoryOptions"
          placeholder="Select Category"
          data-testid="category-filter"
        />
        <Select v-model="fromYear" :options="yearOptions" placeholder="From" data-testid="from-year" />
        <span class="year-separator">to</span>
        <Select v-model="toYear" :options="yearOptions" placeholder="To" data-testid="to-year" />
      </div>
      <div class="report-layout" :class="{ 'report-layout--stacked': isMobile }">
        <Card class="report-card">
          <template #content>
            <div class="report-table-panel">
              <DataTable
                :value="filteredRows"
                size="small"
                scrollable
                scroll-height="flex"
                data-testid="category-spending-table"
              >
                <Column field="period" header="Period">
                  <template #body="{ data: row }">
                    {{ formatPeriod(row.period) }}
                  </template>
                </Column>
                <Column field="budgeted" header="Budgeted" class="col-money">
                  <template #body="{ data: row }">
                    <EcMoneyDisplay :model-value="row.budgeted" :emphasis="Emphasis.Item" :highlight-mode="HighlightMode.None" />
                  </template>
                </Column>
                <Column field="spent" header="Spent" class="col-money">
                  <template #body="{ data: row }">
                    <EcMoneyDisplay :model-value="row.spent" :emphasis="Emphasis.Item" :highlight-mode="HighlightMode.None" />
                  </template>
                </Column>
                <Column field="diff" header="Diff" class="col-money">
                  <template #body="{ data: row }">
                    <EcMoneyDisplay :model-value="row.diff" :emphasis="Emphasis.Item" />
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>
        </Card>
        <Card class="report-card">
          <template #content>
            <div class="report-chart-panel">
              <ApexChart
                v-if="chartReady"
                type="bar"
                :options="chartOptions"
                :series="chartSeries"
                height="100%"
                data-testid="category-spending-chart"
              />
            </div>
          </template>
        </Card>
      </div>
    </template>
  </EcPageLayout>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch, nextTick } from 'vue';
import ApexChart from 'vue3-apexcharts';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import Select from 'primevue/select';
import EcPageLayout from '../../shared/layout/EcPageLayout.vue';
import EcStatusMessage from '../../shared/layout/EcStatusMessage.vue';
import EcMoneyDisplay from '../../shared/form/money-field/EcMoneyDisplay.vue';
import { Emphasis } from '../../shared/constants/emphasis';
import { HighlightMode } from '../../shared/constants/highlightMode';
import { useHeadingStore } from '../../toolbar/headingStore';
import { useCategorySpendingStore } from './categorySpendingStore';
import { useResponsive } from '../../shared/composables/useResponsive';
import { centsToDollars } from '../../shared/util/centsToDollars';

function formatPeriod(period: string): string {
  const [year, month] = period.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function isJanuary(period: string): boolean {
  return period.endsWith('-01');
}

function getYear(period: string): number {
  return Number(period.split('-')[0]);
}

const headingStore = useHeadingStore();
const store = useCategorySpendingStore();
const { isMobile } = useResponsive();

const selectedCategory = ref<string | null>(null);
const fromYear = ref<number | null>(null);
const toYear = ref<number | null>(null);
const chartReady = ref(false);

onMounted(async () => {
  headingStore.setHeading('Category Spending');
  await store.fetch().catch(() => {});
  await nextTick();
  chartReady.value = true;
});

const categoryOptions = computed(() => {
  const names = store.data.map((row) => row.category_name);
  return [...new Set(names)].sort();
});

// Default to first category and last 2 years once data loads
watch(categoryOptions, (cats) => {
  if (cats.length > 0 && selectedCategory.value === null) {
    selectedCategory.value = cats[0];
  }
});

const yearOptions = computed(() => {
  const years = store.data.map((row) => getYear(row.period));
  return [...new Set(years)].sort();
});

watch(yearOptions, (years) => {
  if (years.length > 0 && fromYear.value === null) {
    const currentYear = new Date().getFullYear();
    fromYear.value = Math.max(years[0], currentYear - 1);
    toYear.value = years[years.length - 1];
  }
});

const filteredRows = computed(() => {
  let rows = store.data;
  if (selectedCategory.value) {
    rows = rows.filter((row) => row.category_name === selectedCategory.value);
  }
  if (fromYear.value !== null && toYear.value !== null) {
    rows = rows.filter((row) => {
      const year = getYear(row.period);
      return year >= fromYear.value! && year <= toYear.value!;
    });
  }
  return rows;
});

const chartPeriods = computed(() => {
  const periods = filteredRows.value.map((row) => row.period);
  return [...new Set(periods)].sort();
});

const chartSeries = computed(() => {
  const periods = chartPeriods.value;

  const sumByPeriod = (field: 'budgeted' | 'spent') =>
    periods.map((period) => {
      const rows = filteredRows.value.filter((row) => row.period === period);
      return rows.reduce((sum, row) => sum + row[field] / 100, 0);
    });

  return [
    { name: 'Budgeted', data: sumByPeriod('budgeted') },
    { name: 'Actual', data: sumByPeriod('spent') },
  ];
});

function formatYAxis(val: number): string {
  if (val >= 1000) {
    return `${Math.round(val / 1000)}k`;
  }
  return String(Math.round(val));
}

const chartOptions = computed(() => ({
  chart: {
    id: 'category-spending-chart',
    toolbar: { show: false },
    animations: { enabled: false },
  },
  colors: ['#6366f1', '#94a3b8'],
  xaxis: {
    type: 'category' as const,
    categories: chartPeriods.value.map(formatPeriod),
    labels: {
      rotate: -45,
      rotateAlways: false,
      formatter: (label: string) => {
        const period = chartPeriods.value.find((p) => formatPeriod(p) === label);
        if (!period) return label;
        return isJanuary(period) ? label : '';
      },
    },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      formatter: formatYAxis,
    },
  },
  tooltip: {
    y: {
      formatter: (val: number) => centsToDollars(val * 100),
    },
  },
  grid: {
    borderColor: 'var(--p-surface-200)',
    strokeDashArray: 3,
  },
  legend: { show: true },
  plotOptions: {
    bar: {
      columnWidth: '60%',
    },
  },
}));
</script>

<style scoped>
.report-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.year-separator {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.report-layout {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-height: 0;
}

.report-layout--stacked {
  flex-direction: column;
}

.report-card {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

:deep(.report-card .p-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
}

:deep(.report-card .p-card-content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.report-table-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.report-chart-panel {
  flex: 1;
  min-height: 300px;
}

:deep(.col-money) {
  text-align: right;
}

:deep(.col-money .p-datatable-column-header-content) {
  justify-content: flex-end;
}
</style>
