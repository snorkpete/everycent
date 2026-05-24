import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLlmModelStore } from './llmModelStore';
import apiGateway from '../../api/api-gateway';
import { buildApiGatewayMock } from '../../test/buildApiGatewayMock';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockApiGateway = buildApiGatewayMock();

describe('llmModelStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockApiGateway.reset();
    mockApiGateway.get('/llm_models', []);
  });

  describe('fetchAll', () => {
    it('fetches and stores models', async () => {
      const models = [{ id: 1, name: 'claude-opus-4-5', provider: 'anthropic' }];
      mockApiGateway.get('/llm_models', models);

      const store = useLlmModelStore();
      await store.fetchAll();

      expect(store.models).toEqual(models);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(apiGateway.get).mockImplementationOnce(async () => {
        loadingDuringCall = useLlmModelStore().loading;
        return { data: [] };
      });

      const store = useLlmModelStore();
      await store.fetchAll();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure', async () => {
      mockApiGateway.rejectGet('/llm_models', new Error('Network error'));

      const store = useLlmModelStore();
      await store.fetchAll();

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('sets a fallback error message when the rejection is not an Error instance', async () => {
      vi.mocked(apiGateway.get).mockRejectedValueOnce('unexpected');

      const store = useLlmModelStore();
      await store.fetchAll();

      expect(store.error).toBe('Failed to load LLM models');
    });

    it('clears error on subsequent successful fetch', async () => {
      mockApiGateway.rejectGet('/llm_models', new Error('fail'));

      const store = useLlmModelStore();
      await store.fetchAll();

      mockApiGateway.get('/llm_models', []);
      await store.fetchAll();

      expect(store.error).toBeNull();
    });
  });

  describe('save', () => {
    it('creates a new model when no id is present', async () => {
      const newModel = { name: 'claude-haiku-4-5', provider: 'anthropic' };
      mockApiGateway.post('/llm_models', { id: 1, ...newModel });

      const store = useLlmModelStore();
      await store.save(newModel);

      expect(apiGateway.post).toHaveBeenCalledWith('/llm_models', { llm_model: newModel });
      expect(apiGateway.put).not.toHaveBeenCalled();
    });

    it('updates an existing model when id is present', async () => {
      const model = { id: 5, name: 'claude-opus-4-5', provider: 'anthropic' };
      mockApiGateway.put('/llm_models/5', model);

      const store = useLlmModelStore();
      await store.save(model);

      expect(apiGateway.put).toHaveBeenCalledWith('/llm_models/5', { llm_model: model });
      expect(apiGateway.post).not.toHaveBeenCalled();
    });

    it('sets error message and re-throws on save failure', async () => {
      mockApiGateway.rejectPut('/llm_models/5', new Error('Server error'));

      const store = useLlmModelStore();
      await expect(
        store.save({ id: 5, name: 'claude-opus-4-5', provider: 'anthropic' }),
      ).rejects.toThrow('Server error');

      expect(store.error).toBe('Server error');
    });

    it('sets a fallback error message when the save rejection is not an Error instance', async () => {
      vi.mocked(apiGateway.put).mockRejectedValueOnce('unexpected');

      const store = useLlmModelStore();
      await store.save({ id: 5, name: 'claude-opus-4-5', provider: 'anthropic' }).catch(() => {});

      expect(store.error).toBe('Failed to save LLM model');
    });

    it('sets loading to true during save and false after', async () => {
      let loadingDuringSave = false;
      vi.mocked(apiGateway.put).mockImplementationOnce(async () => {
        loadingDuringSave = useLlmModelStore().loading;
        return { data: { id: 5 } };
      });

      const store = useLlmModelStore();
      await store.save({ id: 5, name: 'claude-opus-4-5', provider: 'anthropic' });

      expect(loadingDuringSave).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('resets loading to false on save failure', async () => {
      mockApiGateway.rejectPut('/llm_models/5', new Error('fail'));

      const store = useLlmModelStore();
      await store.save({ id: 5, name: 'claude-opus-4-5', provider: 'anthropic' }).catch(() => {});

      expect(store.loading).toBe(false);
    });

    it('refreshes models after save', async () => {
      const refreshed = [{ id: 5, name: 'claude-opus-4-5', provider: 'anthropic' }];
      mockApiGateway.put('/llm_models/5', refreshed[0]);
      mockApiGateway.get('/llm_models', refreshed);

      const store = useLlmModelStore();
      await store.save({ id: 5, name: 'claude-opus-4-5', provider: 'anthropic' });

      expect(store.models).toEqual(refreshed);
    });
  });

  describe('destroy', () => {
    it('deletes the model by id', async () => {
      mockApiGateway.delete('/llm_models/7', undefined);

      const store = useLlmModelStore();
      await store.destroy(7);

      expect(apiGateway.delete).toHaveBeenCalledWith('/llm_models/7');
    });

    it('sets error message and re-throws on delete failure', async () => {
      mockApiGateway.rejectDelete('/llm_models/7', new Error('Delete failed'));

      const store = useLlmModelStore();
      await expect(store.destroy(7)).rejects.toThrow('Delete failed');

      expect(store.error).toBe('Delete failed');
    });

    it('sets a fallback error message when the delete rejection is not an Error instance', async () => {
      vi.mocked(apiGateway.delete).mockRejectedValueOnce('unexpected');

      const store = useLlmModelStore();
      await store.destroy(7).catch(() => {});

      expect(store.error).toBe('Failed to delete LLM model');
    });

    it('sets loading to true during destroy and false after', async () => {
      let loadingDuringDelete = false;
      vi.mocked(apiGateway.delete).mockImplementationOnce(async () => {
        loadingDuringDelete = useLlmModelStore().loading;
        return { data: undefined };
      });

      const store = useLlmModelStore();
      await store.destroy(7);

      expect(loadingDuringDelete).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('resets loading to false on delete failure', async () => {
      mockApiGateway.rejectDelete('/llm_models/7', new Error('fail'));

      const store = useLlmModelStore();
      await store.destroy(7).catch(() => {});

      expect(store.loading).toBe(false);
    });

    it('refreshes models after delete', async () => {
      const refreshed = [{ id: 2, name: 'claude-haiku-4-5', provider: 'anthropic' }];
      mockApiGateway.delete('/llm_models/7', undefined);
      mockApiGateway.get('/llm_models', refreshed);

      const store = useLlmModelStore();
      await store.destroy(7);

      expect(store.models).toEqual(refreshed);
    });
  });
});
