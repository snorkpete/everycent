import { describe, it, expect, vi, beforeEach } from 'vitest';
import { allocationCategoryApi } from './allocationCategoryApi';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('allocationCategoryApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('gets /allocation_categories', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await allocationCategoryApi.getAll();

      expect(apiGateway.get).toHaveBeenCalledWith('/allocation_categories');
    });

    it('returns the response data', async () => {
      const categories = [{ id: 1, name: 'Groceries' }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: categories });

      const result = await allocationCategoryApi.getAll();

      expect(result).toEqual(categories);
    });
  });

  describe('create', () => {
    it('posts to /allocation_categories with category data', async () => {
      const category = { name: 'New Category' };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: { id: 1, ...category } });

      await allocationCategoryApi.create(category);

      expect(apiGateway.post).toHaveBeenCalledWith('/allocation_categories', category);
    });

    it('returns the response data', async () => {
      const category = { name: 'New Category' };
      const created = { id: 1, ...category };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: created });

      const result = await allocationCategoryApi.create(category);

      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('puts to /allocation_categories/:id with category data', async () => {
      const category = { id: 3, name: 'Updated Category' };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: category });

      await allocationCategoryApi.update(category);

      expect(apiGateway.put).toHaveBeenCalledWith('/allocation_categories/3', category);
    });

    it('returns the response data', async () => {
      const category = { id: 3, name: 'Updated Category' };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: category });

      const result = await allocationCategoryApi.update(category);

      expect(result).toEqual(category);
    });
  });
});
