import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from './authApi';
import apiGateway from '../api/api-gateway';

vi.mock('../api/api-gateway', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('authApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('googleSignIn', () => {
    it('posts to /auth/google with the credential and returns unwrapped data', async () => {
      const credential = 'google-id-token-abc';
      const responseData = { success: true, data: { email: 'user@test.com', token: 'tok-123' } };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: responseData });

      const result = await authApi.googleSignIn(credential);

      expect(apiGateway.post).toHaveBeenCalledWith('/auth/google', { credential });
      expect(result).toEqual(responseData);
    });
  });

  describe('validateToken', () => {
    it('gets /auth/validate and returns unwrapped data', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { success: true },
      });

      const result = await authApi.validateToken();

      expect(apiGateway.get).toHaveBeenCalledWith('/auth/validate');
      expect(result).toEqual({ success: true });
    });
  });

  describe('signOut', () => {
    it('deletes /auth/sign_out', async () => {
      vi.mocked(apiGateway.delete).mockResolvedValue({ status: 204, data: undefined });

      await authApi.signOut();

      expect(apiGateway.delete).toHaveBeenCalledWith('/auth/sign_out');
    });
  });
});
