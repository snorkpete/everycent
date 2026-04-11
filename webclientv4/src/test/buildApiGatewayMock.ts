import { type Mock } from 'vitest';
import apiGateway from '../api/api-gateway';

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch';
type Route = { kind: 'resolve'; data: unknown } | { kind: 'reject'; error: Error };

export interface ApiGatewayMock {
  get(url: string, data: unknown): void;
  post(url: string, data: unknown): void;
  put(url: string, data: unknown): void;
  delete(url: string, data: unknown): void;
  patch(url: string, data: unknown): void;
  rejectGet(url: string, error: Error): void;
  rejectPost(url: string, error: Error): void;
  rejectPut(url: string, error: Error): void;
  rejectDelete(url: string, error: Error): void;
  rejectPatch(url: string, error: Error): void;
  reset(): void;
}

/**
 * Builds a URL-routed mock for apiGateway, for vitest specs that exercise
 * stores or components.
 *
 * Specs should mock apiGateway at the system boundary rather than mocking
 * individual api modules. This lets the real api module code execute, giving
 * unit tests an integration benefit while still keeping I/O stubbed. See
 * docs/vue-coding-rules.md for the full rule.
 *
 * Usage:
 *   vi.mock('../../api/api-gateway', () => ({
 *     default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), patch: vi.fn() },
 *   }));
 *
 *   const mockApiGateway = buildApiGatewayMock();
 *
 *   beforeEach(() => {
 *     mockApiGateway.reset();
 *     mockApiGateway.get('/budgets/future', []);
 *     mockApiGateway.get('/allocation_categories', []);
 *   });
 *
 *   it('does the thing', () => {
 *     mockApiGateway.get('/budgets/future', specificBudgets);
 *     // ...
 *   });
 *
 * Limitations (this is a prototype for the codebase-wide refactor):
 * - No support for mockResolvedValueOnce-style ordered sequences. Tests that
 *   need ordered responses should call vi.mocked(apiGateway.get).mockImplementationOnce(...)
 *   directly as an escape hatch.
 * - Routes accumulate across reset() calls — call mockApiGateway.reset() in
 *   beforeEach to start each test with a clean routing table.
 * - Exact URL string matching only. No path parameter or query string matching.
 */
export function buildApiGatewayMock(): ApiGatewayMock {
  const routes: Record<Method, Map<string, Route>> = {
    get: new Map(),
    post: new Map(),
    put: new Map(),
    delete: new Map(),
    patch: new Map(),
  };

  const methods: Method[] = ['get', 'post', 'put', 'delete', 'patch'];
  for (const method of methods) {
    (apiGateway[method] as unknown as Mock).mockImplementation((url: string) => {
      const route = routes[method].get(url);
      if (!route) {
        return Promise.reject(
          new Error(`Unexpected ${method.toUpperCase()} ${url} — no mock configured`),
        );
      }
      if (route.kind === 'reject') return Promise.reject(route.error);
      return Promise.resolve({ data: route.data });
    });
  }

  const setResolve = (method: Method) => (url: string, data: unknown) => {
    routes[method].set(url, { kind: 'resolve', data });
  };
  const setReject = (method: Method) => (url: string, error: Error) => {
    routes[method].set(url, { kind: 'reject', error });
  };

  return {
    get: setResolve('get'),
    post: setResolve('post'),
    put: setResolve('put'),
    delete: setResolve('delete'),
    patch: setResolve('patch'),
    rejectGet: setReject('get'),
    rejectPost: setReject('post'),
    rejectPut: setReject('put'),
    rejectDelete: setReject('delete'),
    rejectPatch: setReject('patch'),
    reset() {
      for (const m of methods) routes[m].clear();
    },
  };
}
