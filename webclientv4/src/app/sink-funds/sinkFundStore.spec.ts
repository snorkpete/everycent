import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSinkFundStore } from './sinkFundStore';
import { sinkFundApi } from './sinkFundApi';
import type { SinkFundData } from './sinkFund.types';

vi.mock('./sinkFundApi', () => ({
  sinkFundApi: {
    getAll: vi.fn(),
    get: vi.fn(),
    save: vi.fn(),
    transfer: vi.fn(),
  },
}));

const makeAllocation = (overrides = {}) => ({
  id: 1,
  name: 'Car repairs',
  amount: 10000,
  status: 'open',
  current_balance: 5000,
  target: 20000,
  ...overrides,
});

const makeSinkFund = (overrides: Partial<SinkFundData> = {}): SinkFundData => ({
  id: 3,
  name: 'Rainy Day Fund',
  current_balance: 80000,
  sink_fund_allocations: [makeAllocation()],
  ...overrides,
});

describe('sinkFundStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('fetches and stores all sink funds', async () => {
      const funds = [
        { id: 1, name: 'Fund A' },
        { id: 2, name: 'Fund B' },
      ];
      vi.mocked(sinkFundApi.getAll).mockResolvedValue(funds);

      const store = useSinkFundStore();
      await store.fetchAll();

      expect(store.sinkFunds).toEqual(funds);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(sinkFundApi.getAll).mockImplementation(async () => {
        loadingDuringCall = useSinkFundStore().loading;
        return [];
      });

      const store = useSinkFundStore();
      await store.fetchAll();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error and re-throws on failure', async () => {
      vi.mocked(sinkFundApi.getAll).mockRejectedValue(new Error('Network error'));

      const store = useSinkFundStore();
      await expect(store.fetchAll()).rejects.toThrow('Network error');

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('clears error on subsequent successful fetch', async () => {
      vi.mocked(sinkFundApi.getAll).mockRejectedValueOnce(new Error('fail'));
      vi.mocked(sinkFundApi.getAll).mockResolvedValueOnce([]);

      const store = useSinkFundStore();
      await store.fetchAll().catch(() => {});
      await store.fetchAll();

      expect(store.error).toBeNull();
    });
  });

  describe('fetchDetail', () => {
    it('fetches and stores the sink fund detail', async () => {
      const fund = makeSinkFund();
      vi.mocked(sinkFundApi.get).mockResolvedValue(fund);

      const store = useSinkFundStore();
      await store.fetchDetail(3);

      expect(store.sinkFund).toEqual(fund);
      expect(sinkFundApi.get).toHaveBeenCalledWith(3);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(sinkFundApi.get).mockImplementation(async () => {
        loadingDuringCall = useSinkFundStore().loading;
        return makeSinkFund();
      });

      const store = useSinkFundStore();
      await store.fetchDetail(3);

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error and re-throws on failure', async () => {
      vi.mocked(sinkFundApi.get).mockRejectedValue(new Error('Not found'));

      const store = useSinkFundStore();
      await expect(store.fetchDetail(99)).rejects.toThrow('Not found');

      expect(store.error).toBe('Not found');
    });
  });

  describe('save', () => {
    it('does nothing if sinkFund is null', async () => {
      const store = useSinkFundStore();
      store.sinkFund = null;

      await store.save();

      expect(sinkFundApi.save).not.toHaveBeenCalled();
    });

    it('calls sinkFundApi.save with the current sink fund', async () => {
      const fund = makeSinkFund();
      vi.mocked(sinkFundApi.save).mockResolvedValue(fund);

      const store = useSinkFundStore();
      store.sinkFund = fund;
      await store.save();

      expect(sinkFundApi.save).toHaveBeenCalledWith(fund);
    });

    it('updates sinkFund with the saved response', async () => {
      const fund = makeSinkFund();
      const saved = { ...fund, current_balance: 90000 };
      vi.mocked(sinkFundApi.save).mockResolvedValue(saved);

      const store = useSinkFundStore();
      store.sinkFund = fund;
      await store.save();

      expect(store.sinkFund).toEqual(saved);
    });

    it('exits edit mode after successful save', async () => {
      const fund = makeSinkFund();
      vi.mocked(sinkFundApi.save).mockResolvedValue(fund);

      const store = useSinkFundStore();
      store.sinkFund = fund;
      store.enterEditMode();
      await store.save();

      expect(store.isEditMode).toBe(false);
    });

    it('sets error and re-throws on failure', async () => {
      const fund = makeSinkFund();
      vi.mocked(sinkFundApi.save).mockRejectedValue(new Error('Save failed'));

      const store = useSinkFundStore();
      store.sinkFund = fund;
      await expect(store.save()).rejects.toThrow('Save failed');

      expect(store.error).toBe('Save failed');
      expect(store.loading).toBe(false);
    });

    it('sets loading to true during save and false after', async () => {
      const fund = makeSinkFund();
      let loadingDuringSave = false;
      vi.mocked(sinkFundApi.save).mockImplementation(async () => {
        loadingDuringSave = useSinkFundStore().loading;
        return fund;
      });

      const store = useSinkFundStore();
      store.sinkFund = fund;
      await store.save();

      expect(loadingDuringSave).toBe(true);
      expect(store.loading).toBe(false);
    });
  });

  describe('enterEditMode / exitEditMode', () => {
    it('sets isEditMode to true', () => {
      const store = useSinkFundStore();
      store.enterEditMode();
      expect(store.isEditMode).toBe(true);
    });

    it('sets isEditMode to false', () => {
      const store = useSinkFundStore();
      store.enterEditMode();
      store.exitEditMode();
      expect(store.isEditMode).toBe(false);
    });
  });

  describe('addObligation', () => {
    it('does nothing if sinkFund is null', () => {
      const store = useSinkFundStore();
      store.sinkFund = null;

      store.addObligation();

      expect(store.sinkFund).toBeNull();
    });

    it('initialises sink_fund_allocations array if missing', () => {
      const store = useSinkFundStore();
      store.sinkFund = makeSinkFund({ sink_fund_allocations: undefined });

      store.addObligation();

      expect(store.sinkFund!.sink_fund_allocations).toHaveLength(1);
    });

    it('appends a new obligation with default values', () => {
      const store = useSinkFundStore();
      store.sinkFund = makeSinkFund({ sink_fund_allocations: [] });

      store.addObligation();

      expect(store.sinkFund!.sink_fund_allocations).toEqual([
        { name: '', amount: 0, status: 'open', unsaved: true },
      ]);
    });

    it('appends to existing obligations', () => {
      const existing = makeAllocation({ id: 1, name: 'Existing' });
      const store = useSinkFundStore();
      store.sinkFund = makeSinkFund({ sink_fund_allocations: [existing] });

      store.addObligation();

      expect(store.sinkFund!.sink_fund_allocations).toHaveLength(2);
    });
  });

  describe('cancelEdit', () => {
    it('exits edit mode and re-fetches the sink fund', async () => {
      const fund = makeSinkFund();
      vi.mocked(sinkFundApi.get).mockResolvedValue(fund);

      const store = useSinkFundStore();
      store.sinkFund = fund;
      store.enterEditMode();
      await store.cancelEdit();

      expect(store.isEditMode).toBe(false);
      expect(sinkFundApi.get).toHaveBeenCalledWith(fund.id);
    });

    it('does nothing if sinkFund has no id', async () => {
      const store = useSinkFundStore();
      store.sinkFund = { name: 'No id fund' };
      store.enterEditMode();
      await store.cancelEdit();

      expect(sinkFundApi.get).not.toHaveBeenCalled();
    });
  });

  describe('visibleAllocations', () => {
    it('returns only open allocations when showDeactivated is false', () => {
      const store = useSinkFundStore();
      store.sinkFund = makeSinkFund({
        sink_fund_allocations: [
          makeAllocation({ id: 1, status: 'open' }),
          makeAllocation({ id: 2, status: 'closed' }),
        ],
      });
      store.showDeactivated = false;

      expect(store.visibleAllocations).toHaveLength(1);
      expect(store.visibleAllocations[0].id).toBe(1);
    });

    it('returns all allocations when showDeactivated is true', () => {
      const store = useSinkFundStore();
      store.sinkFund = makeSinkFund({
        sink_fund_allocations: [
          makeAllocation({ id: 1, status: 'open' }),
          makeAllocation({ id: 2, status: 'closed' }),
        ],
      });
      store.showDeactivated = true;

      expect(store.visibleAllocations).toHaveLength(2);
    });

    it('returns empty array when sinkFund is null', () => {
      const store = useSinkFundStore();
      store.sinkFund = null;

      expect(store.visibleAllocations).toEqual([]);
    });
  });

  describe('totalAssignedBalance', () => {
    it('sums current_balance of all allocations', () => {
      const store = useSinkFundStore();
      store.sinkFund = makeSinkFund({
        sink_fund_allocations: [
          makeAllocation({ current_balance: 5000 }),
          makeAllocation({ id: 2, current_balance: 3000 }),
        ],
      });

      expect(store.totalAssignedBalance).toBe(8000);
    });

    it('returns 0 when there are no allocations', () => {
      const store = useSinkFundStore();
      store.sinkFund = makeSinkFund({ sink_fund_allocations: [] });

      expect(store.totalAssignedBalance).toBe(0);
    });

    it('returns 0 when sinkFund is null', () => {
      const store = useSinkFundStore();
      store.sinkFund = null;

      expect(store.totalAssignedBalance).toBe(0);
    });
  });

  describe('unassignedBalance', () => {
    it('returns sinkFund.current_balance minus totalAssignedBalance', () => {
      const store = useSinkFundStore();
      store.sinkFund = makeSinkFund({
        current_balance: 80000,
        sink_fund_allocations: [makeAllocation({ current_balance: 5000 })],
      });

      expect(store.unassignedBalance).toBe(75000);
    });

    it('returns 0 when sinkFund is null', () => {
      const store = useSinkFundStore();
      store.sinkFund = null;

      expect(store.unassignedBalance).toBe(0);
    });
  });

  describe('totalTarget', () => {
    it('sums target of visible allocations where target > 0', () => {
      const store = useSinkFundStore();
      store.sinkFund = makeSinkFund({
        sink_fund_allocations: [
          makeAllocation({ id: 1, status: 'open', target: 20000 }),
          makeAllocation({ id: 2, status: 'open', target: 0 }),
          makeAllocation({ id: 3, status: 'open', target: 10000 }),
        ],
      });

      expect(store.totalTarget).toBe(30000);
    });

    it('excludes closed allocations when showDeactivated is false', () => {
      const store = useSinkFundStore();
      store.sinkFund = makeSinkFund({
        sink_fund_allocations: [
          makeAllocation({ id: 1, status: 'open', target: 20000 }),
          makeAllocation({ id: 2, status: 'closed', target: 10000 }),
        ],
      });
      store.showDeactivated = false;

      expect(store.totalTarget).toBe(20000);
    });
  });

  describe('totalOutstanding', () => {
    it('sums (current_balance - target) for visible allocations where target > 0', () => {
      const store = useSinkFundStore();
      store.sinkFund = makeSinkFund({
        sink_fund_allocations: [
          makeAllocation({ id: 1, status: 'open', current_balance: 5000, target: 20000 }),
          makeAllocation({ id: 2, status: 'open', current_balance: 8000, target: 10000 }),
          makeAllocation({ id: 3, status: 'open', current_balance: 2000, target: 0 }),
        ],
      });

      // (5000 - 20000) + (8000 - 10000) = -15000 + -2000 = -17000
      expect(store.totalOutstanding).toBe(-17000);
    });

    it('excludes closed allocations when showDeactivated is false', () => {
      const store = useSinkFundStore();
      store.sinkFund = makeSinkFund({
        sink_fund_allocations: [
          makeAllocation({ id: 1, status: 'open', current_balance: 5000, target: 20000 }),
          makeAllocation({ id: 2, status: 'closed', current_balance: 9000, target: 10000 }),
        ],
      });
      store.showDeactivated = false;

      expect(store.totalOutstanding).toBe(-15000);
    });
  });
});
