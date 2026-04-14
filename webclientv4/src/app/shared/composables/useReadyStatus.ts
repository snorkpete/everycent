import { computed, type ComputedRef, type Ref } from 'vue';

/**
 * Derives a reactive `ready` boolean from `loading` and `error` refs.
 *
 * Returns `true` only when the store is neither loading nor in an error state.
 */
export function useReadyStatus(opts: {
  loading: Ref<boolean>;
  error: Ref<string | null>;
}): ComputedRef<boolean> {
  return computed(() => !opts.loading.value && !opts.error.value);
}
