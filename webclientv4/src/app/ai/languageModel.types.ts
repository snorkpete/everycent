/**
 * Provider-agnostic interface for language models used by AI features.
 *
 * Features (e.g. the AI transaction importer) depend only on these types, never on
 * a specific model. A new backing model (browser built-in, Ollama, a server API)
 * is added by implementing LanguageModelProvider and choosing it in
 * languageModelProvider.ts — features don't change.
 *
 * Usage: check `installer.availability()`, call `installer.install()` if the model
 * still needs downloading, create a session with a system prompt, then call
 * promptJson() as many times as needed and destroy() when done.
 */

/**
 * Whether the model can be used on this device. Mirrors the browser Prompt API's
 * states, which other providers can map onto (e.g. Ollama: model pulled =
 * available, not pulled = downloadable, server unreachable = unavailable).
 * - available: ready to run now
 * - downloadable: supported, but the model must be installed first (browser model:
 *   a one-time download of several GB)
 * - downloading: an install is already in progress
 * - unavailable: can't run here (unsupported browser, device too weak, server down)
 */
export type ModelAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable';

/**
 * A JSON schema tagged with the TypeScript type it describes, so a schema and the
 * type of the reply it produces travel together. `__type` exists only for type
 * inference and is never set.
 */
export type JsonSchema<T> = Record<string, unknown> & { readonly __type?: T };

export interface InstallOptions {
  // Called with 0..1 while the model downloads
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

/**
 * Gets a model ready to use on this device (e.g. downloading it). Kept separate
 * from sessions so talking to a model doesn't also mean managing its install.
 */
export interface ModelInstaller {
  // Returns one of several states rather than a boolean; for booleans, use
  // useLanguageModelAvailability()
  availability(): Promise<ModelAvailability>;
  // Resolves once the model is ready; does nothing if it already is
  install(options?: InstallOptions): Promise<void>;
}

export interface CreateSessionOptions {
  // Instructions that apply to every prompt in the session
  systemPrompt: string;
  signal?: AbortSignal;
}

export interface PromptJsonOptions<T> {
  // Shape the reply must match; providers enforce it natively where they can
  // (browser: responseConstraint, Ollama: format)
  schema: JsonSchema<T>;
  signal?: AbortSignal;
}

/**
 * A model loaded with a system prompt, ready to answer prompts.
 * Prompts return parsed JSON rather than free text because AI features need
 * structured output; each provider enforces the schema in its own way.
 */
export interface LanguageModelSession {
  // Tokens available for one prompt AND the model's reply to it, after the system
  // prompt. Callers compare it with countTokens() to split input that won't fit,
  // leaving room for the reply.
  readonly promptAndReplyTokenBudget: number;
  // Tokens the given text would use; the system prompt is not included
  countTokens(text: string): Promise<number>;
  // Each call is independent: earlier prompts don't consume later prompts' budget.
  // The reply has the schema's shape, but its values are model output and still
  // need checking (e.g. a date can be well-formed but impossible).
  promptJson<T>(text: string, options: PromptJsonOptions<T>): Promise<T>;
  // Frees the model's resources; the session can't be used afterwards
  destroy(): void;
}

/**
 * Something that can give you a model: an installer that gets it ready on this
 * device, and sessions to prompt it. One implementation per backend.
 */
export interface LanguageModelProvider {
  installer: ModelInstaller;
  // Expects the model to be installed; see ModelInstaller
  createSession(options: CreateSessionOptions): Promise<LanguageModelSession>;
}
