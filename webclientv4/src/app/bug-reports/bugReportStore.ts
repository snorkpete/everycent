import { ref } from 'vue';
import { defineStore } from 'pinia';
import { bugReportApi } from './bugReportApi';
import type { BugReportData, BugReportStatus } from './bugReport.types';

export const useBugReportStore = defineStore('bugReports', () => {
  const reports = ref<BugReportData[]>([]);
  const error = ref<string | null>(null);

  async function fetchAll() {
    error.value = null;
    try {
      reports.value = await bugReportApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load bug reports';
    }
  }

  async function updateStatus(id: number, status: BugReportStatus) {
    error.value = null;
    try {
      const updated = await bugReportApi.updateStatus(id, status);
      const index = reports.value.findIndex((r) => r.id === id);
      if (index !== -1) {
        reports.value[index] = updated;
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update bug report';
      throw e;
    }
  }

  return {
    reports,
    error,
    fetchAll,
    updateStatus,
  };
});
