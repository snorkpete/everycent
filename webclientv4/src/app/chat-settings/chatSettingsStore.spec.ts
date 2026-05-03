import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useChatSettingsStore } from './chatSettingsStore';
import { chatSettingsApi } from './chatSettingsApi';
import type { ChatSettingsData } from './chatSettings.types';

vi.mock('./chatSettingsApi', () => ({
  chatSettingsApi: {
    get: vi.fn(),
    save: vi.fn(),
  },
}));

const LOADED_SETTINGS: ChatSettingsData = {
  chat_enabled: true,
  ollama_url: 'http://192.168.68.59:11434',
  ollama_model: 'qwen3:14b',
  max_tool_iterations: 10,
  extras: { temperature: 0.7 },
};

describe('chatSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with chat disabled', () => {
      const store = useChatSettingsStore();
      expect(store.chatEnabled).toBe(false);
    });

    it('starts with default settings', () => {
      const store = useChatSettingsStore();
      expect(store.settings).toEqual({
        chat_enabled: false,
        ollama_url: null,
        ollama_model: null,
        max_tool_iterations: 5,
        extras: {},
      });
    });

    it('starts not loaded', () => {
      const store = useChatSettingsStore();
      expect(store.loaded).toBe(false);
    });
  });

  describe('fetch', () => {
    it('loads settings from the API', async () => {
      vi.mocked(chatSettingsApi.get).mockResolvedValue(LOADED_SETTINGS);

      const store = useChatSettingsStore();
      await store.fetch();

      expect(store.settings).toEqual(LOADED_SETTINGS);
      expect(store.loaded).toBe(true);
    });

    it('sets chatEnabled computed from settings', async () => {
      vi.mocked(chatSettingsApi.get).mockResolvedValue(LOADED_SETTINGS);

      const store = useChatSettingsStore();
      await store.fetch();

      expect(store.chatEnabled).toBe(true);
    });

    it('does not re-fetch once loaded', async () => {
      vi.mocked(chatSettingsApi.get).mockResolvedValue(LOADED_SETTINGS);

      const store = useChatSettingsStore();
      await store.fetch();
      await store.fetch();

      expect(chatSettingsApi.get).toHaveBeenCalledTimes(1);
    });

    it('sets error on failure', async () => {
      vi.mocked(chatSettingsApi.get).mockRejectedValue(new Error('Network error'));

      const store = useChatSettingsStore();
      await store.fetch();

      expect(store.error).toBe('Network error');
      expect(store.loaded).toBe(false);
    });
  });

  describe('save', () => {
    it('updates settings from the API response', async () => {
      vi.mocked(chatSettingsApi.save).mockResolvedValue(LOADED_SETTINGS);

      const store = useChatSettingsStore();
      await store.save(LOADED_SETTINGS);

      expect(store.settings).toEqual(LOADED_SETTINGS);
    });

    it('sets error and re-throws on failure', async () => {
      vi.mocked(chatSettingsApi.save).mockRejectedValue(new Error('Save failed'));

      const store = useChatSettingsStore();

      await expect(store.save(LOADED_SETTINGS)).rejects.toThrow('Save failed');
      expect(store.error).toBe('Save failed');
    });
  });
});
