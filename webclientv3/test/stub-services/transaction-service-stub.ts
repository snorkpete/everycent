import {Observable} from "rxjs/Observable";

const TransactionServiceStub = {
  getTransactions: (_: any) => Observable.of([])
};

export {TransactionServiceStub};

