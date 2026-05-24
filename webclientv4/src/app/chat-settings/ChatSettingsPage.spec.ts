import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ChatSettingsPage from './ChatSettingsPage.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { useChatSettingsStore } from './chatSettingsStore';
import { useLlmModelStore } from '../llm-models/llmModelStore';
import { chatSettingsApi } from './chatSettingsApi';
import { llmModelApi } from '../llm-models/llmModelApi';
import { buildChatSettings } from '../../test/factories';

vi.mock('./chatSettingsApi', () => ({
  chatSettingsApi: {
    get: vi.fn(),
    save: vi.fn(),
  },
}));

vi.mock('../llm-models/llmModelApi', () => ({
  llmModelApi: {
    getAll: vi.fn(),
  },
}));

const mockNotifyError = vi.fn();
const mockNotifySuccess = vi.fn();
vi.mock('../notifications/useNotifications', () => ({
  useNotifications: () => ({
    error: mockNotifyError,
    success: mockNotifySuccess,
    info: vi.fn(),
  }),
}));

const configuredSettings = buildChatSettings({
  chat_enabled: true,
  ollama_url: 'http://192.168.68.59:11434',
  ollama_model: 'qwen3:14b',
  max_tool_iterations: 10,
  extras: { temperature: 0.7 },
});

const registeredModels = [
  {
    id: 1,
    provider: 'anthropic',
    name: 'claude-sonnet-4-6',
    display_name: 'Claude Sonnet',
    active: true,
  },
  { id: 2, provider: 'ollama', name: 'qwen3:14b', display_name: '', active: true },
];

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(ChatSettingsPage, {
    global: {
      plugins: [PrimeVue, pinia],
      stubs: { Textarea: true },
    },
  });
}

describe('ChatSettingsPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    vi.mocked(chatSettingsApi.get).mockResolvedValue(configuredSettings);
    vi.mocked(chatSettingsApi.save).mockResolvedValue(configuredSettings);
    vi.mocked(llmModelApi.getAll).mockResolvedValue(registeredModels);
  });

  describe('on mount', () => {
    it('sets the page heading to "Chat Settings"', async () => {
      createWrapper(pinia);
      await flushPromises();

      const headingStore = useHeadingStore();
      expect(headingStore.heading).toBe('Chat Settings');
    });

    it('calls the API to fetch chat settings on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(chatSettingsApi.get).toHaveBeenCalled();
    });

    it('sets the store error when the API fails on mount', async () => {
      vi.mocked(chatSettingsApi.get).mockRejectedValue(new Error('Network error'));
      createWrapper(pinia);
      await flushPromises();

      const store = useChatSettingsStore();
      expect(store.error).toBe('Network error');
    });
  });

  describe('view mode (default)', () => {
    it('shows the "Make Changes" button', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
    });

    it('does not show "Save" or "Cancel" buttons', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(false);
    });

    it('displays the chat enabled status as text', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const toggle = wrapper.find('[data-testid="chat-enabled"]');
      expect(toggle.exists()).toBe(false);
      expect(wrapper.text()).toContain('Yes');
    });

    it('displays the Ollama URL', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('http://192.168.68.59:11434');
    });

    it('displays the model name', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('qwen3:14b');
    });

    it('displays the max tool iterations', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain('10');
    });
  });

  describe('edit mode', () => {
    it('switches to edit mode when "Make Changes" is clicked', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(true);
    });

    it('shows a toggle switch for chat enabled in edit mode', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="chat-enabled"]').exists()).toBe(true);
    });
  });

  describe('on save', () => {
    it('calls the API to save settings', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(chatSettingsApi.save).toHaveBeenCalled();
    });

    it('returns to view mode and shows a success toast after save', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Chat settings saved');
    });

    it('stays in edit mode and shows an error toast when save fails', async () => {
      vi.mocked(chatSettingsApi.save).mockRejectedValue(new Error('Server error'));
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
    });
  });

  describe('cancel', () => {
    it('returns to view mode', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
    });
  });

  describe('model field', () => {
    it('fetches models from the LLM model store on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(llmModelApi.getAll).toHaveBeenCalled();
    });

    it('renders the model field', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="llm-model"]').exists()).toBe(true);
    });

    it('populates modelItems from the LLM model store', async () => {
      createWrapper(pinia);
      await flushPromises();

      const store = useLlmModelStore();
      expect(store.models).toHaveLength(2);
    });

    it('uses display_name when available', async () => {
      createWrapper(pinia);
      await flushPromises();

      const store = useLlmModelStore();
      // Claude Sonnet has a display_name; the item name should reflect it
      expect(store.models[0].display_name).toBe('Claude Sonnet');
    });

    it('falls back to provider/name when display_name is absent', async () => {
      createWrapper(pinia);
      await flushPromises();

      const store = useLlmModelStore();
      // qwen3:14b has an empty display_name
      expect(store.models[1].display_name).toBe('');
      expect(store.models[1].name).toBe('qwen3:14b');
    });

    it('includes llm_model_id in the payload sent to save', async () => {
      const settingsWithModel = buildChatSettings({ llm_model_id: 1 });
      vi.mocked(chatSettingsApi.get).mockResolvedValue(settingsWithModel);
      vi.mocked(chatSettingsApi.save).mockResolvedValue(settingsWithModel);

      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(chatSettingsApi.save).toHaveBeenCalledWith(
        expect.objectContaining({ llm_model_id: 1 }),
      );
    });

    it('sends llm_model_id as null when no model is selected', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(chatSettingsApi.save).toHaveBeenCalledWith(
        expect.objectContaining({ llm_model_id: null }),
      );
    });
  });
});
