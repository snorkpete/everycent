import { Injectable } from '@angular/core';
import {ApiGateway} from '../../api/api-gateway.service';
import {Observable} from 'rxjs/Observable';
import {TransactionData} from './transaction-data.model';
import {TransactionSearchParams} from "./transaction-search-form/transaction-search-params.model";

@Injectable()
export class TransactionService {

  constructor(
    private apiGateway: ApiGateway
  ) { }


  getTransactionsForSinkFundAllocation(sink_fund_allocation_id: number): Observable<TransactionData[]> {
    return this.apiGateway
          .get('/transactions/by_sink_fund_allocation', {sink_fund_allocation_id});
  }

  getTransactions(searchParams: TransactionSearchParams = {}): Observable<TransactionData[]> {
    return this.apiGateway
      .get('/transactions', searchParams);

  }
}
