import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsApi } from './settingsApi';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('settingsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('gets /settings', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: {} });

      await settingsApi.get();

      expect(apiGateway.get).toHaveBeenCalledWith('/settings');
    });

    it('returns the response data', async () => {
      const settings = { family_type: 'couple' as const, husband: 'John', wife: 'Jane' };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: settings });

      const result = await settingsApi.get();

      expect(result).toEqual(settings);
    });
  });

  describe('save', () => {
    it('posts to /settings with settings data', async () => {
      const settings = { family_type: 'single' as const, single_person: 'Alex' };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: settings });

      await settingsApi.save(settings);

      expect(apiGateway.post).toHaveBeenCalledWith('/settings', settings);
    });

    it('returns the response data', async () => {
      const settings = { family_type: 'couple' as const };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: settings });

      const result = await settingsApi.save(settings);

      expect(result).toEqual(settings);
    });
  });
});
