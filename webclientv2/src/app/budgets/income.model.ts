export interface IncomeData{
  id?: number,
  name: string,
  amount: number,
  bank_account?: any,
  bank_account_id: number,
  budget_id?: number,
  comment?: string,
  deleted?: boolean,
}

export class Income{
  private incomeData: IncomeData;

  set data(data: IncomeData){
    this.data = data;
  }
}
