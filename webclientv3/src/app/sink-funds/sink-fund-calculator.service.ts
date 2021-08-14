import { DeactivateService } from "../shared/deactivate-button/deactivate.service";
import { total } from "../util/total";
import { SinkFundAllocationData } from "./sink-fund-allocation-data.model";
import { SinkFundData } from "./sink-fund-data.model";

export class SinkFundCalculator {
  constructor(public deactivateService: DeactivateService) {}

  private sinkFundAllocationsOf(
    sinkFund: SinkFundData
  ): SinkFundAllocationData[] {
    if (sinkFund === null && sinkFund === undefined) {
      return [];
    }

    return sinkFund.sink_fund_allocations || [];
  }

  totalTarget(sinkFund: SinkFundData, showDeactivated: boolean): number {
    return total(
      this.sinkFundAllocationsOf(sinkFund)
        .filter(a => a.target > 0)
        .filter(allocation =>
          this.deactivateService.isItemVisible(allocation, showDeactivated)
        ),
      "target"
    );
  }

  totalOutstanding(sinkFund: SinkFundData, showDeactivated: boolean): number {
    return (
      total(
        this.sinkFundAllocationsOf(sinkFund)
          .filter(a => a.target > 0)
          .filter(allocation =>
            this.deactivateService.isItemVisible(allocation, showDeactivated)
          ),
        "current_balance"
      ) - this.totalTarget(sinkFund, showDeactivated)
    );
  }

  totalAssignedBalance(sinkFund: SinkFundData): number {
    return total(this.sinkFundAllocationsOf(sinkFund), "current_balance");
  }

  unassignedBalance(sinkFund: SinkFundData): number {
    if (sinkFund === null && sinkFund === undefined) {
      return 0;
    }
    return sinkFund.current_balance - this.totalAssignedBalance(sinkFund);
  }

  allocationOutstandingAt(sinkFund: SinkFundData, index: number): number {
    if (sinkFund === null && sinkFund === undefined) {
      return 0;
    }
    let allocation = sinkFund.sink_fund_allocations[index];
    return allocation.current_balance - allocation.target;
  }
}
