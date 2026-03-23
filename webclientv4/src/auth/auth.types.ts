export interface AuthCredentials {
  'access-token': string | null;
  client: string | null;
  expiry: string | null;
  'token-type': string | null;
  uid: string | null;
}

export const AUTH_HEADER_KEYS: (keyof AuthCredentials)[] = [
  'access-token',
  'client',
  'expiry',
  'token-type',
  'uid',
];
