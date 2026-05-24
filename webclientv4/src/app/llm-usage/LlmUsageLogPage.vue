<template>
  <EcPageLayout page-name="llm-usage-log" variant="fixed">
    <template #toolbar-right>
      <Button
        label="Refresh"
        severity="secondary"
        size="small"
        :loading="store.loading"
        data-testid="refresh-btn"
        @click="store.fetch()"
      />
    </template>

    <div class="filters-row">
      <label class="filter-label">From</label>
      <DatePicker
        :model-value="startDateValue"
        placeholder="Start date"
        date-format="dd-mm-yy"
        show-button-bar
        data-testid="start-date-picker"
        @update:model-value="onStartDateChange($event as Date | null)"
      />
      <label class="filter-label">To</label>
      <DatePicker
        :model-value="endDateValue"
        placeholder="End date"
        date-format="dd-mm-yy"
        show-button-bar
        data-testid="end-date-picker"
        @update:model-value="onEndDateChange($event as Date | null)"
      />
    </div>

    <div v-if="store.summary" class="summary-row" data-testid="summary-row">
      <span class="summary-item" data-testid="total-records">
        <span class="summary-label">Records</span>
        <span class="summary-value">{{ store.summary.total_records }}</span>
      </span>
      <span class="summary-item" data-testid="total-tokens">
        <span class="summary-label">Tokens</span>
        <span class="summary-value">{{ store.summary.total_tokens.toLocaleString('en-US') }}</span>
      </span>
      <span class="summary-item" data-testid="total-cost">
        <span class="summary-label">Total Cost</span>
        <span class="summary-value">{{ formatCost(store.summary.total_cost) }}</span>
      </span>
    </div>

    <EcStatusMessage :loading="store.loading && store.records.length === 0" :error="store.error" />

    <div class="table-container">
      <DataTable
        :value="store.records"
        size="small"
        scrollable
        scroll-height="flex"
        data-testid="usage-table"
      >
        <Column field="created_at" header="Date">
          <template #body="{ data: record }">
            {{ formatCreatedAt(record.created_at) }}
          </template>
        </Column>
        <Column field="provider" header="Provider" />
        <Column field="llm_model_name" header="Model" />
        <Column field="usage_category" header="Category" />
        <Column field="total_tokens" header="Tokens" class="col-number">
          <template #body="{ data: record }">
            {{ record.total_tokens.toLocaleString('en-US') }}
          </template>
        </Column>
        <Column field="total_cost" header="Cost" class="col-number">
          <template #body="{ data: record }">
            {{ formatCost(record.total_cost) }}
          </template>
        </Column>
        <Column field="request_duration_ms" header="Duration" class="col-number">
          <template #body="{ data: record }"> {{ record.request_duration_ms }}ms </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="store.totalCount > 0" class="pagination-row" data-testid="pagination-row">
      <Button
        v-tooltip="'Previous page'"
        icon="pi pi-chevron-left"
        text
        severity="secondary"
        size="small"
        :disabled="store.page <= 1"
        data-testid="prev-page-btn"
        @click="store.setPage(store.page - 1)"
      />
      <span class="pagination-info" data-testid="pagination-info">
        Page {{ store.page }} of {{ totalPages }}
      </span>
      <Button
        v-tooltip="'Next page'"
        icon="pi pi-chevron-right"
        text
        severity="secondary"
        size="small"
        :disabled="store.page >= totalPages"
        data-testid="next-page-btn"
        @click="store.setPage(store.page + 1)"
      />
    </div>
  </EcPageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import DatePicker from 'primevue/datepicker';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import EcStatusMessage from '../shared/layout/EcStatusMessage.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { useLlmUsageStore } from './llmUsageStore';

const headingStore = useHeadingStore();
const store = useLlmUsageStore();

onMounted(() => {
  headingStore.setHeading('Usage Log');
  store.fetch();
});

const totalPages = computed(() => Math.ceil(store.totalCount / store.perPage));

// Convert store ISO date strings to Date objects for DatePicker binding
const startDateValue = computed(() => isoToDate(store.startDate));
const endDateValue = computed(() => isoToDate(store.endDate));

function isoToDate(iso: string | null): Date | null {
  if (!iso) return null;
  const [year = 0, month = 1, day = 1] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function dateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function onStartDateChange(date: Date | null) {
  store.setDateRange(date ? dateToIso(date) : null, store.endDate);
}

function onEndDateChange(date: Date | null) {
  store.setDateRange(store.startDate, date ? dateToIso(date) : null);
}

function formatCost(decimalCents: number | undefined): string {
  if (decimalCents === undefined) return '—';
  return `$${(decimalCents / 100).toFixed(4)}`;
}

function formatCreatedAt(createdAt: string | undefined): string {
  if (!createdAt) return '—';
  const date = new Date(createdAt);
  if (isNaN(date.getTime())) return createdAt;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}
</script>

<style scoped>
.filters-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.filter-label {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.summary-row {
  display: flex;
  gap: 2rem;
  padding: 0.75rem 1rem;
  background-color: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
  flex-shrink: 0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1rem;
  font-weight: 600;
}

.table-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
  overflow: hidden;
}

:deep(.col-number) {
  text-align: right;
}

:deep(.col-number .p-datatable-column-header-content) {
  justify-content: flex-end;
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  flex-shrink: 0;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  min-width: 8rem;
  text-align: center;
}
</style>
