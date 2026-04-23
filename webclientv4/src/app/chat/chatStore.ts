import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { ChatMessage } from './chat.types';
import { streamChat } from './chatAgent';

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
    error.value = null;

    try {
      for await (const event of streamChat(messages.value)) {
        switch (event.type) {
          case 'thinking':
            thinking.value = true;
            break;
          case 'token':
            thinking.value = false;
            target.content = event.content;
            break;
          case 'error':
            error.value = event.message;
            if (target.content === '') {
              messages.value.pop();
            }
            break;
          case 'done':
            break;
        }
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Unexpected error';
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
