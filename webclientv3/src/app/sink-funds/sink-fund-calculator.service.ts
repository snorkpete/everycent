import {SinkFundData} from './sink-fund-data.model';
import {total} from '../util/total';
import {isNullOrUndefined} from 'util';
import {SinkFundAllocationData} from './sink-fund-allocation-data.model';

export class SinkFundCalculator {

  constructor() { }

  private sinkFundAllocationsOf(sinkFund: SinkFundData): SinkFundAllocationData[] {
    if (isNullOrUndefined(sinkFund)) {
      return [];
    }

    return sinkFund.sink_fund_allocations || [];
  }

  totalTarget(sinkFund: SinkFundData): number {
    return total(this.sinkFundAllocationsOf(sinkFund), 'target');
  }

  totalOutstanding(sinkFund: SinkFundData): number {
    return this.totalAssignedBalance(sinkFund) - this.totalTarget(sinkFund);
  }

  totalAssignedBalance(sinkFund: SinkFundData): number {
    return total(this.sinkFundAllocationsOf(sinkFund), 'current_balance');
  }

  unassignedBalance(sinkFund: SinkFundData): number {
    if (isNullOrUndefined(sinkFund)) {
      return 0;
    }
    return sinkFund.current_balance - this.totalAssignedBalance(sinkFund);
  }

  allocationOutstandingAt(sinkFund: SinkFundData, index: number): number {
    if (isNullOrUndefined(sinkFund)) {
      return 0;
    }
    let allocation = sinkFund.sink_fund_allocations[index];
    return allocation.current_balance - allocation.target;
  }

}
