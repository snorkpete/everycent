import type {
  CreateSessionOptions,
  InstallOptions,
  LanguageModelProvider,
  LanguageModelSession,
  ModelAvailability,
  ModelInstaller,
  PromptJsonOptions,
} from './languageModel.types';
import { parseModelJson } from './parseModelJson';

/**
 * LanguageModelProvider backed by the browser's built-in model via the Prompt API
 * (Gemini Nano in Chrome, Phi-4-mini in Edge). Runs entirely on the user's device.
 *
 * TypeScript's DOM lib doesn't include the Prompt API yet, so the minimal shape we
 * use is declared below.
 */
interface PromptApiSession {
  contextWindow?: number;
  contextUsage?: number;
  measureContextUsage?(input: string): Promise<number>;
  prompt(
    input: string,
    options?: { responseConstraint?: Record<string, unknown>; signal?: AbortSignal },
  ): Promise<string>;
  clone(options?: { signal?: AbortSignal }): Promise<PromptApiSession>;
  destroy(): void;
}

interface DownloadMonitor {
  addEventListener(type: 'downloadprogress', listener: (event: { loaded: number }) => void): void;
}

interface PromptApiCreateOptions {
  initialPrompts?: { role: 'system'; content: string }[];
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

function requirePromptApi(): PromptApi {
  const api = getPromptApi();
  if (!api) throw new Error('This browser does not have a built-in AI model');
  return api;
}

const installer: ModelInstaller = {
  async availability() {
    const api = getPromptApi();
    if (!api) return 'unavailable';
    try {
      return await api.availability(EXPECTED_IO);
    } catch {
      return 'unavailable';
    }
  },

  async install({ onProgress, signal }: InstallOptions = {}) {
    if ((await installer.availability()) === 'available') return;

    // The browser downloads its model on the first create(); this session only
    // exists to trigger and wait for that download
    const session = await requirePromptApi().create({
      ...EXPECTED_IO,
      signal,
      monitor(monitor: DownloadMonitor) {
        monitor.addEventListener('downloadprogress', (event) => onProgress?.(event.loaded));
      },
    });
    session.destroy();
  },
};

function wrapSession(base: PromptApiSession): LanguageModelSession {
  const contextWindow = base.contextWindow ?? DEFAULT_CONTEXT_WINDOW;
  const usedBySystemPrompt = base.contextUsage ?? 0;

  return {
    promptAndReplyTokenBudget: contextWindow - usedBySystemPrompt,

    async countTokens(text) {
      return base.measureContextUsage
        ? base.measureContextUsage(text)
        : Math.ceil(text.length / CHARS_PER_TOKEN);
    },

    async promptJson<T>(text: string, { schema, signal }: PromptJsonOptions<T>): Promise<T> {
      // A Prompt API session keeps every prompt and reply in its context window, so
      // prompt a throwaway copy: each call starts from just the system prompt
      const session = await base.clone({ signal });
      try {
        const raw = await session.prompt(text, { responseConstraint: schema, signal });
        // The browser enforced the schema, so the reply has T's shape
        return parseModelJson(raw) as T;
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
  installer,

  async createSession({ systemPrompt, signal }: CreateSessionOptions) {
    const session = await requirePromptApi().create({
      ...EXPECTED_IO,
      initialPrompts: [{ role: 'system', content: systemPrompt }],
      signal,
    });
    return wrapSession(session);
  },
};
