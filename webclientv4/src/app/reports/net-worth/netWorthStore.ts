import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { reportApi } from '../reportApi';
import type { NetWorthRow } from './netWorth.types';
import type { ReportFieldConfig } from '../report.types';

export const useNetWorthStore = defineStore('netWorth', () => {
  const data = ref<NetWorthRow[]>([]);
  const fields = ref<ReportFieldConfig[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      const response = await reportApi.getNetWorth();
      data.value = response.data;
      fields.value = response.fields;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load net worth data';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  const ready = computed(() => !loading.value && !error.value);

  return {
    data,
    fields,
    loading,
    error,
    ready,
    fetch,
  };
});
