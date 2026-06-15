import apiGateway from '../api/api-gateway';
import type { AuthResponseData } from './auth.types';

export const authApi = {
  googleSignIn: (credential: string) =>
    apiGateway
      .post<{ success: boolean; data: AuthResponseData }>('/auth/google', { credential })
      .then((r) => r.data),

  validateToken: () =>
    apiGateway
      .get<{ success: boolean; data: { email: string } }>('/auth/validate')
      .then((r) => r.data),

  signOut: () => apiGateway.delete('/auth/sign_out'),
};
