import {IncomeData} from "./income.model";
export interface BudgetData{
  id: number,
  name: string,
  start_date: string,
  end_date: string,
  status: string,
  incomes: IncomeData[],
  allocations: any[],
}

export class Budget{
  private budgetData;

  set data(budgetData: any){
    this.budgetData = budgetData;
  }
}
