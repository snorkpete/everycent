import { ref } from 'vue';
import { defineStore } from 'pinia';
import { llmModelApi } from './llmModelApi';
import type { LlmModelData } from './llmModel.types';

export const useLlmModelStore = defineStore('llmModels', () => {
  const models = ref<LlmModelData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      models.value = await llmModelApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load LLM models';
    } finally {
      loading.value = false;
    }
  }

  async function save(model: LlmModelData) {
    loading.value = true;
    error.value = null;
    try {
      if (model.id) {
        await llmModelApi.update(model as LlmModelData & { id: number });
      } else {
        await llmModelApi.create(model);
      }
      await fetchAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save LLM model';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function destroy(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await llmModelApi.destroy(id);
      await fetchAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to delete LLM model';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return { models, loading, error, fetchAll, save, destroy };
});
