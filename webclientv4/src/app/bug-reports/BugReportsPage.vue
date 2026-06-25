<template>
  <EcPageLayout page-name="bug-reports" variant="fixed">
    <EcStatusMessage :error="store.error" />

    <div class="table-container">
      <DataTable
        :value="store.reports"
        size="small"
        scrollable
        scroll-height="flex"
        data-testid="bug-reports-table"
      >
        <Column field="title" header="Title">
          <template #body="{ data: report }">
            <div data-testid="bug-report-row">
              <div class="report-title">{{ report.title }}</div>
              <div class="report-description">{{ report.description }}</div>
            </div>
          </template>
        </Column>
        <Column field="reporter_name" header="Reporter" />
        <Column field="created_at" header="Reported">
          <template #body="{ data: report }">
            {{ formatDate(report.created_at) }}
          </template>
        </Column>
        <Column field="status" header="Status" class="col-status">
          <template #body="{ data: report }">
            <Select
              :model-value="report.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              size="small"
              @update:model-value="onStatusChange(report, $event)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </EcPageLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import EcStatusMessage from '../shared/layout/EcStatusMessage.vue';
import { formatDate } from '../shared/util/formatDate';
import { useHeadingStore } from '../toolbar/headingStore';
import { useBugReportStore } from './bugReportStore';
import { useNotifications } from '../notifications/useNotifications';
import { BugReportStatus } from './bugReport.types';
import type { BugReportData } from './bugReport.types';

const headingStore = useHeadingStore();
const store = useBugReportStore();
const notifications = useNotifications();

const statusOptions = [
  { label: 'Open', value: BugReportStatus.Open },
  { label: 'In Progress', value: BugReportStatus.InProgress },
  { label: 'Fixed', value: BugReportStatus.Fixed },
];

onMounted(() => {
  headingStore.setHeading('Bug Reports');
  store.fetchAll();
});

async function onStatusChange(report: BugReportData, newStatus: BugReportStatus) {
  try {
    await store.updateStatus(report.id, newStatus);
    notifications.success('Status updated');
  } catch {
    notifications.error(store.error ?? 'Failed to update status');
  }
}
</script>

<style scoped>
.table-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
  overflow: hidden;
}

.report-title {
  font-weight: 500;
}

.report-description {
  font-size: 0.8125rem;
  color: var(--p-text-muted-color);
  margin-top: 0.125rem;
}

:deep(.col-status) {
  width: 11rem;
}
</style>
