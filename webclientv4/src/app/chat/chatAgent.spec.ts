import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { streamChat } from './chatAgent';
import * as toolExecutor from './toolExecutor';

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

function mockFetchOk(lines: string[]) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(makeStream([...lines, 'data: [DONE]']), { status: 200 }),
  );
}

function mockFetchError(status: number, statusText: string) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status, statusText }));
}

async function collectEvents(messages: Parameters<typeof streamChat>[0]) {
  const events = [];
  for await (const event of streamChat(messages)) {
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
    it('yields thinking before streaming begins', async () => {
      mockFetchOk([tokenChunk('Hello')]);

      const events = await collectEvents([{ role: 'user', content: 'hello' }]);

      expect(events[0]).toEqual({ type: 'thinking' });
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
