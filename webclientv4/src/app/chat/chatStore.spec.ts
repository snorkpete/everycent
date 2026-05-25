import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useChatStore } from './chatStore';
import { useChatSettingsStore } from '../chat-settings/chatSettingsStore';
import * as chatAgent from './chatAgent';
import type { AgentEvent } from './chatAgent';
import * as llmUsageApiModule from '../llm-usage/llmUsageApi';

vi.mock('./chatAgent', () => ({
  streamChat: vi.fn(),
}));

vi.mock('../chat-settings/chatSettingsApi', () => ({
  chatSettingsApi: {
    get: vi.fn(),
    save: vi.fn(),
  },
}));

vi.mock('../llm-usage/llmUsageApi', () => ({
  llmUsageApi: {
    submitBatch: vi.fn(),
  },
}));

async function* makeStream(events: AgentEvent[]): AsyncGenerator<AgentEvent> {
  for (const event of events) {
    yield event;
  }
}

function makeUsageEvent(): Extract<AgentEvent, { type: 'usage' }> {
  return {
    type: 'usage',
    usage: {
      input_tokens: 10,
      output_tokens: 20,
      cache_read_tokens: 0,
      cache_write_tokens: 0,
      thinking_tokens: 0,
      total_tokens: 30,
      request_duration_ms: 100,
      tool_call_count: 0,
      tool_calls_detail: [],
      incomplete: false,
    },
  };
}

function configureChatSettings(llmModelId: number | null = null) {
  const chatSettingsStore = useChatSettingsStore();
  chatSettingsStore.settings = {
    chat_enabled: true,
    llm_model_id: llmModelId,
    max_tool_iterations: 5,
    extras: {},
    llm_model: {
      id: llmModelId ?? undefined,
      url: 'http://localhost:11434',
      name: 'test-model',
    },
  };
}

describe('chatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    configureChatSettings();
    vi.clearAllMocks();
    vi.mocked(llmUsageApiModule.llmUsageApi.submitBatch).mockResolvedValue({ created: 1 });
  });

  describe('sendMessage', () => {
    it('appends the user message and an empty assistant placeholder', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(makeStream([{ type: 'done' }]));

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(store.messages[0]).toEqual({ role: 'user', content: 'hello' });
      expect(store.messages[1]).toMatchObject({ role: 'assistant', content: '' });
      expect(store.messages[1].turnId).toBeTypeOf('string');
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
          yield { type: 'thinking', content: '' } as AgentEvent;
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
        makeStream([
          { type: 'thinking', content: '' },
          { type: 'token', content: 'Hi' },
          { type: 'done' },
        ]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(store.thinking).toBe(false);
    });

    it('accumulates thinking content onto the assistant message', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          { type: 'thinking', content: 'Reasoning...' },
          { type: 'thinking', content: 'Reasoning... more.' },
          { type: 'token', content: 'Answer' },
          { type: 'done' },
        ]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(store.messages[1].thinking).toBe('Reasoning... more.');
    });

    it('leaves thinking undefined on the assistant message when no thinking events with content arrive', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          { type: 'thinking', content: '' },
          { type: 'token', content: 'Hi' },
          { type: 'done' },
        ]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(store.messages[1].thinking).toBeUndefined();
    });

    it('does not set thinking spinner true on content-bearing thinking events', async () => {
      // Content-bearing thinking events mean thinking is actively streaming in the
      // per-message disclosure — the global spinner should not appear.
      let thinkingDuringContentThinking = true; // assume true, should stay false
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        (async function* () {
          yield { type: 'thinking', content: '' } as AgentEvent;
          yield { type: 'thinking', content: 'Reasoning...' } as AgentEvent;
          thinkingDuringContentThinking = useChatStore().thinking;
          yield { type: 'token', content: 'Answer' } as AgentEvent;
          yield { type: 'done' } as AgentEvent;
        })(),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(thinkingDuringContentThinking).toBe(false);
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

  describe('conversation tracking', () => {
    it('generates a conversationId when the store is created', () => {
      const store = useChatStore();
      expect(store.conversationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('regenerates conversationId when clearMessages is called', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(makeStream([{ type: 'done' }]));

      const store = useChatStore();
      const original = store.conversationId;
      await store.sendMessage('hello');
      store.clearMessages();

      expect(store.conversationId).not.toBe(original);
      expect(store.conversationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('keeps conversationId stable across multiple sendMessage calls in the same session', async () => {
      // Fresh generator per call — mockReturnValue with a single generator would
      // exhaust on the first call and skip the streaming path on the second.
      vi.mocked(chatAgent.streamChat).mockImplementation(
        () => makeStream([{ type: 'done' }]) as unknown as ReturnType<typeof chatAgent.streamChat>,
      );

      const store = useChatStore();
      const original = store.conversationId;
      await store.sendMessage('first');
      await store.sendMessage('second');

      expect(store.conversationId).toBe(original);
    });

    it('generates a fresh conversationTurnId for each sendMessage call', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(makeStream([{ type: 'done' }]));

      const store = useChatStore();
      const capturedTurnIds: string[] = [];

      vi.mocked(chatAgent.streamChat).mockImplementation(async function* () {
        capturedTurnIds.push(store.conversationTurnId);
        yield { type: 'done' } as AgentEvent;
      } as unknown as typeof chatAgent.streamChat);

      await store.sendMessage('first');
      await store.sendMessage('second');

      expect(capturedTurnIds.length).toBe(2);
      expect(capturedTurnIds[0]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(capturedTurnIds[1]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(capturedTurnIds[0]).not.toBe(capturedTurnIds[1]);
    });
  });

  describe('usage tracking', () => {
    it('calls submitBatch with accumulated usage records when llm_model_id is set', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(llmUsageApiModule.llmUsageApi.submitBatch).toHaveBeenCalledOnce();
      const batch = vi.mocked(llmUsageApiModule.llmUsageApi.submitBatch).mock.calls[0][0];
      expect(batch.llm_model_id).toBe(42);
      expect(batch.records).toHaveLength(1);
      const record = batch.records[0];
      expect(record.llm_model_id).toBe(42);
      expect(record.usage_category).toBe('chat');
      expect(record.conversation_id).toBe(store.conversationId);
      expect(record.conversation_turn_id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(record.input_tokens).toBe(10);
      expect(record.output_tokens).toBe(20);
      expect(record.total_tokens).toBe(30);
      expect(record.incomplete).toBe(false);
      expect(record.extras).toEqual({});
    });

    it('accumulates multiple usage events from a multi-iteration turn', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      const batch = vi.mocked(llmUsageApiModule.llmUsageApi.submitBatch).mock.calls[0][0];
      expect(batch.records).toHaveLength(2);
    });

    it('does NOT call submitBatch when there are no usage records', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(makeStream([{ type: 'done' }]));

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(llmUsageApiModule.llmUsageApi.submitBatch).not.toHaveBeenCalled();
    });

    it('does NOT call submitBatch when llm_model_id is null', async () => {
      configureChatSettings(null);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(llmUsageApiModule.llmUsageApi.submitBatch).not.toHaveBeenCalled();
    });

    it('logs a warning when llm_model_id is null and usage records were captured', async () => {
      configureChatSettings(null);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('llm_model_id is null'));
      warnSpy.mockRestore();
    });

    it('catches submitBatch failures and does not bubble them to UI', async () => {
      configureChatSettings(42);
      vi.mocked(llmUsageApiModule.llmUsageApi.submitBatch).mockRejectedValue(
        new Error('Network error'),
      );
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      // Error should not surface to the store
      expect(store.error).toBeNull();
      // But it should be logged — wait a tick for the rejected promise to settle
      await Promise.resolve();
      expect(errorSpy).toHaveBeenCalledWith('Failed to submit usage records', expect.any(Error));
      errorSpy.mockRestore();
    });

    it('resets the usage buffer at the start of each sendMessage call', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat)
        .mockReturnValueOnce(makeStream([makeUsageEvent(), { type: 'done' }]))
        .mockReturnValueOnce(makeStream([{ type: 'done' }]));

      const store = useChatStore();
      await store.sendMessage('first');
      await store.sendMessage('second');

      // Second call: no usage event, so submitBatch should only be called once (from the first)
      expect(llmUsageApiModule.llmUsageApi.submitBatch).toHaveBeenCalledOnce();
    });

    it('includes correct conversation_id from the store across turns', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockImplementation(() =>
        makeStream([makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore();
      const expectedConversationId = store.conversationId;
      await store.sendMessage('first');
      await store.sendMessage('second');

      const calls = vi.mocked(llmUsageApiModule.llmUsageApi.submitBatch).mock.calls;
      expect(calls).toHaveLength(2);
      expect(calls[0][0].records[0].conversation_id).toBe(expectedConversationId);
      expect(calls[1][0].records[0].conversation_id).toBe(expectedConversationId);
    });

    it('uses different conversation_turn_id for each sendMessage call', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockImplementation(() =>
        makeStream([makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore();
      await store.sendMessage('first');
      await store.sendMessage('second');

      const calls = vi.mocked(llmUsageApiModule.llmUsageApi.submitBatch).mock.calls;
      const turnId1 = calls[0][0].records[0].conversation_turn_id;
      const turnId2 = calls[1][0].records[0].conversation_turn_id;
      expect(turnId1).not.toBe(turnId2);
    });

    it('snapshots llm_model_id at turn start — settings change mid-stream is ignored', async () => {
      configureChatSettings(42);
      // Generator changes settings mid-stream between the usage event and 'done'.
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        (async function* () {
          yield makeUsageEvent() as AgentEvent;
          // Settings update during the stream — should NOT affect the batch.
          configureChatSettings(99);
          yield { type: 'done' } as AgentEvent;
        })(),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      const calls = vi.mocked(llmUsageApiModule.llmUsageApi.submitBatch).mock.calls;
      expect(calls).toHaveLength(1);
      // Both the batch top-level llm_model_id and each record's llm_model_id
      // come from the captured value at turn start (42), not the new value (99).
      expect(calls[0][0].llm_model_id).toBe(42);
      expect(calls[0][0].records[0].llm_model_id).toBe(42);
    });

    it('still submits accumulated usage records when the turn ends with an error event', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), { type: 'error', message: 'something broke' } as AgentEvent]),
      );

      const store = useChatStore();
      await store.sendMessage('hello');

      // Cost was incurred — we still want it recorded even though the turn errored.
      expect(llmUsageApiModule.llmUsageApi.submitBatch).toHaveBeenCalledOnce();
      expect(store.error).toBe('something broke');
    });
  });
});
