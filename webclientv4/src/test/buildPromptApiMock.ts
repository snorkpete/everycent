import { vi } from 'vitest';
import type { ModelAvailability } from '../app/ai/languageModel.types';

export interface PromptApiMockOptions {
  availability?: ModelAvailability;
  contextWindow?: number;
  systemPromptTokens?: number;
  // Returned by successive prompt() calls; the last one repeats
  responses?: string[];
  // Fractions reported to the download monitor during create()
  downloadProgress?: number[];
  // Use Chrome's older inputQuota/inputUsage/measureInputUsage names
  legacyNames?: boolean;
  // Omit the token-measuring method entirely
  withoutMeasure?: boolean;
  createError?: Error;
  promptError?: Error;
  // prompt() waits for this before replying (rejecting if its signal aborts first),
  // so specs can observe in-progress state
  promptGate?: Promise<unknown>;
}

export interface PromptApiMock {
  prompts: string[];
  responseConstraints: unknown[];
  createOptions: Record<string, unknown>[];
  destroyedSessions: number;
}

function waitUnlessAborted(gate: Promise<unknown>, signal?: AbortSignal): Promise<unknown> {
  return new Promise((resolve, reject) => {
    signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    gate.then(resolve);
  });
}

// Fake tokenizer: 1 token per 4 characters
export function fakeTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Installs a fake browser Prompt API (`globalThis.LanguageModel`) — the system
 * boundary for AI features, like apiGateway is for HTTP. Undo with
 * vi.unstubAllGlobals() in afterEach.
 */
export function buildPromptApiMock({
  availability = 'available',
  contextWindow = 6000,
  systemPromptTokens = 200,
  responses = ['{"transactions":[]}'],
  downloadProgress = [],
  legacyNames = false,
  withoutMeasure = false,
  createError,
  promptError,
  promptGate,
}: PromptApiMockOptions = {}): PromptApiMock {
  const mock: PromptApiMock = {
    prompts: [],
    responseConstraints: [],
    createOptions: [],
    destroyedSessions: 0,
  };
  let responseIndex = 0;

  function makeSession(): Record<string, unknown> {
    const measure = async (text: string) => fakeTokenCount(text);
    const session: Record<string, unknown> = {
      async prompt(text: string, options?: { responseConstraint?: unknown; signal?: AbortSignal }) {
        if (promptError) throw promptError;
        mock.prompts.push(text);
        mock.responseConstraints.push(options?.responseConstraint);
        if (promptGate) await waitUnlessAborted(promptGate, options?.signal);
        const response = responses[Math.min(responseIndex, responses.length - 1)];
        responseIndex++;
        return response;
      },
      async clone() {
        return makeSession();
      },
      destroy() {
        mock.destroyedSessions++;
      },
    };
    if (legacyNames) {
      session.inputQuota = contextWindow;
      session.inputUsage = systemPromptTokens;
      if (!withoutMeasure) session.measureInputUsage = measure;
    } else {
      session.contextWindow = contextWindow;
      session.contextUsage = systemPromptTokens;
      if (!withoutMeasure) session.measureContextUsage = measure;
    }
    return session;
  }

  vi.stubGlobal('LanguageModel', {
    availability: async () => availability,
    async create(options: Record<string, unknown>) {
      mock.createOptions.push(options);
      if (createError) throw createError;
      const monitor = options.monitor as
        | ((target: {
            addEventListener: (type: string, listener: (e: object) => void) => void;
          }) => void)
        | undefined;
      monitor?.({
        addEventListener: (_type, listener) => {
          downloadProgress.forEach((loaded) => listener({ loaded }));
        },
      });
      return makeSession();
    },
  });

  return mock;
}
