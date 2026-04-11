import apiGateway from '../api/api-gateway';

export const authApi = {
  signIn: (email: string, password: string) =>
    apiGateway.post('/auth/sign_in', { email, password }),

  googleSignIn: (credential: string) =>
    apiGateway.post('/auth/google', { credential }),

  validateToken: () => apiGateway.get('/auth/validate_token'),

  signOut: () => apiGateway.delete('/auth/sign_out'),
};
