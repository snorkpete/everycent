import {Injectable} from '@angular/core';
import {ApiGateway} from "../../api/api-gateway.service";
import {TransactionData} from "../transactions/transaction-data.model";
import { Observable } from "rxjs";

@Injectable()
export class SharedTransactionService {

  constructor(
    private apiGateway: ApiGateway
  ) { }

  transactionsForAllocation(allocation_id: number): Observable<TransactionData[]> {
    return this.apiGateway
      .get('/transactions/by_allocation',
        { allocation_id: allocation_id });
  }

  getTransactionsForSinkFundAllocation(sink_fund_allocation_id: number): Observable<TransactionData[]> {
    return this.apiGateway
      .get('/transactions/by_sink_fund_allocation', {sink_fund_allocation_id});
  }

}
