import { describe, it, expect, vi, beforeEach } from 'vitest';
import { specialEventApi } from './specialEventApi';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('specialEventApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('gets /special_events', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await specialEventApi.getAll();

      expect(apiGateway.get).toHaveBeenCalledWith('/special_events');
    });

    it('returns the response data', async () => {
      const events = [{ id: 1, name: 'Christmas 2025' }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: events });

      const result = await specialEventApi.getAll();

      expect(result).toEqual(events);
    });
  });

  describe('getOne', () => {
    it('gets /special_events/:id', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: { id: 3 } });

      await specialEventApi.getOne(3);

      expect(apiGateway.get).toHaveBeenCalledWith('/special_events/3');
    });

    it('returns the response data', async () => {
      const event = { id: 3, name: 'Birthday Party' };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: event });

      const result = await specialEventApi.getOne(3);

      expect(result).toEqual(event);
    });
  });

  describe('create', () => {
    it('posts to /special_events with wrapped payload', async () => {
      const data = { name: 'New Event', budget_amount: 50000 };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: { id: 1, ...data } });

      await specialEventApi.create(data);

      expect(apiGateway.post).toHaveBeenCalledWith('/special_events', {
        special_event: data,
      });
    });

    it('returns the response data', async () => {
      const data = { name: 'New Event', budget_amount: 50000 };
      const created = { id: 1, ...data };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: created });

      const result = await specialEventApi.create(data);

      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('puts to /special_events/:id with wrapped payload', async () => {
      const data = { name: 'Updated Event' };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: { id: 5, ...data } });

      await specialEventApi.update(5, data);

      expect(apiGateway.put).toHaveBeenCalledWith('/special_events/5', {
        special_event: data,
      });
    });

    it('returns the response data', async () => {
      const data = { name: 'Updated Event' };
      const updated = { id: 5, ...data };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: updated });

      const result = await specialEventApi.update(5, data);

      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('deletes /special_events/:id', async () => {
      vi.mocked(apiGateway.delete).mockResolvedValue({ data: undefined });

      await specialEventApi.delete(7);

      expect(apiGateway.delete).toHaveBeenCalledWith('/special_events/7');
    });

    it('resolves with void on success', async () => {
      vi.mocked(apiGateway.delete).mockResolvedValue({ data: undefined });

      const result = await specialEventApi.delete(7);

      expect(result).toBeUndefined();
    });
  });

  describe('updateAllocations', () => {
    it('puts to /special_events/:id/allocations with wrapped payload', async () => {
      const data = { allocation_ids: [10, 20, 30], actual_amount: 15000 };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: { id: 2 } });

      await specialEventApi.updateAllocations(2, data);

      expect(apiGateway.put).toHaveBeenCalledWith('/special_events/2/allocations', {
        special_event: data,
      });
    });

    it('returns the response data', async () => {
      const data = { allocation_ids: [10, 20], actual_amount: 12000 };
      const updated = { id: 2, name: 'Holiday', actual_amount: 12000 };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: updated });

      const result = await specialEventApi.updateAllocations(2, data);

      expect(result).toEqual(updated);
    });
  });
});
