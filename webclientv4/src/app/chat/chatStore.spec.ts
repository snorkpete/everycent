import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useChatStore } from './chatStore';
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

async function* makeStream(events: AgentEvent[]): AsyncGenerator<AgentEvent> {
  for (const event of events) {
    yield event;
  }
}

function configureChatSettings() {
  const chatSettingsStore = useChatSettingsStore();
  chatSettingsStore.settings = {
    chat_enabled: true,
    ollama_url: 'http://localhost:11434',
    ollama_model: 'test-model',
    llm_model_id: null,
    max_tool_iterations: 5,
    extras: {},
  };
}

describe('chatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    configureChatSettings();
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('appends the user message and an empty assistant placeholder', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(makeStream([{ type: 'done' }]));

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(store.messages[0]).toEqual({ role: 'user', content: 'hello' });
      expect(store.messages[1]).toEqual({ role: 'assistant', content: '' });
    });

    it('sets loading to true during the stream and false after', async () => {
      let loadingDuringStream = false;
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        (async function* () {
          loadingDuringStream = useChatStore().loading;
          yield { type: 'done' } as AgentEvent;
        })(),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(loadingDuringStream).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets thinking to true on thinking event', async () => {
      let thinkingDuringStream = false;
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        (async function* () {
          yield { type: 'thinking' } as AgentEvent;
          thinkingDuringStream = useChatStore().thinking;
          yield { type: 'done' } as AgentEvent;
        })(),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(thinkingDuringStream).toBe(true);
      expect(store.thinking).toBe(false);
    });

    it('updates the assistant message content on token events', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([{ type: 'token', content: 'Hello world' }, { type: 'done' }]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(store.messages[1].content).toBe('Hello world');
    });

    it('sets thinking to false on token event', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([{ type: 'thinking' }, { type: 'token', content: 'Hi' }, { type: 'done' }]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(store.thinking).toBe(false);
    });

    it('sets toolStatus when a tool_call event arrives', async () => {
      let statusDuringToolCall = '';
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        (async function* () {
          yield {
            type: 'tool_call',
            name: 'analyze_overspending',
            args: { period: '2026-03' },
          } as AgentEvent;
          statusDuringToolCall = useChatStore().toolStatus ?? '';
          yield { type: 'tool_result', name: 'analyze_overspending', result: '{}' } as AgentEvent;
          yield { type: 'done' } as AgentEvent;
        })(),
      );

      const store = useChatStore();
      await store.sendMessage('overspending?');

      expect(statusDuringToolCall).toBe('Calling analyze_overspending...');
    });

    it('clears toolStatus on tool_result event', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          { type: 'tool_call', name: 'analyze_overspending', args: { period: '2026-03' } },
          { type: 'tool_result', name: 'analyze_overspending', result: '{}' },
          { type: 'done' },
        ]),
      );

      const store = useChatStore();
      await store.sendMessage('overspending?');

      expect(store.toolStatus).toBeNull();
    });

    it('clears toolStatus in finally even if an error is thrown', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        (async function* () {
          yield { type: 'tool_call', name: 'analyze_overspending', args: {} } as AgentEvent;
          throw new Error('unexpected');
        })(),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(store.toolStatus).toBeNull();
    });

    it('sets error and removes placeholder on error event when content is empty', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([{ type: 'error', message: 'Connection failed' }]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(store.error).toBe('Connection failed');
      expect(store.messages.length).toBe(1); // only user message remains
    });

    it('keeps assistant message when error arrives after some content', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          { type: 'token', content: 'Partial' },
          { type: 'error', message: 'Interrupted' },
        ]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(store.messages.length).toBe(2);
      expect(store.messages[1].content).toBe('Partial');
    });

    it('sets error and removes placeholder when stream throws', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        (async function* () {
          throw new Error('Boom');
        })(),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(store.error).toBe('Boom');
      expect(store.messages.length).toBe(1);
    });

    it('clears error before starting a new message', async () => {
      vi.mocked(chatAgent.streamChat)
        .mockReturnValueOnce(makeStream([{ type: 'error', message: 'fail' }]))
        .mockReturnValueOnce(makeStream([{ type: 'done' }]));

      const store = useChatStore();
      await store.sendMessage('first');
      await store.sendMessage('second');

      expect(store.error).toBeNull();
    });
  });

  describe('clearMessages', () => {
    it('empties the messages array', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(makeStream([{ type: 'done' }]));

      const store = useChatStore();
      await store.sendMessage('hello');
      store.clearMessages();

      expect(store.messages).toEqual([]);
    });

    it('clears the error', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([{ type: 'error', message: 'fail' }]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');
      store.clearMessages();

      expect(store.error).toBeNull();
    });
  });

  describe('toolStatus', () => {
    it('starts as null', () => {
      const store = useChatStore();
      expect(store.toolStatus).toBeNull();
    });
  });
});
