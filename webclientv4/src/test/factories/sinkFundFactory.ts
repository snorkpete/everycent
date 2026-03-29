import type { SinkFundAllocationData, SinkFundData } from '../../app/sink-funds/sinkFund.types';

export function buildSinkFundAllocation(
  overrides?: Partial<SinkFundAllocationData>,
): SinkFundAllocationData {
  return {
    id: 1,
    name: 'Car Repair',
    amount: 10000,
    bank_account_id: 3,
    current_balance: 50000,
    target: 100000,
    status: 'open',
    deleted: false,
    ...overrides,
  };
}

export function buildSinkFund(overrides?: Partial<SinkFundData>): SinkFundData {
  return {
    id: 1,
    name: 'Emergency Fund',
    account_type: 'savings',
    account_category: 'Asset',
    opening_balance: 0,
    closing_balance: 50000,
    current_balance: 50000,
    is_sink_fund: true,
    sink_fund_allocations: [buildSinkFundAllocation()],
    ...overrides,
  };
}
