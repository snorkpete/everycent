import { ref } from 'vue';
import { defineStore } from 'pinia';
import { allocationCategoryApi } from './allocationCategoryApi';
import type { AllocationCategoryData } from './allocationCategory.types';

export const useAllocationCategoryStore = defineStore('allocationCategories', () => {
  const allocationCategories = ref<AllocationCategoryData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      allocationCategories.value = await allocationCategoryApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load allocation categories';
    } finally {
      loading.value = false;
    }
  }

  async function save(category: AllocationCategoryData) {
    loading.value = true;
    error.value = null;
    try {
      if (category.id) {
        await allocationCategoryApi.update(category as AllocationCategoryData & { id: number });
      } else {
        await allocationCategoryApi.create(category);
      }
      await fetchAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save allocation category';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return { allocationCategories, loading, error, fetchAll, save };
});
