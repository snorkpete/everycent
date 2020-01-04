import { Injectable } from "@angular/core";
import { ApiGateway } from "../../api/api-gateway.service";
import { Observable } from "rxjs";
import { SinkFundAllocationData } from "../sink-funds/sink-fund-allocation-data.model";
import { BankAccountData } from "./bank-account.model";

@Injectable()
export class BankAccountService {
  constructor(private apiGateway: ApiGateway) {}

  getBankAccounts(): Observable<BankAccountData[]> {
    return this.apiGateway.get("/bank_accounts");
  }

  getBankAccountsWithBalances(): Observable<BankAccountData[]> {
    return this.apiGateway.get("/bank_accounts", {
      include_current_balance: true
    });
  }

  getSinkFundAllocations(
    bankAccountId: number
  ): Observable<SinkFundAllocationData[]> {
    return this.apiGateway.get("/sink_fund_allocations", {
      bank_account_id: bankAccountId
    });
  }
}
