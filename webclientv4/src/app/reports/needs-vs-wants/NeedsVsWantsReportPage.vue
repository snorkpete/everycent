<template>
  <EcPageLayout page-name="needs-vs-wants-report">
    <div v-if="store.loading" class="status-message">Loading...</div>
    <div v-else-if="store.error" class="status-message status-message--error">{{ store.error }}</div>
    <template v-else>
      <div class="report-controls">
        <SelectButton
          v-model="viewMode"
          :options="viewOptions"
          option-label="label"
          option-value="value"
          data-testid="view-toggle"
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
                :value="filteredData"
                size="small"
                scrollable
                scroll-height="flex"
                data-testid="needs-vs-wants-table"
              >
                <template v-for="field in visibleFields" :key="field.name">
                  <Column
                    v-if="field.name === 'period'"
                    field="period"
                    header="Period"
                  >
                    <template #body="{ data: row }">
                      {{ formatPeriod(row.period) }}
                    </template>
                  </Column>
                  <Column
                    v-else-if="isMoneyField(field.name)"
                    :field="field.name"
                    :header="field.label"
                    class="col-money"
                  >
                    <template #body="{ data: row }">
                      <EcMoneyDisplay
                        :model-value="(row as NeedsVsWantsRow)[field.name as MoneyFieldKey]"
                        :emphasis="Emphasis.Item"
                        :highlight-mode="HighlightMode.None"
                      />
                    </template>
                  </Column>
                  <Column
                    v-else
                    :field="field.name"
                    :header="field.label"
                    class="col-money"
                  >
                    <template #body="{ data: row }">
                      {{ (row as NeedsVsWantsRow)[field.name as PctFieldKey] }}%
                    </template>
                  </Column>
                </template>
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
                data-testid="needs-vs-wants-chart"
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
import SelectButton from 'primevue/selectbutton';
import EcPageLayout from '../../shared/layout/EcPageLayout.vue';
import EcMoneyDisplay from '../../shared/form/money-field/EcMoneyDisplay.vue';
import { Emphasis } from '../../shared/constants/emphasis';
import { HighlightMode } from '../../shared/constants/highlightMode';
import { useHeadingStore } from '../../toolbar/headingStore';
import { useNeedsVsWantsStore } from './needsVsWantsStore';
import { useResponsive } from '../../shared/composables/useResponsive';
import type { NeedsVsWantsRow } from './needsVsWants.types';

type MoneyFieldKey = 'budgeted_needs' | 'actual_needs' | 'budgeted_wants' | 'actual_wants' | 'budgeted_savings' | 'actual_savings';
type PctFieldKey = 'budgeted_needs_pct' | 'budgeted_wants_pct' | 'budgeted_savings_pct' | 'actual_needs_pct' | 'actual_wants_pct' | 'actual_savings_pct';

const MONEY_FIELDS = new Set<string>([
  'budgeted_needs', 'actual_needs',
  'budgeted_wants', 'actual_wants',
  'budgeted_savings', 'actual_savings',
]);

function isMoneyField(name: string): boolean {
  return MONEY_FIELDS.has(name);
}

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
const store = useNeedsVsWantsStore();
const { isMobile } = useResponsive();

type ViewMode = 'budgeted' | 'actual';

const viewMode = ref<ViewMode>('budgeted');
const fromYear = ref<number | null>(null);
const toYear = ref<number | null>(null);
const chartReady = ref(false);

const viewOptions = [
  { label: 'Budgeted', value: 'budgeted' as ViewMode },
  { label: 'Actual', value: 'actual' as ViewMode },
];

onMounted(async () => {
  headingStore.setHeading('Needs vs Wants');
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

const visibleFields = computed(() =>
  store.fields.filter(
    (f) => f.class === 'all' || f.class === viewMode.value,
  ),
);

const periods = computed(() => filteredData.value.map((row) => row.period));

const chartSeries = computed(() => {
  if (viewMode.value === 'budgeted') {
    return [
      { name: 'Needs', data: filteredData.value.map((row) => row.budgeted_needs_pct) },
      { name: 'Wants', data: filteredData.value.map((row) => row.budgeted_wants_pct) },
      { name: 'Savings', data: filteredData.value.map((row) => row.budgeted_savings_pct) },
    ];
  }
  return [
    { name: 'Needs', data: filteredData.value.map((row) => row.actual_needs_pct) },
    { name: 'Wants', data: filteredData.value.map((row) => row.actual_wants_pct) },
    { name: 'Savings', data: filteredData.value.map((row) => row.actual_savings_pct) },
  ];
});

const chartOptions = computed(() => ({
  chart: {
    id: 'needs-vs-wants-chart',
    toolbar: { show: false },
    animations: { enabled: false },
    stacked: true,
  },
  colors: ['#ef4444', '#6366f1', '#22c55e'],
  xaxis: {
    type: 'category' as const,
    categories: periods.value.map(formatPeriod),
    labels: {
      rotate: -45,
      rotateAlways: false,
      formatter: (label: string) => {
        const period = periods.value.find((p) => formatPeriod(p) === label);
        if (!period) return label;
        return isJanuary(period) ? label : '';
      },
    },
    axisTicks: { show: false },
  },
  yaxis: {
    min: 0,
    max: 100,
    labels: {
      formatter: (val: number) => `${val}%`,
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val}%`,
    },
  },
  grid: {
    borderColor: 'var(--p-surface-200)',
    strokeDashArray: 3,
  },
  legend: { show: true },
  plotOptions: {
    bar: {
      columnWidth: '80%',
    },
  },
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
