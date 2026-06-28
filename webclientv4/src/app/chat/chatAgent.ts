import type {
  ChatMessage,
  ChatMode,
  NormalizedUsage,
  ToolCallDetail,
  UsageEvent,
} from './chat.types';
import { getSystemPrompt } from './systemPrompt';
import { getToolsForMode } from './toolDefinitions';
import { executeTool } from './toolExecutor';

export interface ChatConfig {
  ollamaUrl: string;
  model: string;
  maxToolIterations: number;
  mode: ChatMode;
}

export type AgentEvent =
  | { type: 'thinking'; content: string }
  | { type: 'token'; content: string }
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; name: string; result: string }
  | UsageEvent
  | { type: 'done' }
  | { type: 'error'; message: string };

type OllamaToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

type OllamaMessage =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: OllamaToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string };

type OllamaUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  thinking_tokens?: number;
};

type StreamResult =
  | { kind: 'text'; content: string; usage: NormalizedUsage }
  | { kind: 'tool_calls'; calls: OllamaToolCall[]; usage: NormalizedUsage }
  | { kind: 'error'; message: string };

export function formatToday(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }); // e.g. "Sunday, 28 June 2026"
}

function buildUsage(
  ollamaUsage: OllamaUsage | null,
  startTime: number,
  toolCallsDetail: ToolCallDetail[],
  incomplete: boolean,
): NormalizedUsage {
  return {
    input_tokens: ollamaUsage?.prompt_tokens ?? 0,
    output_tokens: ollamaUsage?.completion_tokens ?? 0,
    cache_read_tokens: 0,
    cache_write_tokens: 0,
    thinking_tokens: ollamaUsage?.thinking_tokens ?? 0,
    total_tokens: ollamaUsage?.total_tokens ?? 0,
    request_duration_ms: Date.now() - startTime,
    tool_call_count: toolCallsDetail.length,
    tool_calls_detail: toolCallsDetail,
    incomplete,
  };
}

async function* streamOllama(
  ollamaMessages: OllamaMessage[],
  config: ChatConfig,
): AsyncGenerator<AgentEvent, StreamResult> {
  const payload = {
    model: config.model,
    messages: ollamaMessages,
    tools: getToolsForMode(config.mode),
    stream: true,
    stream_options: { include_usage: true },
    think: true,
  };

  const startTime = Date.now();

  let response: Response;
  try {
    response = await fetch(`${config.ollamaUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    yield { type: 'error', message: 'Could not connect to Ollama' };
    return { kind: 'error', message: 'Could not connect to Ollama' };
  }

  if (!response.ok) {
    const message = `Ollama returned ${response.status}: ${response.statusText}`;
    yield { type: 'error', message };
    return { kind: 'error', message };
  }

  if (!response.body) {
    yield { type: 'error', message: 'Ollama response has no body' };
    return { kind: 'error', message: 'Ollama response has no body' };
  }

  let capturedOllamaUsage: OllamaUsage | null = null;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let rawContent = '';
  let accumulatedThinking = '';
  let insideThink = false;
  let thinkEnded = false;

  // Accumulated tool call state (built across deltas)
  const pendingToolCalls: Record<number, { id: string; name: string; arguments: string }> = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop()!;

    // Use a flag instead of break so that remaining lines in the same read batch
    // (e.g. the usage chunk arriving alongside the tool_calls finish chunk) are still
    // scanned for usage data before we discard them.
    let stopProcessingDeltas = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      if (data === '[DONE]') {
        stopProcessingDeltas = true;
        continue;
      }

      const parsed = JSON.parse(data) as {
        choices?: Array<{
          delta?: { content?: string | null; reasoning?: string | null; tool_calls?: unknown[] };
          finish_reason?: string | null;
        }>;
        usage?: OllamaUsage;
      };

      // Always capture usage data regardless of whether we've stopped processing deltas.
      // Ollama sends the usage chunk after the finish chunk; they may arrive in the same
      // TCP read batch if the transport coalesces them.
      if (parsed.usage && (!parsed.choices || parsed.choices.length === 0)) {
        capturedOllamaUsage = parsed.usage;
        continue;
      }

      if (stopProcessingDeltas) continue;

      const choice = parsed.choices?.[0];
      if (!choice) continue;

      const finishReason: string | null = choice.finish_reason ?? null;
      const delta = choice.delta;

      // Accumulate tool call deltas
      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls as Array<{
          index: number;
          id?: string;
          function?: { name?: string; arguments?: string };
        }>) {
          const idx = tc.index;
          if (!pendingToolCalls[idx]) {
            pendingToolCalls[idx] = { id: tc.id ?? '', name: '', arguments: '' };
          }
          if (tc.id) {
            pendingToolCalls[idx].id = tc.id;
          }
          if (tc.function?.name) {
            pendingToolCalls[idx].name += tc.function.name;
          }
          if (tc.function?.arguments) {
            pendingToolCalls[idx].arguments += tc.function.arguments;
          }
        }
      }

      // Ollama's OpenAI-compat endpoint emits native thinking under `delta.reasoning`
      // (NOT `delta.thinking`) when think:true is set on a reasoning-capable model.
      const nativeThinking: string | null | undefined = delta?.reasoning;
      if (nativeThinking) {
        accumulatedThinking += nativeThinking;
        yield { type: 'thinking', content: accumulatedThinking };
      }

      // Accumulate text content
      const token: string | null | undefined = delta?.content;
      if (token) {
        rawContent += token;

        // Strip <think>...</think> tags embedded in the content field.
        // Some Ollama versions/models embed thinking inside content even with think: true.
        if (!thinkEnded && rawContent.includes('<think>')) {
          insideThink = true;
        }

        if (insideThink) {
          if (rawContent.includes('</think>')) {
            insideThink = false;
            thinkEnded = true;

            // Extract the thinking portion from inside the tags and merge into accumulatedThinking
            const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/);
            if (thinkMatch) {
              const inlineThinking = thinkMatch[1].trim();
              if (inlineThinking && !accumulatedThinking) {
                accumulatedThinking = inlineThinking;
                yield { type: 'thinking', content: accumulatedThinking };
              }
            }

            const afterThink = rawContent.split('</think>').pop()!.trim();
            if (afterThink) {
              yield { type: 'token', content: afterThink };
            }
          }
        } else {
          yield { type: 'token', content: rawContent };
        }
      }

      if (finishReason === 'tool_calls') {
        stopProcessingDeltas = true;
      }
    }
  }

  // If we accumulated tool calls, return them
  const toolCallEntries = Object.values(pendingToolCalls);
  const incomplete = capturedOllamaUsage === null;
  if (toolCallEntries.length > 0) {
    return {
      kind: 'tool_calls',
      calls: toolCallEntries.map((tc) => ({
        id: tc.id,
        type: 'function' as const,
        function: { name: tc.name, arguments: tc.arguments },
      })),
      usage: buildUsage(capturedOllamaUsage, startTime, [], incomplete),
    };
  }

  return {
    kind: 'text',
    content: rawContent,
    usage: buildUsage(capturedOllamaUsage, startTime, [], incomplete),
  };
}

export async function* streamChat(
  messages: ChatMessage[],
  config: ChatConfig,
): AsyncGenerator<AgentEvent> {
  const ollamaMessages: OllamaMessage[] = [
    { role: 'system', content: getSystemPrompt(config.mode, formatToday()) },
    ...messages
      .filter((m) => m.content !== '')
      .map(({ role, content }) => ({ role, content }) as OllamaMessage),
  ];

  yield { type: 'thinking', content: '' };

  for (let iteration = 0; iteration < config.maxToolIterations; iteration++) {
    const result: StreamResult = yield* streamOllama(ollamaMessages, config);

    if (result.kind === 'error') {
      return;
    }

    if (result.kind === 'text') {
      yield { type: 'usage', usage: result.usage };
      yield { type: 'done' };
      return;
    }

    // result.kind === 'tool_calls'
    const assistantMessage: OllamaMessage = {
      role: 'assistant',
      content: null,
      tool_calls: result.calls,
    };
    ollamaMessages.push(assistantMessage);

    const toolCallsDetail: ToolCallDetail[] = [];

    for (const call of result.calls) {
      let args: Record<string, unknown>;
      try {
        args = JSON.parse(call.function.arguments) as Record<string, unknown>;
      } catch {
        args = {};
      }

      yield { type: 'tool_call', name: call.function.name, args };

      const toolStart = Date.now();
      let toolResult: string;
      try {
        toolResult = await executeTool(call.function.name, args);
      } catch (e: unknown) {
        toolResult = e instanceof Error ? e.message : 'Tool execution failed';
      }
      toolCallsDetail.push({ name: call.function.name, duration_ms: Date.now() - toolStart });

      yield { type: 'tool_result', name: call.function.name, result: toolResult };

      ollamaMessages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: toolResult,
      });
    }

    // Emit usage for this LLM call (with the tool calls that followed it)
    yield {
      type: 'usage',
      usage: {
        ...result.usage,
        tool_call_count: toolCallsDetail.length,
        tool_calls_detail: toolCallsDetail,
      },
    };
  }

  yield { type: 'error', message: 'Tool call loop exceeded maximum iterations' };
}
