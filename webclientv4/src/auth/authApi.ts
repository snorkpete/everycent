import apiGateway from '../api/api-gateway';

export const authApi = {
  signIn: (email: string, password: string) =>
    apiGateway.post('/auth/sign_in', { email, password }).then((r) => r.data),

  googleSignIn: (credential: string) =>
    apiGateway.post('/auth/google', { credential }).then((r) => r.data),

  validateToken: () =>
    apiGateway.get<{ success: boolean }>('/auth/validate_token').then((r) => r.data),

  signOut: () => apiGateway.delete('/auth/sign_out').then((r) => r.data),
};
