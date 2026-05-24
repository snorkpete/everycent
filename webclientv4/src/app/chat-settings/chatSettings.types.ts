export interface ChatSettingsData {
  chat_enabled: boolean;
  ollama_url: string | null;
  ollama_model: string | null;
  llm_model_id: number | null;
  max_tool_iterations: number;
  extras: Record<string, unknown>;
}
