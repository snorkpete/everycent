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
    it('posts to /auth/sign_in with email and password', async () => {
      const email = 'user@test.com';
      const password = 'pass123';
      vi.mocked(apiGateway.post).mockResolvedValue({ data: {} });

      await authApi.signIn(email, password);

      expect(apiGateway.post).toHaveBeenCalledWith('/auth/sign_in', {
        email,
        password,
      });
    });
  });

  describe('googleSignIn', () => {
    it('posts to /auth/google with the credential', async () => {
      const credential = 'google-id-token-abc';
      vi.mocked(apiGateway.post).mockResolvedValue({ data: {} });

      await authApi.googleSignIn(credential);

      expect(apiGateway.post).toHaveBeenCalledWith('/auth/google', { credential });
    });
  });

  describe('validateToken', () => {
    it('gets /auth/validate_token', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { success: true },
      });

      await authApi.validateToken();

      expect(apiGateway.get).toHaveBeenCalledWith('/auth/validate_token');
    });
  });

  describe('signOut', () => {
    it('deletes /auth/sign_out', async () => {
      vi.mocked(apiGateway.delete).mockResolvedValue({ data: {} });

      await authApi.signOut();

      expect(apiGateway.delete).toHaveBeenCalledWith('/auth/sign_out');
    });
  });
});
