import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { ChatMessage } from './chat.types';
import { SYSTEM_PROMPT } from './systemPrompt';

const OLLAMA_BASE_URL = 'http://192.168.68.59:11434';
const MODEL = 'qwen3:14b';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const thinking = ref(false);
  const error = ref<string | null>(null);

  async function sendMessage(content: string) {
    messages.value.push({ role: 'user', content });
    messages.value.push({ role: 'assistant', content: '' });
    const target = messages.value[messages.value.length - 1];

    loading.value = true;
    thinking.value = true;
    error.value = null;

    let insideThink = false;

    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system' as const, content: SYSTEM_PROMPT },
            ...messages.value
              .filter((m) => m.content !== '')
              .map(({ role, content }) => ({ role, content })),
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama returned ${response.status}: ${response.statusText}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let rawContent = '';

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

          if (rawContent.includes('<think>')) {
            insideThink = true;
          }

          if (insideThink) {
            if (rawContent.includes('</think>')) {
              insideThink = false;
              thinking.value = false;
              const afterThink = rawContent.split('</think>').pop()!.trim();
              target.content = afterThink;
            }
          } else {
            thinking.value = false;
            target.content = rawContent;
          }
        }
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to reach Ollama';
      if (target.content === '') {
        messages.value.pop();
      }
    } finally {
      loading.value = false;
      thinking.value = false;
    }
  }

  function clearMessages() {
    messages.value = [];
    error.value = null;
  }

  return { messages, loading, thinking, error, sendMessage, clearMessages };
});
