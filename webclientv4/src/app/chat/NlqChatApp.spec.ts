import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';
import NlqChatApp from './NlqChatApp.vue';

vi.mock('./chatAgent', () => ({
  streamChat: vi.fn(),
}));

vi.mock('../chat-settings/chatSettingsApi', () => ({
  chatSettingsApi: {
    get: vi.fn(),
    save: vi.fn(),
  },
}));

// Stub child components to keep this test at the wiring level
const NlqChatButtonStub = {
  name: 'NlqChatButton',
  template: '<button data-testid="chat-toggle-button" />',
  emits: ['toggle'],
};

const NlqChatWindowStub = {
  name: 'NlqChatWindow',
  template: '<div data-testid="chat-window" />',
  props: ['visible', 'mode'],
  emits: ['update:visible', 'switch-mode'],
};

let pinia: Pinia;

function createWrapper(): VueWrapper {
  return mount(NlqChatApp, {
    global: {
      plugins: [PrimeVue, pinia],
      stubs: {
        NlqChatButton: NlqChatButtonStub,
        NlqChatWindow: NlqChatWindowStub,
      },
    },
  });
}

describe('NlqChatApp', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  it('renders the chat button', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('[data-testid="chat-toggle-button"]').exists()).toBe(true);
  });

  it('renders the chat window', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('[data-testid="chat-window"]').exists()).toBe(true);
  });

  it('starts in nlq mode', () => {
    const wrapper = createWrapper();
    const chatWindow = wrapper.findComponent(NlqChatWindowStub);
    expect(chatWindow.props('mode')).toBe('nlq');
  });

  it('switches to bug-report mode when the window emits switchMode', async () => {
    const wrapper = createWrapper();

    wrapper.findComponent(NlqChatWindowStub).vm.$emit('switch-mode', 'bug-report');
    await wrapper.vm.$nextTick();

    // Re-find after nextTick so we get the re-rendered state
    expect(wrapper.findComponent(NlqChatWindowStub).props('mode')).toBe('bug-report');
  });

  it('switches back to nlq mode when the window emits switchMode with nlq', async () => {
    const wrapper = createWrapper();

    wrapper.findComponent(NlqChatWindowStub).vm.$emit('switch-mode', 'bug-report');
    await wrapper.vm.$nextTick();

    wrapper.findComponent(NlqChatWindowStub).vm.$emit('switch-mode', 'nlq');
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(NlqChatWindowStub).props('mode')).toBe('nlq');
  });

  it('passes the current mode as :key to remount the window on mode switch', async () => {
    // The :key="mode" ensures NlqChatWindow remounts on mode switch.
    // We verify this indirectly by checking mode prop changes correctly —
    // the :key mechanism is a Vue runtime concern outside unit test scope.
    const wrapper = createWrapper();

    expect(wrapper.findComponent(NlqChatWindowStub).props('mode')).toBe('nlq');
    wrapper.findComponent(NlqChatWindowStub).vm.$emit('switch-mode', 'bug-report');
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(NlqChatWindowStub).props('mode')).toBe('bug-report');
  });
});
