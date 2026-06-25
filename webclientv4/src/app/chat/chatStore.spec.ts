import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useChatStore } from './chatStore';
import { useChatSettingsStore } from '../chat-settings/chatSettingsStore';
import * as chatAgent from './chatAgent';
import type { AgentEvent } from './chatAgent';
import * as conversationTurnApiModule from './conversationTurnApi';

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
    submitTurn: vi.fn(),
  },
}));

async function* makeStream(events: AgentEvent[]): AsyncGenerator<AgentEvent> {
  for (const event of events) {
    yield event;
  }
}

function makeUsageEvent(
  overrides: Partial<{ input_tokens: number; output_tokens: number; total_tokens: number }> = {},
): Extract<AgentEvent, { type: 'usage' }> {
  return {
    type: 'usage',
    usage: {
      input_tokens: overrides.input_tokens ?? 10,
      output_tokens: overrides.output_tokens ?? 20,
      cache_read_tokens: 0,
      cache_write_tokens: 0,
      thinking_tokens: 0,
      total_tokens: overrides.total_tokens ?? 30,
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
    vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mockResolvedValue({
      steps_created: 1,
    });
  });

  describe('sendMessage', () => {
    it('appends the user message and an empty assistant placeholder', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(makeStream([{ type: 'done' }]));

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      expect(store.messages[0]).toEqual({ role: 'user', content: 'hello' });
      expect(store.messages[1]).toMatchObject({ role: 'assistant', content: '' });
      expect(store.messages[1].turnId).toBeTypeOf('string');
    });

    it('sets loading to true during the stream and false after', async () => {
      let loadingDuringStream = false;
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        (async function* () {
          loadingDuringStream = useChatStore('nlq').loading;
          yield { type: 'done' } as AgentEvent;
        })(),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      expect(loadingDuringStream).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets thinking to true on thinking event', async () => {
      let thinkingDuringStream = false;
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        (async function* () {
          yield { type: 'thinking', content: '' } as AgentEvent;
          thinkingDuringStream = useChatStore('nlq').thinking;
          yield { type: 'done' } as AgentEvent;
        })(),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      expect(thinkingDuringStream).toBe(true);
      expect(store.thinking).toBe(false);
    });

    it('updates the assistant message content on token events', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([{ type: 'token', content: 'Hello world' }, { type: 'done' }]),
      );

      const store = useChatStore('nlq');
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

      const store = useChatStore('nlq');
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

      const store = useChatStore('nlq');
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

      const store = useChatStore('nlq');
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
          thinkingDuringContentThinking = useChatStore('nlq').thinking;
          yield { type: 'token', content: 'Answer' } as AgentEvent;
          yield { type: 'done' } as AgentEvent;
        })(),
      );

      const store = useChatStore('nlq');
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
          statusDuringToolCall = useChatStore('nlq').toolStatus ?? '';
          yield { type: 'tool_result', name: 'analyze_overspending', result: '{}' } as AgentEvent;
          yield { type: 'done' } as AgentEvent;
        })(),
      );

      const store = useChatStore('nlq');
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

      const store = useChatStore('nlq');
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

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      expect(store.toolStatus).toBeNull();
    });

    it('sets error and removes placeholder on error event when content is empty', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([{ type: 'error', message: 'Connection failed' }]),
      );

      const store = useChatStore('nlq');
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

      const store = useChatStore('nlq');
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

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      expect(store.error).toBe('Boom');
      expect(store.messages.length).toBe(1);
    });

    it('clears error before starting a new message', async () => {
      vi.mocked(chatAgent.streamChat)
        .mockReturnValueOnce(makeStream([{ type: 'error', message: 'fail' }]))
        .mockReturnValueOnce(makeStream([{ type: 'done' }]));

      const store = useChatStore('nlq');
      await store.sendMessage('first');
      await store.sendMessage('second');

      expect(store.error).toBeNull();
    });
  });

  describe('clearMessages', () => {
    it('empties the messages array', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(makeStream([{ type: 'done' }]));

      const store = useChatStore('nlq');
      await store.sendMessage('hello');
      store.clearMessages();

      expect(store.messages).toEqual([]);
    });

    it('clears the error', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([{ type: 'error', message: 'fail' }]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');
      store.clearMessages();

      expect(store.error).toBeNull();
    });
  });

  describe('toolStatus', () => {
    it('starts as null', () => {
      const store = useChatStore('nlq');
      expect(store.toolStatus).toBeNull();
    });
  });

  describe('conversation tracking', () => {
    it('generates a conversationId when the store is created', () => {
      const store = useChatStore('nlq');
      expect(store.conversationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('regenerates conversationId when clearMessages is called', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(makeStream([{ type: 'done' }]));

      const store = useChatStore('nlq');
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
      vi.mocked(chatAgent.streamChat).mockImplementation(() => makeStream([{ type: 'done' }]));

      const store = useChatStore('nlq');
      const original = store.conversationId;
      await store.sendMessage('first');
      await store.sendMessage('second');

      expect(store.conversationId).toBe(original);
    });

    it('generates a fresh conversationTurnId for each sendMessage call', async () => {
      vi.mocked(chatAgent.streamChat).mockReturnValue(makeStream([{ type: 'done' }]));

      const store = useChatStore('nlq');
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

  describe('turn capture — params and results', () => {
    it('captures tool-call params (does not discard event.args)', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          { type: 'tool_call', name: 'analyze_overspending', args: { period: '2026-03' } },
          { type: 'tool_result', name: 'analyze_overspending', result: '{"categories":[]}' },
          makeUsageEvent(),
          { type: 'token', content: 'Done' },
          makeUsageEvent(),
          { type: 'done' },
        ]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.steps[0].tool_calls[0].params).toEqual({ period: '2026-03' });
    });

    it('captures tool-call results', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          { type: 'tool_call', name: 'analyze_overspending', args: {} },
          { type: 'tool_result', name: 'analyze_overspending', result: '{"categories":[]}' },
          makeUsageEvent(),
          { type: 'token', content: 'Done' },
          makeUsageEvent(),
          { type: 'done' },
        ]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.steps[0].tool_calls[0].result).toBe('{"categories":[]}');
    });

    it('captures the tool-call name', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          { type: 'tool_call', name: 'analyze_overspending', args: {} },
          { type: 'tool_result', name: 'analyze_overspending', result: '{}' },
          makeUsageEvent(),
          { type: 'token', content: 'Done' },
          makeUsageEvent(),
          { type: 'done' },
        ]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.steps[0].tool_calls[0].name).toBe('analyze_overspending');
    });

    it('correctly pairs results when two different tools are called in the same step', async () => {
      // Verifies that tool_result matching is by name, not array position.
      // Step sequence: tool_call A → tool_result A → tool_call B → tool_result B → usage
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          { type: 'tool_call', name: 'analyze_overspending', args: { period: '2026-03' } },
          { type: 'tool_result', name: 'analyze_overspending', result: 'result-A' },
          {
            type: 'tool_call',
            name: 'sink_fund_status',
            args: { allocation_category_id: 5 },
          },
          { type: 'tool_result', name: 'sink_fund_status', result: 'result-B' },
          makeUsageEvent(),
          { type: 'token', content: 'Done' },
          makeUsageEvent(),
          { type: 'done' },
        ]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      const step0 = turn.steps[0];
      expect(step0.tool_calls).toHaveLength(2);
      expect(step0.tool_calls[0].name).toBe('analyze_overspending');
      expect(step0.tool_calls[0].result).toBe('result-A');
      expect(step0.tool_calls[1].name).toBe('sink_fund_status');
      expect(step0.tool_calls[1].result).toBe('result-B');
    });
  });

  describe('turn capture — per-step thinking accumulation', () => {
    it('captures thinking for a single-step turn', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          { type: 'thinking', content: 'I am reasoning' },
          { type: 'token', content: 'Answer' },
          makeUsageEvent(),
          { type: 'done' },
        ]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.steps[0].thinking).toBe('I am reasoning');
    });

    it('accumulates thinking per step — each step retains its own reasoning', async () => {
      // Two-step turn: step 0 has tool calls + thinking, step 1 has different thinking
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          // Step 0: tool call with thinking
          { type: 'thinking', content: 'Step 0 reasoning' },
          { type: 'tool_call', name: 'analyze_overspending', args: { period: '2026-03' } },
          { type: 'tool_result', name: 'analyze_overspending', result: '{}' },
          makeUsageEvent({ input_tokens: 10 }),
          // Step 1: final text with different thinking
          { type: 'thinking', content: 'Step 1 reasoning' },
          { type: 'token', content: 'Final answer' },
          makeUsageEvent({ input_tokens: 20 }),
          { type: 'done' },
        ]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.steps).toHaveLength(2);
      // Each step has its own thinking — not overwritten by the next step's
      expect(turn.steps[0].thinking).toBe('Step 0 reasoning');
      expect(turn.steps[1].thinking).toBe('Step 1 reasoning');
    });

    it('empty thinking string when no thinking events precede a step', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          // No thinking event before this step
          { type: 'token', content: 'Quick answer' },
          makeUsageEvent(),
          { type: 'done' },
        ]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.steps[0].thinking).toBe('');
    });
  });

  describe('turn capture — turn-level fields', () => {
    it('captures the user_prompt at turn level', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([{ type: 'token', content: 'Hello' }, makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('What is my budget?');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.user_prompt).toBe('What is my budget?');
    });

    it('captures final_output as the last token content', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          { type: 'token', content: 'Hello' },
          { type: 'token', content: 'Hello world' },
          makeUsageEvent(),
          { type: 'done' },
        ]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.final_output).toBe('Hello world');
    });

    it('sends final_output as null when no token events arrive (tool-only turn)', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          { type: 'tool_call', name: 'analyze_overspending', args: {} },
          { type: 'tool_result', name: 'analyze_overspending', result: '{}' },
          makeUsageEvent(),
          { type: 'done' },
        ]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.final_output).toBeNull();
    });

    it('includes conversation_id and conversation_turn_id in the turn', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.conversation_id).toBe(store.conversationId);
      expect(turn.conversation_turn_id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe('turn flush — DTO assembly and POST', () => {
    it('POSTs exactly once per turn to conversationTurnApi', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      expect(conversationTurnApiModule.conversationTurnApi.submitTurn).toHaveBeenCalledOnce();
    });

    it('does NOT call submitTurn when there are no steps (no usage events)', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(makeStream([{ type: 'done' }]));

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      expect(conversationTurnApiModule.conversationTurnApi.submitTurn).not.toHaveBeenCalled();
    });

    it('does NOT call submitTurn when llm_model_id is null', async () => {
      configureChatSettings(null);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      expect(conversationTurnApiModule.conversationTurnApi.submitTurn).not.toHaveBeenCalled();
    });

    it('logs a warning when llm_model_id is null and steps were captured', async () => {
      configureChatSettings(null);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('llm_model_id is null'));
      warnSpy.mockRestore();
    });

    it('assembles steps in order (first usage event = step 0, second = step 1)', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([
          { type: 'tool_call', name: 'analyze_overspending', args: { period: '2026-03' } },
          { type: 'tool_result', name: 'analyze_overspending', result: 'result-A' },
          makeUsageEvent({ input_tokens: 10 }),
          { type: 'token', content: 'Final' },
          makeUsageEvent({ input_tokens: 20 }),
          { type: 'done' },
        ]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.steps).toHaveLength(2);
      // Step 0 has the tool call
      expect(turn.steps[0].tool_calls[0].name).toBe('analyze_overspending');
      expect(turn.steps[0].usage.input_tokens).toBe(10);
      // Step 1 has no tool calls (it's the final text step)
      expect(turn.steps[1].tool_calls).toHaveLength(0);
      expect(turn.steps[1].usage.input_tokens).toBe(20);
    });

    it('snapshots llm_model_id at turn start — settings change mid-stream is ignored', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        (async function* () {
          yield makeUsageEvent() as AgentEvent;
          // Settings update during the stream — should NOT affect the turn.
          configureChatSettings(99);
          yield { type: 'done' } as AgentEvent;
        })(),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.llm_model_id).toBe(42);
    });

    it('still submits the turn when it ends with an error event', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), { type: 'error', message: 'something broke' } as AgentEvent]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      // Cost was incurred — we still want it recorded even though the turn errored.
      expect(conversationTurnApiModule.conversationTurnApi.submitTurn).toHaveBeenCalledOnce();
      expect(store.error).toBe('something broke');
    });

    it('catches submitTurn failures and does not bubble them to UI', async () => {
      configureChatSettings(42);
      vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mockRejectedValue(
        new Error('Network error'),
      );
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      // Error should not surface to the store
      expect(store.error).toBeNull();
      // But it should be logged — wait a tick for the rejected promise to settle
      await Promise.resolve();
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to submit conversation turn',
        expect.any(Error),
      );
      errorSpy.mockRestore();
    });

    it('resets the step buffer at the start of each sendMessage call', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat)
        .mockReturnValueOnce(makeStream([makeUsageEvent(), { type: 'done' }]))
        .mockReturnValueOnce(makeStream([{ type: 'done' }]));

      const store = useChatStore('nlq');
      await store.sendMessage('first');
      await store.sendMessage('second');

      // Second call: no usage event, so submitTurn should only be called once (from the first)
      expect(conversationTurnApiModule.conversationTurnApi.submitTurn).toHaveBeenCalledOnce();
    });

    it('uses different conversation_turn_id for each sendMessage call', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockImplementation(() =>
        makeStream([makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('first');
      await store.sendMessage('second');

      const calls = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock.calls;
      expect(calls[0][0].conversation_turn_id).not.toBe(calls[1][0].conversation_turn_id);
    });

    it('sends usage_category as chat for all steps', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent(), makeUsageEvent(), { type: 'done' }]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      for (const step of turn.steps) {
        expect(step.usage.usage_category).toBe('chat');
      }
    });

    it('maps usage token fields correctly from the usage event', async () => {
      configureChatSettings(42);
      vi.mocked(chatAgent.streamChat).mockReturnValue(
        makeStream([makeUsageEvent({ input_tokens: 50, output_tokens: 75 }), { type: 'done' }]),
      );

      const store = useChatStore('nlq');
      await store.sendMessage('hello');

      const turn = vi.mocked(conversationTurnApiModule.conversationTurnApi.submitTurn).mock
        .calls[0][0];
      expect(turn.steps[0].usage.input_tokens).toBe(50);
      expect(turn.steps[0].usage.output_tokens).toBe(75);
    });
  });

  describe('mode isolation', () => {
    it('nlq and bug-report stores are independent — messages in one do not appear in the other', async () => {
      vi.mocked(chatAgent.streamChat).mockImplementation(() => makeStream([{ type: 'done' }]));

      const nlqStore = useChatStore('nlq');
      await nlqStore.sendMessage('financial question');

      const bugStore = useChatStore('bug-report');

      expect(nlqStore.messages.length).toBe(2); // user + assistant placeholder
      expect(bugStore.messages.length).toBe(0);
    });

    it('nlq and bug-report stores have independent conversationIds', () => {
      const nlqStore = useChatStore('nlq');
      const bugStore = useChatStore('bug-report');

      expect(nlqStore.conversationId).not.toBe(bugStore.conversationId);
    });
  });
});
