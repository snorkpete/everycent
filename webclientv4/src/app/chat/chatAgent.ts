import type { ChatMessage } from './chat.types';
import { SYSTEM_PROMPT } from './systemPrompt';

const OLLAMA_BASE_URL = 'http://192.168.68.59:11434';
const MODEL = 'qwen3:14b';

export type AgentEvent =
  | { type: 'thinking' }
  | { type: 'token'; content: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export async function* streamChat(messages: ChatMessage[]): AsyncGenerator<AgentEvent> {
  const payload = {
    model: MODEL,
    messages: [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.filter((m) => m.content !== '').map(({ role, content }) => ({ role, content })),
    ],
    stream: true,
  };

  let response: Response;
  try {
    response = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    yield { type: 'error', message: 'Could not connect to Ollama' };
    return;
  }

  if (!response.ok) {
    yield { type: 'error', message: `Ollama returned ${response.status}: ${response.statusText}` };
    return;
  }

  yield { type: 'thinking' };

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let rawContent = '';
  let insideThink = false;
  let thinkEnded = false;

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
      const token = parsed.choices?.[0]?.delta?.content;
      if (!token) continue;

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
  }

  yield { type: 'done' };
}
