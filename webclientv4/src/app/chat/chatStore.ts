import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { ChatMessage } from './chat.types';
import { streamChat } from './chatAgent';
import type { ChatConfig } from './chatAgent';
import { useChatSettingsStore } from '../chat-settings/chatSettingsStore';
import { llmUsageApi } from '../llm-usage/llmUsageApi';
import type { LlmUsageBatch } from '../llm-usage/llmUsage.types';

type UsageRecord = LlmUsageBatch['records'][number];

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const thinking = ref(false);
  const error = ref<string | null>(null);
  const toolStatus = ref<string | null>(null);
  const conversationId = ref<string>(crypto.randomUUID());
  const currentTurnId = ref<string>('');

  let pendingUsageRecords: UsageRecord[] = [];

  function getChatConfig(): ChatConfig {
    const chatSettings = useChatSettingsStore();
    const model = chatSettings.settings.llm_model;
    return {
      ollamaUrl: model?.url ?? '',
      model: model?.name ?? '',
      maxToolIterations: chatSettings.settings.max_tool_iterations,
    };
  }

  function submitUsageBatch(turnLlmModelId: number | null) {
    if (pendingUsageRecords.length === 0) {
      return;
    }

    if (turnLlmModelId === null) {
      console.warn('Usage records captured but llm_model_id is null — skipping batch submit');
      return;
    }

    const batch: LlmUsageBatch = {
      llm_model_id: turnLlmModelId,
      records: pendingUsageRecords,
    };

    llmUsageApi.submitBatch(batch).catch((e: unknown) => {
      console.error('Failed to submit usage records', e);
    });
  }

  async function sendMessage(content: string) {
    const config = getChatConfig();
    if (!config.ollamaUrl || !config.model) {
      error.value = 'Chat is not configured. Select a model in Chat Settings.';
      return;
    }

    // Snapshot llm_model_id at turn start so a mid-stream settings change
    // can't produce a record/batch mismatch or silently drop a valid turn.
    const turnLlmModelId = useChatSettingsStore().settings.llm_model_id;

    currentTurnId.value = crypto.randomUUID();
    pendingUsageRecords = [];

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
          case 'usage': {
            const record: UsageRecord = {
              llm_model_id: turnLlmModelId ?? 0,
              usage_category: 'chat',
              conversation_id: conversationId.value,
              conversation_turn_id: currentTurnId.value,
              input_tokens: event.usage.input_tokens,
              output_tokens: event.usage.output_tokens,
              cache_read_tokens: event.usage.cache_read_tokens,
              cache_write_tokens: event.usage.cache_write_tokens,
              thinking_tokens: event.usage.thinking_tokens,
              total_tokens: event.usage.total_tokens,
              request_duration_ms: event.usage.request_duration_ms,
              incomplete: event.usage.incomplete,
              tool_call_count: event.usage.tool_call_count,
              tool_calls_detail: event.usage.tool_calls_detail,
              extras: {},
            };
            pendingUsageRecords.push(record);
            break;
          }
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
      submitUsageBatch(turnLlmModelId);
    }
  }

  function clearMessages() {
    messages.value = [];
    error.value = null;
    toolStatus.value = null;
    conversationId.value = crypto.randomUUID();
  }

  return {
    messages,
    loading,
    thinking,
    error,
    toolStatus,
    conversationId,
    conversationTurnId: currentTurnId,
    sendMessage,
    clearMessages,
  };
});
