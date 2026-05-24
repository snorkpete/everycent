import type { LlmModelData } from '../llm-models/llmModel.types';

export interface ChatSettingsData {
  chat_enabled: boolean;
  llm_model_id: number | null;
  max_tool_iterations: number;
  extras: Record<string, unknown>;
  llm_model?: LlmModelData | null;
}
