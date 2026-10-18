import type {
  CreateSessionOptions,
  JsonSchema,
  LanguageModelProvider,
  LanguageModelSession,
  ModelAvailability,
} from './languageModel.types';
import { parseModelJson } from './parseModelJson';

/**
 * LanguageModelProvider backed by the browser's built-in model via the Prompt API
 * (Gemini Nano in Chrome, Phi-4-mini in Edge). Runs entirely on the user's device.
 *
 * TypeScript's DOM lib doesn't include the Prompt API yet, so the minimal shape we
 * use is declared below. Chrome renamed inputQuota/inputUsage/measureInputUsage to
 * contextWindow/contextUsage/measureContextUsage, so both names are supported.
 */
interface PromptApiSession {
  contextWindow?: number;
  contextUsage?: number;
  inputQuota?: number;
  inputUsage?: number;
  measureContextUsage?(input: string): Promise<number>;
  measureInputUsage?(input: string): Promise<number>;
  prompt(
    input: string,
    options?: { responseConstraint?: JsonSchema; signal?: AbortSignal },
  ): Promise<string>;
  clone(options?: { signal?: AbortSignal }): Promise<PromptApiSession>;
  destroy(): void;
}

interface DownloadMonitor {
  addEventListener(type: 'downloadprogress', listener: (event: { loaded: number }) => void): void;
}

interface PromptApiCreateOptions {
  initialPrompts: { role: 'system'; content: string }[];
  signal?: AbortSignal;
  monitor?: (monitor: DownloadMonitor) => void;
}

interface PromptApi {
  availability(options: object): Promise<ModelAvailability>;
  create(options: PromptApiCreateOptions & object): Promise<PromptApiSession>;
}

// Declaring expected languages avoids browser warnings and lets it pick a suitable model
const EXPECTED_IO = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
};

// Rough fallbacks when the browser can't measure tokens or doesn't report its window
const CHARS_PER_TOKEN = 4;
const DEFAULT_CONTEXT_WINDOW = 4096;

function getPromptApi(): PromptApi | undefined {
  return (globalThis as { LanguageModel?: PromptApi }).LanguageModel;
}

function wrapSession(base: PromptApiSession): LanguageModelSession {
  const contextWindow = base.contextWindow ?? base.inputQuota ?? DEFAULT_CONTEXT_WINDOW;
  const usedBySystemPrompt = base.contextUsage ?? base.inputUsage ?? 0;
  const measure = base.measureContextUsage ?? base.measureInputUsage;

  return {
    tokenBudget: contextWindow - usedBySystemPrompt,

    async measureTokens(text) {
      return measure ? measure.call(base, text) : Math.ceil(text.length / CHARS_PER_TOKEN);
    },

    async promptJson(text, { schema, signal }) {
      // A Prompt API session keeps every prompt and reply in its context window, so
      // prompt a throwaway copy: each call starts from just the system prompt
      const session = await base.clone({ signal });
      try {
        const raw = await session.prompt(text, { responseConstraint: schema, signal });
        return parseModelJson(raw);
      } finally {
        session.destroy();
      }
    },

    destroy() {
      base.destroy();
    },
  };
}

export const browserLanguageModel: LanguageModelProvider = {
  async availability() {
    const api = getPromptApi();
    if (!api) return 'unavailable';
    try {
      return await api.availability(EXPECTED_IO);
    } catch {
      return 'unavailable';
    }
  },

  async createSession({ systemPrompt, onDownloadProgress, signal }: CreateSessionOptions) {
    const api = getPromptApi();
    if (!api) throw new Error('This browser does not have a built-in AI model');

    const session = await api.create({
      ...EXPECTED_IO,
      initialPrompts: [{ role: 'system', content: systemPrompt }],
      signal,
      monitor(monitor: DownloadMonitor) {
        monitor.addEventListener('downloadprogress', (event) => onDownloadProgress?.(event.loaded));
      },
    });
    return wrapSession(session);
  },
};
