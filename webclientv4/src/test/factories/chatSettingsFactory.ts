import type { ChatSettingsData } from '../../app/chat-settings/chatSettings.types';

export function buildChatSettings(overrides?: Partial<ChatSettingsData>): ChatSettingsData {
  return {
    chat_enabled: false,
    ollama_url: null,
    ollama_model: null,
    max_tool_iterations: 5,
    extras: {},
    ...overrides,
  };
}
