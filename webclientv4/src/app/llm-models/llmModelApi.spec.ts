import { describe, it, expect, vi, beforeEach } from 'vitest';
import { llmModelApi } from './llmModelApi';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('llmModelApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('gets /llm_models', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await llmModelApi.getAll();

      expect(apiGateway.get).toHaveBeenCalledWith('/llm_models');
    });

    it('returns the response data', async () => {
      const models = [{ id: 1, name: 'claude-opus-4-5', provider: 'anthropic' }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: models });

      const result = await llmModelApi.getAll();

      expect(result).toEqual(models);
    });
  });

  describe('create', () => {
    it('posts to /llm_models with wrapped payload', async () => {
      const model = { name: 'claude-sonnet-4-5', provider: 'anthropic' };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: { id: 1, ...model } });

      await llmModelApi.create(model);

      expect(apiGateway.post).toHaveBeenCalledWith('/llm_models', { llm_model: model });
    });

    it('returns the response data', async () => {
      const model = { name: 'claude-sonnet-4-5', provider: 'anthropic' };
      const created = { id: 1, ...model };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: created });

      const result = await llmModelApi.create(model);

      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('puts to /llm_models/:id with wrapped payload', async () => {
      const model = { id: 3, name: 'claude-opus-4-5', provider: 'anthropic' };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: model });

      await llmModelApi.update(model);

      expect(apiGateway.put).toHaveBeenCalledWith('/llm_models/3', { llm_model: model });
    });

    it('returns the response data', async () => {
      const model = { id: 3, name: 'claude-opus-4-5', provider: 'anthropic' };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: model });

      const result = await llmModelApi.update(model);

      expect(result).toEqual(model);
    });
  });

  describe('destroy', () => {
    it('deletes /llm_models/:id', async () => {
      vi.mocked(apiGateway.delete).mockResolvedValue({ data: undefined });

      await llmModelApi.destroy(7);

      expect(apiGateway.delete).toHaveBeenCalledWith('/llm_models/7');
    });

    it('resolves with void on success', async () => {
      vi.mocked(apiGateway.delete).mockResolvedValue({ data: undefined });

      const result = await llmModelApi.destroy(7);

      expect(result).toBeUndefined();
    });
  });
});
