import { Injectable } from '@angular/core';
import {ApiGateway} from "../../api/api-gateway.service";
import {SinkFundAllocationData} from "../sink-funds/sink-fund-allocation-data.model";
import {BankAccountData} from "./bank-account.model";
import { Observable } from "rxjs";

@Injectable()
export class BankAccountService {

  constructor(
    private apiGateway: ApiGateway
  ) { }

  getBankAccounts(): Observable<BankAccountData[]> {
    return this.apiGateway.get('/bank_accounts');
  }

  getSinkFundAllocations(bankAccountId: number): Observable<SinkFundAllocationData[]> {
    return this.apiGateway.get('/sink_fund_allocations', {bank_account_id: bankAccountId});
  }
}
