import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { streamChat } from './chatAgent';
import type { ChatConfig } from './chatAgent';
import * as toolExecutor from './toolExecutor';

const TEST_CONFIG: ChatConfig = {
  ollamaUrl: 'http://localhost:11434',
  model: 'test-model',
  maxToolIterations: 5,
};

vi.mock('./toolExecutor', () => ({
  executeTool: vi.fn(),
}));

// Build a ReadableStream that emits SSE lines from an array of data payloads.
function makeStream(lines: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line + '\n'));
      }
      controller.close();
    },
  });
}

function sseData(payload: object): string {
  return `data: ${JSON.stringify(payload)}`;
}

function tokenChunk(content: string, finishReason: string | null = null) {
  return sseData({
    choices: [{ delta: { content }, finish_reason: finishReason }],
  });
}

function toolCallChunk(
  index: number,
  id: string,
  name: string,
  args: string,
  finishReason: string | null = null,
) {
  return sseData({
    choices: [
      {
        delta: {
          tool_calls: [{ index, id, function: { name, arguments: args } }],
        },
        finish_reason: finishReason,
      },
    ],
  });
}

function usageChunk(
  promptTokens: number,
  completionTokens: number,
  totalTokens: number,
  thinkingTokens = 0,
) {
  return sseData({
    choices: [],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
      thinking_tokens: thinkingTokens,
    },
  });
}

function thinkingChunk(thinking: string) {
  return sseData({
    choices: [{ delta: { thinking }, finish_reason: null }],
  });
}

// makeStream sends each line as a separate enqueue (one chunk per line).
// makeCoalescedStream sends ALL lines as a single enqueue, simulating TCP coalescing.
function makeCoalescedStream(lines: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      const combined = lines.map((line) => line + '\n').join('');
      controller.enqueue(encoder.encode(combined));
      controller.close();
    },
  });
}

function mockFetchOk(lines: string[]) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(makeStream([...lines, 'data: [DONE]']), { status: 200 }),
  );
}

function mockFetchError(status: number, statusText: string) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status, statusText }));
}

async function collectEvents(
  messages: Parameters<typeof streamChat>[0],
  config: ChatConfig = TEST_CONFIG,
) {
  const events = [];
  for await (const event of streamChat(messages, config)) {
    events.push(event);
  }
  return events;
}

describe('streamChat', () => {
  beforeEach(() => {
    vi.mocked(toolExecutor.executeTool).mockResolvedValue('{}');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('connection errors', () => {
    it('yields error event when fetch throws', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network down'));

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      expect(events).toContainEqual({ type: 'error', message: 'Could not connect to Ollama' });
    });

    it('yields error event when Ollama returns a non-ok status', async () => {
      mockFetchError(503, 'Service Unavailable');

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      expect(events).toContainEqual(
        expect.objectContaining({ type: 'error', message: expect.stringContaining('503') }),
      );
    });
  });

  describe('text response', () => {
    it('yields thinking event with empty content before streaming begins', async () => {
      mockFetchOk([tokenChunk('Hello')]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      expect(events[0]).toEqual({ type: 'thinking', content: '' });
    });

    it('yields token events for plain text content', async () => {
      mockFetchOk([tokenChunk('Hello'), tokenChunk('Hello world')]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      const tokenEvents = events.filter((e) => e.type === 'token');
      expect(tokenEvents.length).toBeGreaterThan(0);
    });

    it('yields done at the end of a text response', async () => {
      mockFetchOk([tokenChunk('Hello')]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      expect(events[events.length - 1]).toEqual({ type: 'done' });
    });

    it('does not yield tokens while inside a <think> block', async () => {
      // Simulates Qwen3 emitting <think>...</think> before the real answer.
      // Three deltas: open tag, reasoning text+close tag, real answer token.
      mockFetchOk([
        tokenChunk('<think>'),
        tokenChunk('<think>reasoning</think>'),
        tokenChunk('<think>reasoning</think>Answer'),
      ]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      // No token events should arrive while insideThink is true.
      // The first two deltas (inside the think block) must produce no token events.
      const tokenEvents = events.filter((e) => e.type === 'token') as Array<{
        type: 'token';
        content: string;
      }>;
      // Only the delta that closes the think block (or comes after it) may produce tokens.
      // Tokens are only yielded once thinkEnded is true.
      expect(tokenEvents.length).toBeGreaterThan(0);
      // First token event should not occur during the think-only deltas.
      // The rawContent at that point includes prior text — but no token was emitted for
      // the pure-thinking deltas (chunks 1 and 2).
      // We verify this indirectly: at least one token must be emitted (the answer delta).
      const firstTokenContent = tokenEvents[0].content;
      expect(firstTokenContent).toContain('Answer');
    });

    it('filters out messages with empty content before sending', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          new Response(makeStream([tokenChunk('Hi'), 'data: [DONE]']), { status: 200 }),
        );

      await collectEvents([
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: '' },
      ]);

      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      const nonSystemMessages = body.messages.filter((m: { role: string }) => m.role !== 'system');
      expect(nonSystemMessages.every((m: { content: string }) => m.content !== '')).toBe(true);
    });

    it('includes TOOL_DEFINITIONS in the request payload', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          new Response(makeStream([tokenChunk('Hi'), 'data: [DONE]']), { status: 200 }),
        );

      await collectEvents([{ role: 'user', content: 'hello' }]);

      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.tools).toBeDefined();
      expect(body.tools.length).toBeGreaterThan(0);
    });
  });

  describe('tool call response', () => {
    it('yields tool_call event with parsed args', async () => {
      mockFetchOk([
        toolCallChunk(0, 'call-1', 'analyze_overspending', '{"period":"2026-03"}', 'tool_calls'),
        'data: [DONE]',
      ]);
      // Second fetch returns final text
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(
            makeStream([
              toolCallChunk(
                0,
                'call-1',
                'analyze_overspending',
                '{"period":"2026-03"}',
                'tool_calls',
              ),
              'data: [DONE]',
            ]),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(makeStream([tokenChunk('Here is the analysis'), 'data: [DONE]']), {
            status: 200,
          }),
        );

      const events = await collectEvents([{ role: 'user', content: 'any overspending?' }]);

      const toolCallEvent = events.find((e) => e.type === 'tool_call');
      expect(toolCallEvent).toEqual({
        type: 'tool_call',
        name: 'analyze_overspending',
        args: { period: '2026-03' },
      });
    });

    it('calls executeTool with the tool name and parsed args', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(
            makeStream([
              toolCallChunk(
                0,
                'call-1',
                'analyze_overspending',
                '{"period":"2026-03"}',
                'tool_calls',
              ),
              'data: [DONE]',
            ]),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(makeStream([tokenChunk('Done'), 'data: [DONE]']), { status: 200 }),
        );

      await collectEvents([{ role: 'user', content: 'overspending?' }]);

      expect(toolExecutor.executeTool).toHaveBeenCalledWith('analyze_overspending', {
        period: '2026-03',
      });
    });

    it('yields tool_result event after executing the tool', async () => {
      vi.mocked(toolExecutor.executeTool).mockResolvedValue('{"categories":[]}');
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(
            makeStream([
              toolCallChunk(
                0,
                'call-1',
                'analyze_overspending',
                '{"period":"2026-03"}',
                'tool_calls',
              ),
              'data: [DONE]',
            ]),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(makeStream([tokenChunk('Done'), 'data: [DONE]']), { status: 200 }),
        );

      const events = await collectEvents([{ role: 'user', content: 'overspending?' }]);

      expect(events).toContainEqual({
        type: 'tool_result',
        name: 'analyze_overspending',
        result: '{"categories":[]}',
      });
    });

    it('yields done after the follow-up text response', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(
            makeStream([
              toolCallChunk(
                0,
                'call-1',
                'analyze_overspending',
                '{"period":"2026-03"}',
                'tool_calls',
              ),
              'data: [DONE]',
            ]),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(makeStream([tokenChunk('Here is the analysis'), 'data: [DONE]']), {
            status: 200,
          }),
        );

      const events = await collectEvents([{ role: 'user', content: 'overspending?' }]);

      expect(events[events.length - 1]).toEqual({ type: 'done' });
    });

    it('handles tool execution errors gracefully and continues', async () => {
      vi.mocked(toolExecutor.executeTool).mockRejectedValue(new Error('API error'));
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(
            makeStream([
              toolCallChunk(
                0,
                'call-1',
                'analyze_overspending',
                '{"period":"2026-03"}',
                'tool_calls',
              ),
              'data: [DONE]',
            ]),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(makeStream([tokenChunk('Sorry'), 'data: [DONE]']), { status: 200 }),
        );

      const events = await collectEvents([{ role: 'user', content: 'overspending?' }]);

      const toolResult = events.find((e) => e.type === 'tool_result') as
        | {
            type: 'tool_result';
            result: string;
          }
        | undefined;
      expect(toolResult?.result).toBe('API error');
    });

    it('sends tool result back to Ollama in the follow-up request', async () => {
      vi.mocked(toolExecutor.executeTool).mockResolvedValue('{"categories":[]}');
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(
            makeStream([
              toolCallChunk(
                0,
                'call-1',
                'analyze_overspending',
                '{"period":"2026-03"}',
                'tool_calls',
              ),
              'data: [DONE]',
            ]),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(makeStream([tokenChunk('Done'), 'data: [DONE]']), { status: 200 }),
        );

      await collectEvents([{ role: 'user', content: 'overspending?' }]);

      const secondCallBody = JSON.parse((fetchSpy.mock.calls[1][1] as RequestInit).body as string);
      const toolMsg = secondCallBody.messages.find((m: { role: string }) => m.role === 'tool');
      expect(toolMsg).toBeDefined();
      expect(toolMsg.content).toBe('{"categories":[]}');
    });
  });

  describe('usage events', () => {
    it('includes stream_options.include_usage in the Ollama request payload', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          new Response(makeStream([tokenChunk('Hi'), 'data: [DONE]']), { status: 200 }),
        );

      await collectEvents([{ role: 'user', content: 'hello' }]);

      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.stream_options).toEqual({ include_usage: true });
    });

    it('emits a usage event with token counts from the final chunk on a text response', async () => {
      mockFetchOk([tokenChunk('Hello'), usageChunk(10, 5, 15)]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      const usageEvent = events.find((e) => e.type === 'usage') as
        | {
            type: 'usage';
            usage: { input_tokens: number; output_tokens: number; total_tokens: number };
          }
        | undefined;
      expect(usageEvent).toBeDefined();
      expect(usageEvent?.usage.input_tokens).toBe(10);
      expect(usageEvent?.usage.output_tokens).toBe(5);
      expect(usageEvent?.usage.total_tokens).toBe(15);
    });

    it('emits usage event before done on a text response', async () => {
      mockFetchOk([tokenChunk('Hello'), usageChunk(10, 5, 15)]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      const usageIndex = events.findIndex((e) => e.type === 'usage');
      const doneIndex = events.findIndex((e) => e.type === 'done');
      expect(usageIndex).toBeGreaterThanOrEqual(0);
      expect(doneIndex).toBeGreaterThan(usageIndex);
    });

    it('captures request_duration_ms in the usage event', async () => {
      mockFetchOk([tokenChunk('Hello'), usageChunk(10, 5, 15)]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      const usageEvent = events.find((e) => e.type === 'usage') as
        | { type: 'usage'; usage: { request_duration_ms: number } }
        | undefined;
      expect(usageEvent?.usage.request_duration_ms).toBeGreaterThanOrEqual(0);
    });

    it('emits incomplete: false when usage chunk is present', async () => {
      mockFetchOk([tokenChunk('Hello'), usageChunk(10, 5, 15)]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      const usageEvent = events.find((e) => e.type === 'usage') as
        | { type: 'usage'; usage: { incomplete: boolean } }
        | undefined;
      expect(usageEvent?.usage.incomplete).toBe(false);
    });

    it('emits incomplete: true when no usage chunk arrives', async () => {
      // Stream ends without a usage chunk
      mockFetchOk([tokenChunk('Hello')]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      const usageEvent = events.find((e) => e.type === 'usage') as
        | { type: 'usage'; usage: { incomplete: boolean; input_tokens: number } }
        | undefined;
      expect(usageEvent?.usage.incomplete).toBe(true);
      expect(usageEvent?.usage.input_tokens).toBe(0);
    });

    it('emits a usage event after a tool-call iteration with tool_call_count and tool_calls_detail', async () => {
      vi.mocked(toolExecutor.executeTool).mockResolvedValue('{}');
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(
            makeStream([
              toolCallChunk(
                0,
                'call-1',
                'analyze_overspending',
                '{"period":"2026-03"}',
                'tool_calls',
              ),
              usageChunk(20, 3, 23),
              'data: [DONE]',
            ]),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(makeStream([tokenChunk('Done'), usageChunk(30, 10, 40), 'data: [DONE]']), {
            status: 200,
          }),
        );

      const events = await collectEvents([{ role: 'user', content: 'overspending?' }]);

      const usageEvents = events.filter((e) => e.type === 'usage') as Array<{
        type: 'usage';
        usage: {
          tool_call_count: number;
          tool_calls_detail: Array<{ name: string; duration_ms: number }>;
          input_tokens: number;
        };
      }>;

      // First usage event: the tool-call LLM call
      expect(usageEvents[0].usage.tool_call_count).toBe(1);
      expect(usageEvents[0].usage.tool_calls_detail[0].name).toBe('analyze_overspending');
      expect(usageEvents[0].usage.tool_calls_detail[0].duration_ms).toBeGreaterThanOrEqual(0);
      expect(usageEvents[0].usage.input_tokens).toBe(20);

      // Second usage event: the follow-up text LLM call
      expect(usageEvents[1].usage.tool_call_count).toBe(0);
      expect(usageEvents[1].usage.input_tokens).toBe(30);
    });

    it('captures usage when tool-calls chunk and usage chunk are coalesced in one TCP read batch', async () => {
      vi.mocked(toolExecutor.executeTool).mockResolvedValue('{}');
      // Both the tool-calls finish chunk and the usage chunk arrive in a single enqueue
      // (simulating TCP coalescing). Without the stopProcessingDeltas flag fix, the usage
      // chunk would be skipped and incomplete: true emitted.
      const coalescedLines = [
        toolCallChunk(0, 'call-1', 'analyze_overspending', '{"period":"2026-03"}', 'tool_calls'),
        usageChunk(20, 3, 23),
        'data: [DONE]',
      ];
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(makeCoalescedStream(coalescedLines), { status: 200 }))
        .mockResolvedValueOnce(
          new Response(makeStream([tokenChunk('Done'), 'data: [DONE]']), { status: 200 }),
        );

      const events = await collectEvents([{ role: 'user', content: 'overspending?' }]);

      const firstUsageEvent = events.find((e) => e.type === 'usage') as
        | { type: 'usage'; usage: { incomplete: boolean; input_tokens: number } }
        | undefined;
      expect(firstUsageEvent?.usage.incomplete).toBe(false);
      expect(firstUsageEvent?.usage.input_tokens).toBe(20);
    });
  });

  describe('think: true in request payload', () => {
    it('includes think: true in the Ollama request payload', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          new Response(makeStream([tokenChunk('Hi'), 'data: [DONE]']), { status: 200 }),
        );

      await collectEvents([{ role: 'user', content: 'hello' }]);

      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.think).toBe(true);
    });
  });

  describe('thinking token streaming', () => {
    it('yields thinking events with accumulating content from the native thinking field', async () => {
      // Each thinkingChunk carries an incremental delta — the agent accumulates them.
      mockFetchOk([
        thinkingChunk('Step one.'),
        thinkingChunk(' Step two.'),
        tokenChunk('The answer is 42'),
      ]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      const thinkingEvents = events.filter((e) => e.type === 'thinking') as Array<{
        type: 'thinking';
        content: string;
      }>;
      // First is the initial empty thinking event from streamChat
      expect(thinkingEvents[0].content).toBe('');
      // Subsequent events carry accumulating content from the delta.thinking field
      expect(thinkingEvents.some((e) => e.content === 'Step one.')).toBe(true);
      expect(thinkingEvents.some((e) => e.content === 'Step one. Step two.')).toBe(true);
    });

    it('yields no extra thinking events for non-reasoning models (no thinking field in deltas)', async () => {
      mockFetchOk([tokenChunk('Plain answer')]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      const thinkingEvents = events.filter((e) => e.type === 'thinking') as Array<{
        type: 'thinking';
        content: string;
      }>;
      // Only the initial empty event — no content-bearing thinking events
      expect(thinkingEvents).toHaveLength(1);
      expect(thinkingEvents[0].content).toBe('');
    });

    it('yields token events after thinking concludes', async () => {
      mockFetchOk([thinkingChunk('Reasoning...'), tokenChunk('Final answer')]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      const tokenEvents = events.filter((e) => e.type === 'token') as Array<{
        type: 'token';
        content: string;
      }>;
      expect(tokenEvents.some((e) => e.content.includes('Final answer'))).toBe(true);
    });
  });

  describe('thinking_tokens in usage', () => {
    it('populates thinking_tokens in usage event from Ollama usage chunk', async () => {
      mockFetchOk([tokenChunk('Hello'), usageChunk(10, 5, 15, 42)]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      const usageEvent = events.find((e) => e.type === 'usage') as
        | { type: 'usage'; usage: { thinking_tokens: number } }
        | undefined;
      expect(usageEvent?.usage.thinking_tokens).toBe(42);
    });

    it('defaults thinking_tokens to 0 when not provided by Ollama', async () => {
      mockFetchOk([tokenChunk('Hello'), usageChunk(10, 5, 15)]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      const usageEvent = events.find((e) => e.type === 'usage') as
        | { type: 'usage'; usage: { thinking_tokens: number } }
        | undefined;
      expect(usageEvent?.usage.thinking_tokens).toBe(0);
    });
  });

  describe('tool call loop guard', () => {
    it('yields an error after exceeding max iterations', async () => {
      const toolCallResponse = new Response(
        makeStream([
          toolCallChunk(0, 'call-1', 'analyze_overspending', '{"period":"2026-03"}', 'tool_calls'),
          'data: [DONE]',
        ]),
        { status: 200 },
      );

      // Always return tool_calls — never a final text response
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(toolCallResponse);

      // Re-mock so each call creates a fresh stream
      vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
        return Promise.resolve(
          new Response(
            makeStream([
              toolCallChunk(
                0,
                'call-x',
                'analyze_overspending',
                '{"period":"2026-03"}',
                'tool_calls',
              ),
              'data: [DONE]',
            ]),
            { status: 200 },
          ),
        );
      });

      const events = await collectEvents([{ role: 'user', content: 'overspending?' }]);

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'error',
          message: expect.stringContaining('maximum iterations'),
        }),
      );
    });
  });
});
