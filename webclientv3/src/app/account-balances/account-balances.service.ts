import { Injectable } from '@angular/core';
import {ApiGateway} from "../../api/api-gateway.service";
import {Observable} from "rxjs/Observable";
import {BankAccountData} from "./bank-account.model";

@Injectable()
export class AccountBalancesService {

  bankAccounts$: Observable<BankAccountData[]>;

  constructor(
    private apiGateway: ApiGateway
  ) { }

  getAccountBalances$(): Observable<BankAccountData[]> {
    this.bankAccounts$ = this.apiGateway.get('/account_balances');
    return this.bankAccounts$;
  }

  netWorth(bankAccounts: BankAccountData[]){
    var net = 0;
    bankAccounts.forEach(bankAccount => {
      net += bankAccount.current_balance;
    });

    return net;
  }

  totalAssets(bankAccounts: BankAccountData[]){
    return bankAccounts
      .filter(a => a.account_category == 'asset')
      .reduce((acc, curr) => acc + curr.current_balance, 0);
  }

  totalLiabilities(bankAccounts: BankAccountData[]){
    return bankAccounts
      .filter(a => a.account_category == 'liability')
      .reduce((acc, curr) => acc + curr.current_balance, 0);
  }

  netCurrentCash(bankAccounts: BankAccountData[]){
    return bankAccounts
      .filter(a => a.account_category == 'current'
        || (a.account_category=='liability' && a.is_cash))
      .reduce((acc, curr) => acc + curr.current_balance, 0);
  }

  netCashAssets(bankAccounts: BankAccountData[]){
    return bankAccounts
      .filter(a => a.account_category == 'asset' && a.is_cash)
      .reduce((acc, curr) => acc + curr.current_balance, 0);
  }

  netNonCashAssets(bankAccounts: BankAccountData[]){
    return bankAccounts
      .filter(a => (a.account_category == 'asset' || a.account_category == 'liability') && !a.is_cash)
      .reduce((acc, curr) => acc + curr.current_balance, 0);
  }

}
