<template>
  <EcPageLayout page-name="net-worth-report">
    <div v-if="store.loading" class="status-message">Loading...</div>
    <div v-else-if="store.error" class="status-message status-message--error">{{ store.error }}</div>
    <template v-else>
      <div class="report-layout" :class="{ 'report-layout--stacked': isMobile }">
        <div class="report-table-panel">
          <DataTable :value="store.data" size="small" scrollable scroll-height="flex" data-testid="net-worth-table">
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
        <div class="report-chart-panel">
          <ApexChart
            type="line"
            :options="chartOptions"
            :series="chartSeries"
            height="100%"
            data-testid="net-worth-chart"
          />
        </div>
      </div>
    </template>
  </EcPageLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import ApexChart from 'vue3-apexcharts';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
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

const headingStore = useHeadingStore();
const store = useNetWorthStore();
const { isMobile } = useResponsive();

onMounted(() => {
  headingStore.setHeading('Net Worth');
  store.fetch().catch(() => {});
});

const chartSeries = computed(() => [
  {
    name: 'Net Worth',
    data: store.data.map((row) => ({
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
        const period = store.data.find((row) => formatPeriod(row.period) === label)?.period;
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

.report-layout {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
}

.report-layout--stacked {
  flex-direction: column;
}

.report-table-panel {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.report-chart-panel {
  flex: 1;
  min-width: 0;
  min-height: 300px;
}

:deep(.col-money) {
  text-align: right;
}

:deep(.col-money .p-datatable-column-header-content) {
  justify-content: flex-end;
}
</style>
