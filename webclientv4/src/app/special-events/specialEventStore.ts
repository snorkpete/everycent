import { ref } from 'vue';
import { defineStore } from 'pinia';
import { specialEventApi } from './specialEventApi';
import type { SpecialEventData, UpdateAllocationsPayload } from './specialEvent.types';

export const useSpecialEventStore = defineStore('specialEvents', () => {
  const specialEvents = ref<SpecialEventData[]>([]);
  const currentSpecialEvent = ref<SpecialEventData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      specialEvents.value = await specialEventApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load special events';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: number) {
    loading.value = true;
    error.value = null;
    try {
      currentSpecialEvent.value = await specialEventApi.getOne(id);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load special event';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function create(data: Partial<SpecialEventData>) {
    loading.value = true;
    error.value = null;
    try {
      await specialEventApi.create(data);
      await fetchAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to create special event';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function update(id: number, data: Partial<SpecialEventData>) {
    loading.value = true;
    error.value = null;
    try {
      await specialEventApi.update(id, data);
      await Promise.all([
        fetchAll(),
        fetchOne(id),
      ]);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update special event';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await specialEventApi.delete(id);
      await fetchAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to delete special event';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateAllocations(id: number, data: UpdateAllocationsPayload) {
    loading.value = true;
    error.value = null;
    try {
      currentSpecialEvent.value = await specialEventApi.updateAllocations(id, data);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update special event allocations';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    specialEvents,
    currentSpecialEvent,
    loading,
    error,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    updateAllocations,
  };
});
