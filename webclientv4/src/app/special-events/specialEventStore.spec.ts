import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSpecialEventStore } from './specialEventStore';
import { specialEventApi } from './specialEventApi';
import type { SpecialEventData } from './specialEvent.types';

vi.mock('./specialEventApi', () => ({
  specialEventApi: {
    getAll: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateAllocations: vi.fn(),
  },
}));

const sampleEvent: SpecialEventData = {
  id: 1,
  name: 'Christmas 2026',
  budget_amount: 500,
  actual_amount: 420,
  start_date: '2026-12-25',
};

const sampleEventWithAllocations: SpecialEventData = {
  ...sampleEvent,
  allocations: [
    { id: 10, name: 'Gifts', amount: 300, spent: 250 },
    { id: 11, name: 'Food', amount: 200, spent: 170 },
  ],
};

describe('specialEventStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has empty default state', () => {
      const store = useSpecialEventStore();

      expect(store.specialEvents).toEqual([]);
      expect(store.currentSpecialEvent).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('fetchAll', () => {
    it('fetches and stores special events', async () => {
      const events = [sampleEvent];
      vi.mocked(specialEventApi.getAll).mockResolvedValue(events);

      const store = useSpecialEventStore();
      await store.fetchAll();

      expect(store.specialEvents).toEqual(events);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(specialEventApi.getAll).mockImplementation(async () => {
        loadingDuringCall = useSpecialEventStore().loading;
        return [];
      });

      const store = useSpecialEventStore();
      await store.fetchAll();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure and re-throws', async () => {
      vi.mocked(specialEventApi.getAll).mockRejectedValue(new Error('Network error'));

      const store = useSpecialEventStore();
      await expect(store.fetchAll()).rejects.toThrow('Network error');

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('sets a fallback error message when the rejection is not an Error instance', async () => {
      vi.mocked(specialEventApi.getAll).mockRejectedValue('unexpected');

      const store = useSpecialEventStore();
      await store.fetchAll().catch(() => {});

      expect(store.error).toBe('Failed to load special events');
    });

    it('clears error on subsequent successful fetch', async () => {
      vi.mocked(specialEventApi.getAll).mockRejectedValueOnce(new Error('fail'));
      vi.mocked(specialEventApi.getAll).mockResolvedValueOnce([]);

      const store = useSpecialEventStore();
      await store.fetchAll().catch(() => {});
      await store.fetchAll();

      expect(store.error).toBeNull();
    });
  });

  describe('fetchOne', () => {
    it('fetches and stores a single special event with allocations', async () => {
      vi.mocked(specialEventApi.getOne).mockResolvedValue(sampleEventWithAllocations);

      const store = useSpecialEventStore();
      await store.fetchOne(1);

      expect(specialEventApi.getOne).toHaveBeenCalledWith(1);
      expect(store.currentSpecialEvent).toEqual(sampleEventWithAllocations);
      expect(store.currentSpecialEvent?.allocations).toHaveLength(2);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(specialEventApi.getOne).mockImplementation(async () => {
        loadingDuringCall = useSpecialEventStore().loading;
        return sampleEvent;
      });

      const store = useSpecialEventStore();
      await store.fetchOne(1);

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure and re-throws', async () => {
      vi.mocked(specialEventApi.getOne).mockRejectedValue(new Error('Not found'));

      const store = useSpecialEventStore();
      await expect(store.fetchOne(99)).rejects.toThrow('Not found');

      expect(store.error).toBe('Not found');
      expect(store.loading).toBe(false);
    });

    it('sets a fallback error message when the rejection is not an Error instance', async () => {
      vi.mocked(specialEventApi.getOne).mockRejectedValue('unexpected');

      const store = useSpecialEventStore();
      await store.fetchOne(1).catch(() => {});

      expect(store.error).toBe('Failed to load special event');
    });
  });

  describe('create', () => {
    it('creates a special event and refreshes the list', async () => {
      const newEvent = { name: 'Birthday Party', budget_amount: 200 };
      vi.mocked(specialEventApi.create).mockResolvedValue({ id: 2, ...newEvent });
      vi.mocked(specialEventApi.getAll).mockResolvedValue([sampleEvent, { id: 2, ...newEvent }]);

      const store = useSpecialEventStore();
      await store.create(newEvent);

      expect(specialEventApi.create).toHaveBeenCalledWith(newEvent);
      expect(store.specialEvents).toHaveLength(2);
    });

    it('sets loading to true during create and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(specialEventApi.create).mockImplementation(async () => {
        loadingDuringCall = useSpecialEventStore().loading;
        return sampleEvent;
      });
      vi.mocked(specialEventApi.getAll).mockResolvedValue([]);

      const store = useSpecialEventStore();
      await store.create({ name: 'Test' });

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure and re-throws', async () => {
      vi.mocked(specialEventApi.create).mockRejectedValue(new Error('Validation failed'));

      const store = useSpecialEventStore();
      await expect(store.create({ name: '' })).rejects.toThrow('Validation failed');

      expect(store.error).toBe('Validation failed');
      expect(store.loading).toBe(false);
    });

    it('sets a fallback error message when the rejection is not an Error instance', async () => {
      vi.mocked(specialEventApi.create).mockRejectedValue('unexpected');

      const store = useSpecialEventStore();
      await store.create({ name: '' }).catch(() => {});

      expect(store.error).toBe('Failed to create special event');
    });
  });

  describe('update', () => {
    it('updates a special event and refreshes the list', async () => {
      const updated = { ...sampleEvent, name: 'Christmas 2026 Updated' };
      vi.mocked(specialEventApi.update).mockResolvedValue(updated);
      vi.mocked(specialEventApi.getAll).mockResolvedValue([updated]);

      const store = useSpecialEventStore();
      await store.update(1, { name: 'Christmas 2026 Updated' });

      expect(specialEventApi.update).toHaveBeenCalledWith(1, { name: 'Christmas 2026 Updated' });
      expect(store.specialEvents).toEqual([updated]);
    });

    it('sets loading to true during update and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(specialEventApi.update).mockImplementation(async () => {
        loadingDuringCall = useSpecialEventStore().loading;
        return sampleEvent;
      });
      vi.mocked(specialEventApi.getAll).mockResolvedValue([]);

      const store = useSpecialEventStore();
      await store.update(1, { name: 'Test' });

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure and re-throws', async () => {
      vi.mocked(specialEventApi.update).mockRejectedValue(new Error('Server error'));

      const store = useSpecialEventStore();
      await expect(store.update(1, { name: 'Bad' })).rejects.toThrow('Server error');

      expect(store.error).toBe('Server error');
      expect(store.loading).toBe(false);
    });

    it('sets a fallback error message when the rejection is not an Error instance', async () => {
      vi.mocked(specialEventApi.update).mockRejectedValue('unexpected');

      const store = useSpecialEventStore();
      await store.update(1, { name: 'Bad' }).catch(() => {});

      expect(store.error).toBe('Failed to update special event');
    });
  });

  describe('remove', () => {
    it('deletes a special event and refreshes the list', async () => {
      vi.mocked(specialEventApi.delete).mockResolvedValue(undefined);
      vi.mocked(specialEventApi.getAll).mockResolvedValue([]);

      const store = useSpecialEventStore();
      store.specialEvents = [sampleEvent];
      await store.remove(1);

      expect(specialEventApi.delete).toHaveBeenCalledWith(1);
      expect(store.specialEvents).toEqual([]);
    });

    it('sets loading to true during remove and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(specialEventApi.delete).mockImplementation(async () => {
        loadingDuringCall = useSpecialEventStore().loading;
        return undefined;
      });
      vi.mocked(specialEventApi.getAll).mockResolvedValue([]);

      const store = useSpecialEventStore();
      await store.remove(1);

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure and re-throws', async () => {
      vi.mocked(specialEventApi.delete).mockRejectedValue(new Error('Cannot delete'));

      const store = useSpecialEventStore();
      await expect(store.remove(1)).rejects.toThrow('Cannot delete');

      expect(store.error).toBe('Cannot delete');
      expect(store.loading).toBe(false);
    });

    it('sets a fallback error message when the rejection is not an Error instance', async () => {
      vi.mocked(specialEventApi.delete).mockRejectedValue('unexpected');

      const store = useSpecialEventStore();
      await store.remove(1).catch(() => {});

      expect(store.error).toBe('Failed to delete special event');
    });
  });

  describe('updateAllocations', () => {
    it('updates allocations and sets currentSpecialEvent with the response', async () => {
      vi.mocked(specialEventApi.updateAllocations).mockResolvedValue(sampleEventWithAllocations);

      const store = useSpecialEventStore();
      const data = { allocation_ids: [10, 11], actual_amount: 420 };
      await store.updateAllocations(1, data);

      expect(specialEventApi.updateAllocations).toHaveBeenCalledWith(1, data);
      expect(store.currentSpecialEvent).toEqual(sampleEventWithAllocations);
    });

    it('sets loading to true during updateAllocations and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(specialEventApi.updateAllocations).mockImplementation(async () => {
        loadingDuringCall = useSpecialEventStore().loading;
        return sampleEventWithAllocations;
      });

      const store = useSpecialEventStore();
      await store.updateAllocations(1, { allocation_ids: [], actual_amount: 0 });

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure and re-throws', async () => {
      vi.mocked(specialEventApi.updateAllocations).mockRejectedValue(new Error('Allocation error'));

      const store = useSpecialEventStore();
      await expect(
        store.updateAllocations(1, { allocation_ids: [], actual_amount: 0 }),
      ).rejects.toThrow('Allocation error');

      expect(store.error).toBe('Allocation error');
      expect(store.loading).toBe(false);
    });

    it('sets a fallback error message when the rejection is not an Error instance', async () => {
      vi.mocked(specialEventApi.updateAllocations).mockRejectedValue('unexpected');

      const store = useSpecialEventStore();
      await store.updateAllocations(1, { allocation_ids: [], actual_amount: 0 }).catch(() => {});

      expect(store.error).toBe('Failed to update special event allocations');
    });
  });
});
