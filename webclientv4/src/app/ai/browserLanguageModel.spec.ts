import { describe, it, expect, vi, afterEach } from 'vitest';
import { browserLanguageModel } from './browserLanguageModel';
import { buildPromptApiMock, fakeTokenCount } from '../../test/buildPromptApiMock';

const SCHEMA = { type: 'object' };

describe('browserLanguageModel', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('availability', () => {
    it('is unavailable when the browser has no Prompt API', async () => {
      expect(await browserLanguageModel.availability()).toBe('unavailable');
    });

    it("reports the browser's availability", async () => {
      buildPromptApiMock({ availability: 'downloadable' });
      expect(await browserLanguageModel.availability()).toBe('downloadable');
    });

    it('is unavailable when the availability check throws', async () => {
      vi.stubGlobal('LanguageModel', {
        availability: () => Promise.reject(new Error('boom')),
      });
      expect(await browserLanguageModel.availability()).toBe('unavailable');
    });
  });

  describe('createSession', () => {
    it('throws when the browser has no Prompt API', async () => {
      await expect(browserLanguageModel.createSession({ systemPrompt: 'x' })).rejects.toThrow(
        'This browser does not have a built-in AI model',
      );
    });

    it('passes the system prompt and expected languages to the browser', async () => {
      const mock = buildPromptApiMock();
      await browserLanguageModel.createSession({ systemPrompt: 'Be helpful' });

      expect(mock.createOptions[0]).toMatchObject({
        initialPrompts: [{ role: 'system', content: 'Be helpful' }],
        expectedInputs: [{ type: 'text', languages: ['en'] }],
        expectedOutputs: [{ type: 'text', languages: ['en'] }],
      });
    });

    it('reports download progress', async () => {
      buildPromptApiMock({ downloadProgress: [0.25, 1] });
      const onDownloadProgress = vi.fn();

      await browserLanguageModel.createSession({ systemPrompt: 'x', onDownloadProgress });

      expect(onDownloadProgress.mock.calls).toEqual([[0.25], [1]]);
    });

    it('does not require a download progress callback', async () => {
      buildPromptApiMock({ downloadProgress: [0.5] });
      await expect(
        browserLanguageModel.createSession({ systemPrompt: 'x' }),
      ).resolves.toBeDefined();
    });
  });

  describe('session', () => {
    it('reports the token budget left after the system prompt', async () => {
      buildPromptApiMock({ contextWindow: 6000, systemPromptTokens: 250 });
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });
      expect(session.tokenBudget).toBe(5750);
    });

    it("supports Chrome's older quota names", async () => {
      buildPromptApiMock({ contextWindow: 4000, systemPromptTokens: 100, legacyNames: true });
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });

      expect(session.tokenBudget).toBe(3900);
      expect(await session.measureTokens('12345678')).toBe(fakeTokenCount('12345678'));
    });

    it('assumes a small context window when the browser reports none', async () => {
      vi.stubGlobal('LanguageModel', {
        create: async () => ({ destroy: vi.fn() }),
      });
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });
      expect(session.tokenBudget).toBe(4096);
    });

    it('measures tokens with the browser', async () => {
      buildPromptApiMock();
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });
      expect(await session.measureTokens('a'.repeat(40))).toBe(10);
    });

    it('estimates tokens when the browser cannot measure them', async () => {
      buildPromptApiMock({ withoutMeasure: true });
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });
      expect(await session.measureTokens('a'.repeat(41))).toBe(11);
    });

    it('prompts with the schema as a response constraint and parses the JSON reply', async () => {
      const mock = buildPromptApiMock({ responses: ['{"ok":true}'] });
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });

      const result = await session.promptJson('hello', { schema: SCHEMA });

      expect(result).toEqual({ ok: true });
      expect(mock.prompts).toEqual(['hello']);
      expect(mock.responseConstraints).toEqual([SCHEMA]);
    });

    it('prompts a disposable copy of the session each time', async () => {
      const mock = buildPromptApiMock();
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });

      await session.promptJson('one', { schema: SCHEMA });
      await session.promptJson('two', { schema: SCHEMA });

      expect(mock.destroyedSessions).toBe(2);
    });

    it('cleans up the copy when prompting fails', async () => {
      const mock = buildPromptApiMock({ promptError: new Error('model failed') });
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });

      await expect(session.promptJson('hi', { schema: SCHEMA })).rejects.toThrow('model failed');
      expect(mock.destroyedSessions).toBe(1);
    });

    it('destroys the underlying session', async () => {
      const mock = buildPromptApiMock();
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });

      session.destroy();

      expect(mock.destroyedSessions).toBe(1);
    });
  });
});
