import { Injectable } from '@angular/core';
import {BudgetData} from "../budget.model";

@Injectable()
export class FutureBudgetsDataFormatterService {

  constructor() { }

  formatIncomesForDisplay(budgets: BudgetData[]) {
    let results = { };

    budgets.forEach(budget => {
      budget.incomes.forEach(income => {
        results[income.name] = results[income.name] || {};
        results[income.name][budget.name] = income.amount;
      });
    });

    return results;
  }

  formatAllocationsForDisplay(budgets: BudgetData[]) {
    let results = { };

    budgets.forEach(budget => {
      budget.allocations.forEach(allocation => {
        results[allocation.name] = results[allocation.name] || {};
        results[allocation.name][budget.name] = allocation.amount;
      });
    });

    return results;
  }
}
