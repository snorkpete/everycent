import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { reportApi } from '../reportApi';
import type { NeedsVsWantsRow } from './needsVsWants.types';
import type { ReportFieldConfig } from '../report.types';

export const useNeedsVsWantsStore = defineStore('needsVsWants', () => {
  const data = ref<NeedsVsWantsRow[]>([]);
  const fields = ref<ReportFieldConfig[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      const response = await reportApi.getNeedsVsWants();
      data.value = response.data;
      fields.value = response.fields;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load needs vs wants data';
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
