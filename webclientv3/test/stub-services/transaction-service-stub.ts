import { of } from "rxjs";

const TransactionServiceStub = {
  getTransactions: (_: any) => of([])
};

export { TransactionServiceStub };
