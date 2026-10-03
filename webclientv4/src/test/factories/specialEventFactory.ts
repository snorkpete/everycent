import type {
  SpecialEventData,
  SpecialEventAllocationData,
  SpecialEventAllocationRow,
} from '../../app/special-events/specialEvent.types';

export function buildSpecialEventAllocationRow(
  overrides?: Partial<SpecialEventAllocationRow>,
): SpecialEventAllocationRow {
  return {
    key: '1',
    ids: [1],
    name: 'Decorations',
    budget_name: 'Mar 2026',
    allocation_category_name: 'Entertainment',
    amount: 20000,
    spent: 0,
    dialogAllocations: [{ id: 1, name: 'Decorations', label: 'Mar 2026' }],
    ...overrides,
  };
}

export function buildSpecialEventAllocation(
  overrides?: Partial<SpecialEventAllocationData>,
): SpecialEventAllocationData {
  return {
    id: 1,
    name: 'Decorations',
    amount: 20000,
    budget_id: 1,
    spent: 0,
    allocation_category_id: 1,
    budget_name: 'Mar 2026',
    budget_start_date: '2026-02-25',
    allocation_category_name: 'Entertainment',
    ...overrides,
  };
}

export function buildSpecialEvent(overrides?: Partial<SpecialEventData>): SpecialEventData {
  return {
    id: 1,
    name: 'Birthday Party',
    budget_amount: 50000,
    actual_amount: 0,
    start_date: '2026-06-15',
    allocations: [],
    ...overrides,
  };
}
