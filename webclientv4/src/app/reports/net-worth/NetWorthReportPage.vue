<template>
  <EcPageLayout page-name="net-worth-report">
    <div v-if="store.loading" class="status-message">Loading...</div>
    <div v-else-if="store.error" class="status-message status-message--error">{{ store.error }}</div>
    <template v-else>
      <div class="report-controls">
        <Select v-model="fromYear" :options="yearOptions" placeholder="From" data-testid="from-year" />
        <span class="year-separator">to</span>
        <Select v-model="toYear" :options="yearOptions" placeholder="To" data-testid="to-year" />
      </div>
      <div class="report-layout" :class="{ 'report-layout--stacked': isMobile }">
        <Card class="report-card">
          <template #content>
            <div class="report-table-panel">
              <DataTable :value="filteredData" size="small" scrollable scroll-height="flex" data-testid="net-worth-table">
                <Column field="period" header="Period">
                  <template #body="{ data: row }">
                    {{ formatPeriod(row.period) }}
                  </template>
                </Column>
                <Column field="net_change" header="Net Change" class="col-money">
                  <template #body="{ data: row }">
                    <EcMoneyDisplay :model-value="row.net_change" :emphasis="Emphasis.Item" />
                  </template>
                </Column>
                <Column field="net_worth" header="Net Worth" class="col-money">
                  <template #body="{ data: row }">
                    <EcMoneyDisplay :model-value="row.net_worth" :emphasis="Emphasis.Subtotal" :highlight-mode="HighlightMode.None" />
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
                type="line"
                :options="chartOptions"
                :series="chartSeries"
                height="100%"
                data-testid="net-worth-chart"
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
import EcMoneyDisplay from '../../shared/form/money-field/EcMoneyDisplay.vue';
import { Emphasis } from '../../shared/constants/emphasis';
import { HighlightMode } from '../../shared/constants/highlightMode';
import { useHeadingStore } from '../../toolbar/headingStore';
import { useNetWorthStore } from './netWorthStore';
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
const store = useNetWorthStore();
const { isMobile } = useResponsive();

const fromYear = ref<number | null>(null);
const toYear = ref<number | null>(null);
const chartReady = ref(false);

onMounted(async () => {
  headingStore.setHeading('Net Worth');
  await store.fetch().catch(() => {});
  await nextTick();
  chartReady.value = true;
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

const filteredData = computed(() => {
  if (fromYear.value === null || toYear.value === null) return store.data;
  return store.data.filter((row) => {
    const year = getYear(row.period);
    return year >= fromYear.value! && year <= toYear.value!;
  });
});

const chartSeries = computed(() => [
  {
    name: 'Net Worth',
    data: filteredData.value.map((row) => ({
      x: formatPeriod(row.period),
      y: row.net_worth / 100,
    })),
  },
]);

function formatYAxis(val: number): string {
  if (val >= 1000) {
    return `${Math.round(val / 1000)}k`;
  }
  return String(Math.round(val));
}

const chartOptions = computed(() => ({
  chart: {
    id: 'net-worth-chart',
    toolbar: { show: false },
    animations: { enabled: false },
  },
  colors: ['#6366f1'],
  xaxis: {
    type: 'category' as const,
    labels: {
      rotate: -45,
      rotateAlways: false,
      formatter: (label: string) => {
        const period = filteredData.value.find((row) => formatPeriod(row.period) === label)?.period;
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
  stroke: {
    curve: 'smooth' as const,
    width: 2.5,
  },
  markers: {
    size: 0,
    hover: { size: 5 },
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
  legend: { show: false },
}));
</script>

<style scoped>
.status-message {
  padding: 1rem;
  text-align: center;
  color: var(--p-text-muted-color);
}

.status-message--error {
  color: var(--p-red-600);
}

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
