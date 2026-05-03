import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { ChatMessage } from './chat.types';
import { streamChat } from './chatAgent';
import type { ChatConfig } from './chatAgent';
import { useChatSettingsStore } from '../chat-settings/chatSettingsStore';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const thinking = ref(false);
  const error = ref<string | null>(null);
  const toolStatus = ref<string | null>(null);

  function getChatConfig(): ChatConfig {
    const chatSettings = useChatSettingsStore();
    return {
      ollamaUrl: chatSettings.settings.ollama_url ?? '',
      model: chatSettings.settings.ollama_model ?? '',
      maxToolIterations: chatSettings.settings.max_tool_iterations,
    };
  }

  async function sendMessage(content: string) {
    const config = getChatConfig();
    if (!config.ollamaUrl || !config.model) {
      error.value = 'Chat is not configured. Set Ollama URL and model in Chat Settings.';
      return;
    }

    messages.value.push({ role: 'user', content });
    messages.value.push({ role: 'assistant', content: '' });
    const target = messages.value[messages.value.length - 1];

    loading.value = true;
    error.value = null;

    try {
      for await (const event of streamChat(messages.value, config)) {
        switch (event.type) {
          case 'thinking':
            thinking.value = true;
            break;
          case 'token':
            thinking.value = false;
            target.content = event.content;
            break;
          case 'tool_call':
            toolStatus.value = `Calling ${event.name}...`;
            break;
          case 'tool_result':
            toolStatus.value = null;
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
      toolStatus.value = null;
    }
  }

  function clearMessages() {
    messages.value = [];
    error.value = null;
    toolStatus.value = null;
  }

  return { messages, loading, thinking, error, toolStatus, sendMessage, clearMessages };
});
