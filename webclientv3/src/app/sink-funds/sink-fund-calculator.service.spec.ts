
import {SampleSinkFundData} from '../../../test/samples/sample-sink-fund-data';
import {DeactivateService} from "../shared/deactivate-button/deactivate.service";
import {SinkFundData} from './sink-fund-data.model';
import {SinkFundCalculator} from './sink-fund-calculator.service';

describe('SinkFundCalculator', () => {
  let sample: SinkFundData;
  let calculator: SinkFundCalculator;

  beforeEach(() => {
    sample = {
      current_balance: 3000,
      sink_fund_allocations: [
        {target: 500, current_balance: 300},
        {target: 1500, current_balance: 100},
        {target: 400, current_balance: 400},
      ],
    };
    calculator = new SinkFundCalculator(new DeactivateService());
  });


  it('calculates the totalTarget', () => {
    expect(calculator.totalTarget(sample, true)).toEqual(2400);
  });

  it('#totalCurrentBalance ignores deleted items', () => {
    sample.sink_fund_allocations[1].deleted = true;
    expect(calculator.totalTarget(sample, true)).toEqual(900);
  });

  it('#totalAssignedBalance is the sum of all the allocation balances', () => {
    expect(calculator.totalAssignedBalance(sample)).toEqual(800);
  });

  it('#unassignedBalance is the money not currently assigned to allocations', () => {
    expect(calculator.unassignedBalance(sample)).toEqual(2200);
  });

  it('#unassignedBalance can be negative', () => {
    sample.sink_fund_allocations.push({ target: 0, current_balance: 4200 });
    expect(calculator.unassignedBalance(sample)).toEqual(-2000);
  });

  it('#allocationOutstanding gets the difference of target and current balance from the indexed allocation', () => {
    expect(calculator.allocationOutstandingAt(sample, 0)).toEqual(-200);
    expect(calculator.allocationOutstandingAt(sample, 1)).toEqual(-1400);
    expect(calculator.allocationOutstandingAt(sample, 2)).toEqual(0);
  });

  it('#totalOutstanding is the sum of all the outstanding amounts', () => {
    expect(calculator.totalOutstanding(sample, true)).toEqual(-1600);
  });

});

