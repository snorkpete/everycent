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

  describe('signIn', () => {
    it('posts to /auth/sign_in and returns unwrapped data', async () => {
      const email = 'user@test.com';
      const password = 'pass123';
      const responseData = { user: { id: 1 } };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: responseData });

      const result = await authApi.signIn(email, password);

      expect(apiGateway.post).toHaveBeenCalledWith('/auth/sign_in', {
        email,
        password,
      });
      expect(result).toEqual(responseData);
    });
  });

  describe('googleSignIn', () => {
    it('posts to /auth/google with the credential and returns unwrapped data', async () => {
      const credential = 'google-id-token-abc';
      const responseData = { user: { id: 1 } };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: responseData });

      const result = await authApi.googleSignIn(credential);

      expect(apiGateway.post).toHaveBeenCalledWith('/auth/google', { credential });
      expect(result).toEqual(responseData);
    });
  });

  describe('validateToken', () => {
    it('gets /auth/validate_token and returns unwrapped data', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { success: true },
      });

      const result = await authApi.validateToken();

      expect(apiGateway.get).toHaveBeenCalledWith('/auth/validate_token');
      expect(result).toEqual({ success: true });
    });
  });

  describe('signOut', () => {
    it('deletes /auth/sign_out and returns unwrapped data', async () => {
      vi.mocked(apiGateway.delete).mockResolvedValue({ data: {} });

      const result = await authApi.signOut();

      expect(apiGateway.delete).toHaveBeenCalledWith('/auth/sign_out');
      expect(result).toEqual({});
    });
  });
});
