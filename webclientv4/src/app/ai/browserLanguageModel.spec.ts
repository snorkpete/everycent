import { describe, it, expect, vi, afterEach } from 'vitest';
import { browserLanguageModel } from './browserLanguageModel';
import { buildPromptApiMock } from '../../test/buildPromptApiMock';
import type { JsonSchema } from './languageModel.types';

const SCHEMA: JsonSchema<{ ok: boolean }> = { type: 'object' };
const { installer } = browserLanguageModel;

describe('browserLanguageModel', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('installer.availability', () => {
    it('is unavailable when the browser has no Prompt API', async () => {
      expect(await installer.availability()).toBe('unavailable');
    });

    it("reports the browser's availability", async () => {
      buildPromptApiMock({ availability: 'downloadable' });
      expect(await installer.availability()).toBe('downloadable');
    });

    it('is unavailable when the availability check throws', async () => {
      vi.stubGlobal('LanguageModel', {
        availability: () => Promise.reject(new Error('boom')),
      });
      expect(await installer.availability()).toBe('unavailable');
    });
  });

  describe('installer.install', () => {
    it('does nothing when the model is already available', async () => {
      const mock = buildPromptApiMock({ availability: 'available' });
      await installer.install();
      expect(mock.createOptions).toEqual([]);
    });

    it('downloads the model, reporting progress, then cleans up', async () => {
      const mock = buildPromptApiMock({
        availability: 'downloadable',
        downloadProgress: [0.25, 1],
      });
      const onProgress = vi.fn();

      await installer.install({ onProgress });

      expect(onProgress.mock.calls).toEqual([[0.25], [1]]);
      expect(mock.createOptions[0]).toMatchObject({
        expectedInputs: [{ type: 'text', languages: ['en'] }],
      });
      expect(mock.destroyedSessions).toBe(1);
    });

    it('does not require a progress callback', async () => {
      buildPromptApiMock({ availability: 'downloading', downloadProgress: [0.5] });
      await expect(installer.install()).resolves.toBeUndefined();
    });

    it('throws when the browser has no Prompt API', async () => {
      await expect(installer.install()).rejects.toThrow(
        'This browser does not have a built-in AI model',
      );
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
  });

  describe('session', () => {
    it('reports the prompt-and-reply budget left after the system prompt', async () => {
      buildPromptApiMock({ contextWindow: 6000, systemPromptTokens: 250 });
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });
      expect(session.promptAndReplyTokenBudget).toBe(5750);
    });

    it('assumes a small context window when the browser reports none', async () => {
      vi.stubGlobal('LanguageModel', {
        create: async () => ({ destroy: vi.fn() }),
      });
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });
      expect(session.promptAndReplyTokenBudget).toBe(4096);
    });

    it('counts tokens with the browser', async () => {
      buildPromptApiMock();
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });
      expect(await session.countTokens('a'.repeat(40))).toBe(10);
    });

    it('estimates tokens when the browser cannot count them', async () => {
      buildPromptApiMock({ withoutMeasure: true });
      const session = await browserLanguageModel.createSession({ systemPrompt: 'x' });
      expect(await session.countTokens('a'.repeat(41))).toBe(11);
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
