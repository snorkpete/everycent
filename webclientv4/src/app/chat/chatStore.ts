import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { ChatMessage } from './chat.types';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);

  async function sendMessage(content: string) {
    messages.value.push({ role: 'user', content });
    loading.value = true;

    try {
      // TODO: replace with real LLM call
      await new Promise((resolve) => setTimeout(resolve, 500));
      messages.value.push({
        role: 'assistant',
        content: `You asked: "${content}" — this is a fake reply.`,
      });
    } finally {
      loading.value = false;
    }
  }

  function clearMessages() {
    messages.value = [];
  }

  return { messages, loading, sendMessage, clearMessages };
});
