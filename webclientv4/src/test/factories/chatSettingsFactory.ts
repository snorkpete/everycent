import type { ChatSettingsData } from '../../app/chat-settings/chatSettings.types';

export function buildChatSettings(overrides?: Partial<ChatSettingsData>): ChatSettingsData {
  return {
    chat_enabled: false,
    llm_model_id: null,
    max_tool_iterations: 5,
    extras: {},
    llm_model: null,
    ...overrides,
  };
}
