import { Injectable } from '@angular/core';
import {BudgetData} from "../budget.model";

@Injectable()
export class FutureBudgetsDataFormatterService {

  constructor() { }

  formatIncomesForDisplay(budgets: BudgetData[]) {
    // return [
    //   { name: "Kion's Salary", "Jan 23": 430000, "Feb 23": 430000, "Mar 23": 430000, "Apr 23": 430000 },
    //   { name: "Pat's Salary", "Jan 23": 230000, "Feb 23": 230000, "Mar 23": 210000, "Apr 23": 200000 },
    //   { name: "Brought Forward", "Jan 23": 5000, "Feb 23": 4300, "Mar 23": 0, "Apr 23": 0 },
    // ];

    // let incomes = this.getDistinctIncomes(budgets);
    // budgets.forEach(budget => {
    //
    // });
    let incomes = this.getIncomes(budgets);
    return incomes;
  }

  getIncomes(budgets) {
    let results = {

    };

    budgets.forEach(budget => {
      budget.incomes.forEach(income => {
        results[income.name] = results[income.name] || {};
        results[income.name][budget.name] = income.amount;
      });
    });

    return results;
    // return budgets.map(budgets.incomes)

  }
}
