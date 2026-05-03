import type { ChatMessage } from './chat.types';
import { SYSTEM_PROMPT } from './systemPrompt';
import { TOOL_DEFINITIONS } from './toolDefinitions';
import { executeTool } from './toolExecutor';

export interface ChatConfig {
  ollamaUrl: string;
  model: string;
  maxToolIterations: number;
}

export type AgentEvent =
  | { type: 'thinking' }
  | { type: 'token'; content: string }
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; name: string; result: string }
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

type StreamResult =
  | { kind: 'text'; content: string }
  | { kind: 'tool_calls'; calls: OllamaToolCall[] }
  | { kind: 'error'; message: string };

async function* streamOllama(
  ollamaMessages: OllamaMessage[],
  config: ChatConfig,
): AsyncGenerator<AgentEvent, StreamResult> {
  const payload = {
    model: config.model,
    messages: ollamaMessages,
    tools: TOOL_DEFINITIONS,
    stream: true,
  };

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

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let rawContent = '';
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

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      if (data === '[DONE]') break;

      const parsed = JSON.parse(data);
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

      // Accumulate text content
      const token: string | null | undefined = delta?.content;
      if (token) {
        rawContent += token;

        if (!thinkEnded && rawContent.includes('<think>')) {
          insideThink = true;
        }

        if (insideThink) {
          if (rawContent.includes('</think>')) {
            insideThink = false;
            thinkEnded = true;
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
        break;
      }
    }
  }

  // If we accumulated tool calls, return them
  const toolCallEntries = Object.values(pendingToolCalls);
  if (toolCallEntries.length > 0) {
    return {
      kind: 'tool_calls',
      calls: toolCallEntries.map((tc) => ({
        id: tc.id,
        type: 'function' as const,
        function: { name: tc.name, arguments: tc.arguments },
      })),
    };
  }

  return { kind: 'text', content: rawContent };
}

export async function* streamChat(
  messages: ChatMessage[],
  config: ChatConfig,
): AsyncGenerator<AgentEvent> {
  const ollamaMessages: OllamaMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages
      .filter((m) => m.content !== '')
      .map(({ role, content }) => ({ role, content }) as OllamaMessage),
  ];

  yield { type: 'thinking' };

  for (let iteration = 0; iteration < config.maxToolIterations; iteration++) {
    const result: StreamResult = yield* streamOllama(ollamaMessages, config);

    if (result.kind === 'error') {
      return;
    }

    if (result.kind === 'text') {
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

    for (const call of result.calls) {
      let args: Record<string, unknown>;
      try {
        args = JSON.parse(call.function.arguments) as Record<string, unknown>;
      } catch {
        args = {};
      }

      yield { type: 'tool_call', name: call.function.name, args };

      let toolResult: string;
      try {
        toolResult = await executeTool(call.function.name, args);
      } catch (e: unknown) {
        toolResult = e instanceof Error ? e.message : 'Tool execution failed';
      }

      yield { type: 'tool_result', name: call.function.name, result: toolResult };

      ollamaMessages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: toolResult,
      });
    }
  }

  yield { type: 'error', message: 'Tool call loop exceeded maximum iterations' };
}
