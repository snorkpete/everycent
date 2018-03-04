import { TestBed, inject } from '@angular/core/testing';

import { FutureBudgetsDataFormatterService } from './future-budgets-data-formatter.service';

describe('FutureBudgetsDataFormatterService', () => {
  let formatter: FutureBudgetsDataFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FutureBudgetsDataFormatterService]
    });
  });

  beforeEach(() => {
    formatter = TestBed.get(FutureBudgetsDataFormatterService);
  })

  it('should be created', () => {
    expect(formatter).toBeTruthy();
  });

  describe('Format Incomes', () => {
    it('exists', () => {
      expect(formatter.formatIncomesForDisplay).toBeDefined();
    });

    describe("when budget list is 1 item", () => {
      let budgets = [
        { name: 'January', incomes: [{ name: 'Kion', amount: 100}, { name: 'Pat', amount: 200}]},
        { name: 'February', incomes: [{ name: 'Kion', amount: 100}, { name: 'Pat', amount: 400}, { name: 'Brought Forward', amount: 50}, ]},
      ];

      xit('returns a list of incomes from the budget', () => {
        let output = formatter.formatIncomesForDisplay(budgets);
        expect(output).toBe(2);
      });
    });

  });
});
