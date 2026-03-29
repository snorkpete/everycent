import { describe, it, expect } from 'vitest';
import apiGateway from './api-gateway';

describe('api-gateway', () => {
  it('sets base URL to localhost:3000 in non-production', () => {
    expect(apiGateway.defaults.baseURL).toBe('http://localhost:3000');
  });

  it('sets Content-Type to application/json', () => {
    expect(apiGateway.defaults.headers['Content-Type']).toBe('application/json');
  });
});
