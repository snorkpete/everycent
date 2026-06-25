import { ref } from 'vue';
import { defineStore } from 'pinia';
import type {
  ChatMessage,
  ChatMode,
  ConversationTurnDto,
  ConversationTurnStep,
  StepToolCall,
} from './chat.types';
import { streamChat } from './chatAgent';
import type { ChatConfig } from './chatAgent';
import { useChatSettingsStore } from '../chat-settings/chatSettingsStore';
import { conversationTurnApi } from './conversationTurnApi';

/** Mutable state accumulated within a single step (one LLM call). */
interface PendingStep {
  thinking: string;
  toolCalls: StepToolCall[];
}

// Each mode gets its own independent store instance. Messages, conversationId,
// loading, error, etc. are all scoped to the mode, so switching modes preserves
// each conversation's history. The setup is built per mode and the stores are
// defined once at module level (below) — not re-created per call — so Pinia's
// id-based memoization can't silently discard a fresh factory closure.
function createChatStoreSetup(mode: ChatMode) {
  return () => {
    const messages = ref<ChatMessage[]>([]);
    const loading = ref(false);
    const thinking = ref(false);
    const error = ref<string | null>(null);
    const toolStatus = ref<string | null>(null);
    const conversationId = ref<string>(crypto.randomUUID());
    const currentTurnId = ref<string>('');

    // Per-turn accumulation
    let pendingSteps: ConversationTurnStep[] = [];
    let currentStep: PendingStep = { thinking: '', toolCalls: [] };
    let pendingUserPrompt: string = '';
    let pendingFinalOutput: string | null = null;

    function getChatConfig(): ChatConfig {
      const chatSettings = useChatSettingsStore();
      const model = chatSettings.settings.llm_model;
      return {
        ollamaUrl: model?.url ?? '',
        model: model?.name ?? '',
        maxToolIterations: chatSettings.settings.max_tool_iterations,
        mode,
      };
    }

    function submitTurn(turnLlmModelId: number | null) {
      if (pendingSteps.length === 0) {
        return;
      }

      if (turnLlmModelId === null) {
        console.warn('Conversation turn captured but llm_model_id is null — skipping turn submit');
        return;
      }

      const turn: ConversationTurnDto = {
        llm_model_id: turnLlmModelId,
        conversation_id: conversationId.value,
        conversation_turn_id: currentTurnId.value,
        user_prompt: pendingUserPrompt,
        final_output: pendingFinalOutput,
        steps: pendingSteps,
      };

      conversationTurnApi.submitTurn(turn).catch((e: unknown) => {
        console.error('Failed to submit conversation turn', e);
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

      // Reset per-turn accumulation
      pendingSteps = [];
      currentStep = { thinking: '', toolCalls: [] };
      pendingUserPrompt = content;
      pendingFinalOutput = null;

      messages.value.push({ role: 'user', content });
      messages.value.push({ role: 'assistant', content: '', turnId: currentTurnId.value });
      const target = messages.value[messages.value.length - 1];

      loading.value = true;
      error.value = null;

      try {
        for await (const event of streamChat(messages.value, config)) {
          switch (event.type) {
            case 'thinking':
              // thinking.value is the "waiting for first output" spinner.
              // The initial empty thinking event activates the spinner.
              // Once content-bearing thinking events arrive, the per-message disclosure
              // takes over and the spinner is no longer needed.
              if (!event.content) {
                thinking.value = true;
              } else {
                thinking.value = false;
                target.thinking = event.content;
                // Accumulate into the current step (each step gets its own thinking)
                currentStep.thinking = event.content;
              }
              break;
            case 'token':
              thinking.value = false;
              target.content = event.content;
              // Token events carry the full accumulated content (snapshot, not delta).
              // The last snapshot is the final answer text.
              pendingFinalOutput = event.content;
              break;
            case 'tool_call':
              toolStatus.value = `Calling ${event.name}...`;
              // Capture args — will be matched with result on tool_result
              currentStep.toolCalls.push({
                name: event.name,
                params: event.args,
                result: '',
              });
              break;
            case 'tool_result': {
              toolStatus.value = null;
              // Match on name, using findLast so the same tool can appear twice in one step.
              // The agent processes tool calls sequentially today, so the last unresolved
              // call with this name is always the right target.
              const pending = [...currentStep.toolCalls]
                .reverse()
                .find((tc) => tc.name === event.name && tc.result === '');
              if (pending) {
                pending.result = event.result;
              }
              break;
            }
            case 'usage': {
              // A usage event closes a step — seal the current step and start fresh
              const completedStep: ConversationTurnStep = {
                thinking: currentStep.thinking,
                tool_calls: currentStep.toolCalls,
                usage: {
                  usage_category: 'chat',
                  input_tokens: event.usage.input_tokens,
                  output_tokens: event.usage.output_tokens,
                  cache_read_tokens: event.usage.cache_read_tokens,
                  cache_write_tokens: event.usage.cache_write_tokens,
                  thinking_tokens: event.usage.thinking_tokens,
                  request_duration_ms: event.usage.request_duration_ms,
                  incomplete: event.usage.incomplete,
                  tool_call_count: event.usage.tool_call_count,
                  tool_calls_detail: event.usage.tool_calls_detail,
                  extras: {},
                },
              };
              pendingSteps.push(completedStep);
              // Reset for the next step (if any — multi-step turns have multiple usage events)
              currentStep = { thinking: '', toolCalls: [] };
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
        submitTurn(turnLlmModelId);
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
  };
}

const useNlqChatStore = defineStore('chat-nlq', createChatStoreSetup('nlq'));
const useBugReportChatStore = defineStore('chat-bug-report', createChatStoreSetup('bug-report'));

export function useChatStore(mode: ChatMode) {
  return mode === 'bug-report' ? useBugReportChatStore() : useNlqChatStore();
}
