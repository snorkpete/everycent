import { computed, onMounted, ref } from 'vue';
import type { ModelAvailability } from './languageModel.types';
import { getLanguageModelProvider } from './languageModelProvider';

/**
 * Reactive availability of the AI model. `availability` is null while checking.
 * Call `refresh()` after anything that may change it (e.g. a model download).
 */
export function useLanguageModelAvailability() {
  const availability = ref<ModelAvailability | null>(null);

  const isUsable = computed(
    () => availability.value !== null && availability.value !== 'unavailable',
  );

  async function refresh() {
    availability.value = await getLanguageModelProvider().availability();
  }

  onMounted(refresh);

  return { availability, isUsable, refresh };
}
