import { describe, it, expect, vi, beforeEach } from 'vitest';
import { institutionApi } from './institutionApi';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('institutionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('gets /institutions', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await institutionApi.getAll();

      expect(apiGateway.get).toHaveBeenCalledWith('/institutions');
    });

    it('returns the response data', async () => {
      const institutions = [{ id: 1, name: 'First Bank' }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: institutions });

      const result = await institutionApi.getAll();

      expect(result).toEqual(institutions);
    });
  });

  describe('create', () => {
    it('posts to /institutions with institution data', async () => {
      const institution = { name: 'New Bank' };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: { id: 1, ...institution } });

      await institutionApi.create(institution);

      expect(apiGateway.post).toHaveBeenCalledWith('/institutions', institution);
    });

    it('returns the response data', async () => {
      const institution = { name: 'New Bank' };
      const created = { id: 1, ...institution };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: created });

      const result = await institutionApi.create(institution);

      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('puts to /institutions/:id with institution data', async () => {
      const institution = { id: 3, name: 'Updated Bank' };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: institution });

      await institutionApi.update(institution);

      expect(apiGateway.put).toHaveBeenCalledWith('/institutions/3', institution);
    });

    it('returns the response data', async () => {
      const institution = { id: 3, name: 'Updated Bank' };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: institution });

      const result = await institutionApi.update(institution);

      expect(result).toEqual(institution);
    });
  });
});
