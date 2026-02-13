import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useLoadingIndicatorStore = defineStore(
  'loadingIndicator',
  () => {
    const pendingRequests = ref(0);

    const isLoading = computed(() => pendingRequests.value > 0);

    function startRequest() {
      pendingRequests.value++;
    }

    function finishRequest() {
      if (pendingRequests.value > 0) {
        pendingRequests.value--;
      }
    }

    return { isLoading, startRequest, finishRequest };
  },
);