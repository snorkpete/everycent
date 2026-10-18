/**
 * Provider-agnostic interface for language models used by AI features.
 *
 * Features (e.g. the AI transaction importer) depend only on these types, so a
 * new backing model (browser built-in, Ollama, a server API) can be added by
 * implementing LanguageModelProvider and registering it in languageModelProvider.ts.
 */

// Mirrors the browser Prompt API's availability states
export type ModelAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable';

export type JsonSchema = Record<string, unknown>;

export interface CreateSessionOptions {
  systemPrompt: string;
  // Called with 0..1 while the model downloads (first use only)
  onDownloadProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

export interface PromptJsonOptions {
  schema: JsonSchema;
  signal?: AbortSignal;
}

export interface LanguageModelSession {
  // Tokens available for a single prompt + response, after the system prompt
  readonly tokenBudget: number;
  measureTokens(text: string): Promise<number>;
  // Each call is independent: earlier prompts don't consume later prompts' budget
  promptJson(text: string, options: PromptJsonOptions): Promise<unknown>;
  destroy(): void;
}

export interface LanguageModelProvider {
  availability(): Promise<ModelAvailability>;
  createSession(options: CreateSessionOptions): Promise<LanguageModelSession>;
}
