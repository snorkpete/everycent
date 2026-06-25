import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import type { Pinia } from 'pinia';
import { createPinia, setActivePinia } from 'pinia';
import NlqChatWindow from './NlqChatWindow.vue';
import { useChatSettingsStore } from '../chat-settings/chatSettingsStore';
import * as chatAgent from './chatAgent';
import type { AgentEvent } from './chatAgent';

vi.mock('./chatAgent', () => ({
  streamChat: vi.fn(),
}));

vi.mock('../chat-settings/chatSettingsApi', () => ({
  chatSettingsApi: {
    get: vi.fn(),
    save: vi.fn(),
  },
}));

vi.mock('./conversationTurnApi', () => ({
  conversationTurnApi: {
    submitTurn: vi.fn().mockResolvedValue({ steps_created: 0 }),
  },
}));

// Extends the shared DialogStub with the header slot so we can test
// header-rendered content like the mode switch button.
const DialogStub = {
  name: 'Dialog',
  template: '<div><slot name="header" /><slot /><slot name="footer" /></div>',
  props: {
    visible: { type: Boolean },
    modal: { type: Boolean },
    closable: { type: Boolean },
    style: { type: Object },
  },
  emits: ['update:visible'],
};

function configureChatSettings() {
  const chatSettingsStore = useChatSettingsStore();
  chatSettingsStore.settings = {
    chat_enabled: true,
    llm_model_id: 1,
    max_tool_iterations: 5,
    extras: {},
    llm_model: {
      id: 1,
      url: 'http://localhost:11434',
      name: 'test-model',
    },
  };
}

async function* emptyStream(): AsyncGenerator<AgentEvent> {
  yield { type: 'done' };
}

let pinia: Pinia;

function createWrapper(props: { mode?: 'nlq' | 'bug-report'; visible?: boolean } = {}): VueWrapper {
  return mount(NlqChatWindow, {
    props: {
      visible: true,
      mode: 'nlq',
      ...props,
    },
    global: {
      plugins: [PrimeVue, pinia],
      stubs: { Dialog: DialogStub },
    },
  });
}

describe('NlqChatWindow', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    configureChatSettings();
    vi.clearAllMocks();
    vi.mocked(chatAgent.streamChat).mockImplementation(() => emptyStream());
  });

  describe('nlq mode', () => {
    it('shows "Ask Everycent" as the title', () => {
      const wrapper = createWrapper({ mode: 'nlq' });
      expect(wrapper.text()).toContain('Ask Everycent');
    });

    it('shows the finances empty-state placeholder', () => {
      const wrapper = createWrapper({ mode: 'nlq' });
      expect(wrapper.text()).toContain('Ask a question about your finances');
    });

    it('shows "Type a question..." as the textarea placeholder', () => {
      const wrapper = createWrapper({ mode: 'nlq' });
      const textarea = wrapper.find('textarea');
      expect(textarea.attributes('placeholder')).toBe('Type a question...');
    });
  });

  describe('bug-report mode', () => {
    it('shows "Report a bug" as the title', () => {
      const wrapper = createWrapper({ mode: 'bug-report' });
      expect(wrapper.text()).toContain('Report a bug');
    });

    it('shows the bug-report empty-state placeholder', () => {
      const wrapper = createWrapper({ mode: 'bug-report' });
      expect(wrapper.text()).toContain('Describe the problem you ran into');
    });

    it('shows "Describe the problem..." as the textarea placeholder', () => {
      const wrapper = createWrapper({ mode: 'bug-report' });
      const textarea = wrapper.find('textarea');
      expect(textarea.attributes('placeholder')).toBe('Describe the problem...');
    });
  });

  describe('mode switch button', () => {
    it('is present in the header', () => {
      const wrapper = createWrapper({ mode: 'nlq' });
      const button = wrapper.find('[data-testid="mode-switch-button"]');
      expect(button.exists()).toBe(true);
    });

    it('emits switchMode with "bug-report" when in nlq mode', async () => {
      const wrapper = createWrapper({ mode: 'nlq' });
      const button = wrapper.find('[data-testid="mode-switch-button"]');
      await button.trigger('click');
      expect(wrapper.emitted('switch-mode')).toBeDefined();
      expect(wrapper.emitted('switch-mode')?.[0]).toEqual(['bug-report']);
    });

    it('emits switchMode with "nlq" when in bug-report mode', async () => {
      const wrapper = createWrapper({ mode: 'bug-report' });
      const button = wrapper.find('[data-testid="mode-switch-button"]');
      await button.trigger('click');
      expect(wrapper.emitted('switch-mode')).toBeDefined();
      expect(wrapper.emitted('switch-mode')?.[0]).toEqual(['nlq']);
    });
  });

  describe('new chat button', () => {
    it('is disabled when there are no messages', () => {
      const wrapper = createWrapper({ mode: 'nlq' });
      const newChatButton = wrapper.find('[data-testid="new-chat-button"]');
      expect(newChatButton.attributes('disabled')).toBeDefined();
    });
  });
});
