import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeTool } from './toolExecutor';
import * as authTokens from '../../auth/authTokens';

vi.mock('../../auth/authTokens', () => ({
  getTokens: vi.fn(),
}));

const mockTokens = {
  'access-token': 'token-abc',
  client: 'client-xyz',
  expiry: '9999999999',
  'token-type': 'Bearer',
  uid: 'user@example.com',
};

describe('executeTool', () => {
  beforeEach(() => {
    vi.mocked(authTokens.getTokens).mockReturnValue(mockTokens);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('analyze_overspending', () => {
    it('fetches the overspending analysis endpoint with the given period', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({ categories: [] }), { status: 200 }));

      await executeTool('analyze_overspending', { period: '2026-03' });

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/mcp/overspending_analysis?period=2026-03',
        expect.objectContaining({
          headers: expect.objectContaining({ 'access-token': 'token-abc' }),
        }),
      );
    });

    it('attaches all auth headers from getTokens', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await executeTool('analyze_overspending', { period: '2026-03' });

      const calledHeaders = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<
        string,
        string
      >;
      expect(calledHeaders['access-token']).toBe('token-abc');
      expect(calledHeaders['client']).toBe('client-xyz');
      expect(calledHeaders['expiry']).toBe('9999999999');
      expect(calledHeaders['token-type']).toBe('Bearer');
      expect(calledHeaders['uid']).toBe('user@example.com');
    });

    it('returns the response JSON stringified', async () => {
      const payload = { categories: [{ name: 'Food', overspend: 5000 }] };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(payload), { status: 200 }),
      );

      const result = await executeTool('analyze_overspending', { period: '2026-03' });

      expect(result).toBe(JSON.stringify(payload));
    });

    it('URL-encodes the period parameter', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await executeTool('analyze_overspending', { period: '2026-03' });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('period=2026-03');
    });

    it('throws a descriptive error when the request fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Internal Server Error', { status: 500, statusText: 'Internal Server Error' }),
      );

      await expect(executeTool('analyze_overspending', { period: '2026-03' })).rejects.toThrow(
        'analyze_overspending failed: 500',
      );
    });

    it('skips null auth header values', async () => {
      vi.mocked(authTokens.getTokens).mockReturnValue({
        'access-token': 'token-abc',
        client: null,
        expiry: null,
        'token-type': 'Bearer',
        uid: 'user@example.com',
      });
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await executeTool('analyze_overspending', { period: '2026-03' });

      const calledHeaders = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<
        string,
        string
      >;
      expect('client' in calledHeaders).toBe(false);
      expect('expiry' in calledHeaders).toBe(false);
      expect(calledHeaders['access-token']).toBe('token-abc');
    });

    it('throws when period parameter is missing', async () => {
      await expect(executeTool('analyze_overspending', {})).rejects.toThrow(
        'missing required parameter "period"',
      );
    });

    it('throws when period parameter is not a string', async () => {
      await expect(executeTool('analyze_overspending', { period: 123 })).rejects.toThrow(
        'missing required parameter "period"',
      );
    });
  });

  describe('analyze_overspending_by_allocation', () => {
    it('fetches the allocation endpoint with the given period', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({ allocations: [] }), { status: 200 }));

      await executeTool('analyze_overspending_by_allocation', { period: '2026-03' });

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/mcp/overspending_analysis_by_allocation?period=2026-03',
        expect.objectContaining({
          headers: expect.objectContaining({ 'access-token': 'token-abc' }),
        }),
      );
    });

    it('appends the category query param when provided', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({ allocations: [] }), { status: 200 }));

      await executeTool('analyze_overspending_by_allocation', {
        period: '2026-03',
        category: 'Food Purchases/Dining Out',
      });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('category=Food%20Purchases%2FDining%20Out');
    });

    it('omits the category param when not provided', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({ allocations: [] }), { status: 200 }));

      await executeTool('analyze_overspending_by_allocation', { period: '2026-03' });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).not.toContain('category');
    });

    it('attaches all auth headers from getTokens', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await executeTool('analyze_overspending_by_allocation', { period: '2026-03' });

      const calledHeaders = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<
        string,
        string
      >;
      expect(calledHeaders['access-token']).toBe('token-abc');
      expect(calledHeaders['client']).toBe('client-xyz');
    });

    it('returns the response JSON stringified', async () => {
      const payload = { allocations: [{ allocation: 'Groceries', overspend: 2500 }] };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(payload), { status: 200 }),
      );

      const result = await executeTool('analyze_overspending_by_allocation', {
        period: '2026-03',
      });

      expect(result).toBe(JSON.stringify(payload));
    });

    it('throws a descriptive error when the request fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Internal Server Error', { status: 500, statusText: 'Internal Server Error' }),
      );

      await expect(
        executeTool('analyze_overspending_by_allocation', { period: '2026-03' }),
      ).rejects.toThrow('analyze_overspending_by_allocation failed: 500');
    });

    it('throws when period parameter is missing', async () => {
      await expect(executeTool('analyze_overspending_by_allocation', {})).rejects.toThrow(
        'missing required parameter "period"',
      );
    });

    it('throws when period parameter is not a string', async () => {
      await expect(
        executeTool('analyze_overspending_by_allocation', { period: 123 }),
      ).rejects.toThrow('missing required parameter "period"');
    });
  });

  describe('list_categories', () => {
    it('fetches the categories endpoint', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({ categories: [] }), { status: 200 }));

      await executeTool('list_categories', {});

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/mcp/categories',
        expect.objectContaining({
          headers: expect.objectContaining({ 'access-token': 'token-abc' }),
        }),
      );
    });

    it('attaches all auth headers from getTokens', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await executeTool('list_categories', {});

      const calledHeaders = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<
        string,
        string
      >;
      expect(calledHeaders['access-token']).toBe('token-abc');
      expect(calledHeaders['client']).toBe('client-xyz');
    });

    it('returns the response JSON stringified', async () => {
      const payload = { categories: [{ name: 'Food', exclude_from_overspend_tracking: false }] };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(payload), { status: 200 }),
      );

      const result = await executeTool('list_categories', {});

      expect(result).toBe(JSON.stringify(payload));
    });

    it('throws a descriptive error when the request fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Internal Server Error', { status: 500, statusText: 'Internal Server Error' }),
      );

      await expect(executeTool('list_categories', {})).rejects.toThrow(
        'list_categories failed: 500',
      );
    });
  });

  describe('unknown tool', () => {
    it('throws a descriptive error for an unrecognised tool name', async () => {
      await expect(executeTool('do_something_weird', {})).rejects.toThrow(
        'Unknown tool: do_something_weird',
      );
    });
  });
});
