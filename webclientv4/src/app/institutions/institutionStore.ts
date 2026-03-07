import { ref } from 'vue';
import { defineStore } from 'pinia';
import { institutionApi } from './institutionApi';
import type { InstitutionData } from './institution.types';

export const useInstitutionStore = defineStore('institutions', () => {
  const institutions = ref<InstitutionData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      institutions.value = await institutionApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load institutions';
    } finally {
      loading.value = false;
    }
  }

  async function save(institution: InstitutionData) {
    loading.value = true;
    error.value = null;
    try {
      if (institution.id) {
        await institutionApi.update(institution as InstitutionData & { id: number });
      } else {
        await institutionApi.create(institution);
      }
      await fetchAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save institution';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return { institutions, loading, error, fetchAll, save };
});
