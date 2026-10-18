import { computed, onMounted, ref } from 'vue';
import type { ModelAvailability } from './languageModel.types';
import { getLanguageModelProvider } from './languageModelProvider';

/**
 * Reactive availability of the AI model, as booleans:
 * - isChecking: the check hasn't finished yet (both others are false meanwhile)
 * - isAvailable: the model can be used here, possibly after a one-time install
 * - needsInstall: the model must be installed (downloaded) before first use
 * Call `refresh()` after anything that may change it (e.g. an install).
 */
export function useLanguageModelAvailability() {
  // null while checking
  const availability = ref<ModelAvailability | null>(null);

  const isChecking = computed(() => availability.value === null);
  const isAvailable = computed(
    () => availability.value !== null && availability.value !== 'unavailable',
  );
  const needsInstall = computed(
    () => availability.value === 'downloadable' || availability.value === 'downloading',
  );

  async function refresh() {
    availability.value = await getLanguageModelProvider().installer.availability();
  }

  onMounted(refresh);

  return { isChecking, isAvailable, needsInstall, refresh };
}
