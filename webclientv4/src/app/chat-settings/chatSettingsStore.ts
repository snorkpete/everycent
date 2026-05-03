import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { chatSettingsApi } from './chatSettingsApi';
import type { ChatSettingsData } from './chatSettings.types';

const DEFAULT_SETTINGS: ChatSettingsData = {
  chat_enabled: false,
  ollama_url: null,
  ollama_model: null,
  max_tool_iterations: 5,
  extras: {},
};

export const useChatSettingsStore = defineStore('chatSettings', () => {
  const settings = ref<ChatSettingsData>(structuredClone(DEFAULT_SETTINGS));
  const error = ref<string | null>(null);
  const loaded = ref(false);

  const chatEnabled = computed(() => settings.value.chat_enabled);

  async function fetch() {
    if (loaded.value) return;
    error.value = null;
    try {
      settings.value = await chatSettingsApi.get();
      loaded.value = true;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load chat settings';
    }
  }

  async function save(newSettings: ChatSettingsData) {
    error.value = null;
    try {
      settings.value = await chatSettingsApi.save(newSettings);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save chat settings';
      throw e;
    }
  }

  return { settings, error, loaded, chatEnabled, fetch, save };
});
