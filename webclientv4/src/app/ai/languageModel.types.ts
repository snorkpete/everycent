/**
 * Provider-agnostic interface for language models used by AI features.
 *
 * Features (e.g. the AI transaction importer) depend only on these types, never on
 * a specific model. A new backing model (browser built-in, Ollama, a server API)
 * is added by implementing LanguageModelProvider and choosing it in
 * languageModelProvider.ts — features don't change.
 *
 * Usage: ask a provider for its availability, create a session with a system
 * prompt, then call promptJson() as many times as needed and destroy() when done.
 */

/**
 * Whether the model can be used on this device. Mirrors the browser Prompt API's
 * states, which other providers can map onto (e.g. Ollama: server reachable =
 * available, unreachable = unavailable).
 * - available: ready to run now
 * - downloadable: supported, but the model must be downloaded first; createSession()
 *   starts the download (browser model: a one-time download of several GB)
 * - downloading: a download is already in progress; createSession() waits for it
 * - unavailable: can't run here (unsupported browser, device too weak, server down)
 */
export type ModelAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable';

export type JsonSchema = Record<string, unknown>;

export interface CreateSessionOptions {
  // Instructions that apply to every prompt in the session
  systemPrompt: string;
  // Called with 0..1 while the model downloads (first use only)
  onDownloadProgress?: (fraction: number) => void;
  // Aborting cancels a pending download/start
  signal?: AbortSignal;
}

export interface PromptJsonOptions {
  // Shape the reply must match; providers enforce it natively where they can
  // (browser: responseConstraint, Ollama: format)
  schema: JsonSchema;
  signal?: AbortSignal;
}

/**
 * A model loaded with a system prompt, ready to answer prompts.
 * Prompts return parsed JSON rather than free text because AI features need
 * structured output; each provider enforces the schema in its own way.
 */
export interface LanguageModelSession {
  // Tokens available for a single prompt + response, after the system prompt.
  // Callers use it with measureTokens() to split input that wouldn't fit.
  readonly tokenBudget: number;
  measureTokens(text: string): Promise<number>;
  // Each call is independent: earlier prompts don't consume later prompts' budget
  promptJson(text: string, options: PromptJsonOptions): Promise<unknown>;
  // Frees the model's resources; the session can't be used afterwards
  destroy(): void;
}

/**
 * Something that can give you a model: reports whether its model can run on this
 * device and creates sessions with it. One implementation per backend.
 */
export interface LanguageModelProvider {
  // Named after the Prompt API's availability(); it returns one of several states,
  // not a boolean. useLanguageModelAvailability() exposes the boolean isUsable.
  availability(): Promise<ModelAvailability>;
  createSession(options: CreateSessionOptions): Promise<LanguageModelSession>;
}
